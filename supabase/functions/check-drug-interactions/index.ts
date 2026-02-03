import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenFDA API for drug validation
const OPENFDA_DRUG_API = 'https://api.fda.gov/drug/label.json';

interface DrugInfo {
  brand_name?: string;
  generic_name?: string;
  drug_interactions?: string[];
  warnings?: string[];
}

interface Interaction {
  drug1: string;
  drug2: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

// Validate drug exists in FDA database
async function validateDrug(drugName: string): Promise<DrugInfo | null> {
  try {
    const searchTerm = encodeURIComponent(drugName.toLowerCase());
    const response = await fetch(
      `${OPENFDA_DRUG_API}?search=(openfda.brand_name:"${searchTerm}"+OR+openfda.generic_name:"${searchTerm}")&limit=1`
    );
    
    if (!response.ok) {
      console.log(`Drug not found in FDA database: ${drugName}`);
      return null;
    }
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return null;
    }
    
    const result = data.results[0];
    return {
      brand_name: result.openfda?.brand_name?.[0],
      generic_name: result.openfda?.generic_name?.[0],
      drug_interactions: result.drug_interactions || [],
      warnings: result.warnings || [],
    };
  } catch (error) {
    console.error(`Error validating drug ${drugName}:`, error);
    return null;
  }
}

// Check for interactions using FDA drug interaction data
async function checkFDAInteractions(drugs: string[]): Promise<Interaction[]> {
  const interactions: Interaction[] = [];
  const drugInfoMap = new Map<string, DrugInfo>();
  
  // Fetch drug info for all drugs
  for (const drug of drugs) {
    const info = await validateDrug(drug);
    if (info) {
      drugInfoMap.set(drug.toLowerCase(), info);
    }
  }
  
  // Check each drug's interaction warnings against other drugs in the list
  for (const [drugName, drugInfo] of drugInfoMap) {
    if (!drugInfo.drug_interactions) continue;
    
    const interactionText = drugInfo.drug_interactions.join(' ').toLowerCase();
    
    for (const otherDrug of drugs) {
      if (otherDrug.toLowerCase() === drugName) continue;
      
      const otherInfo = drugInfoMap.get(otherDrug.toLowerCase());
      const searchTerms = [
        otherDrug.toLowerCase(),
        otherInfo?.generic_name?.toLowerCase(),
        otherInfo?.brand_name?.toLowerCase(),
      ].filter(Boolean);
      
      for (const term of searchTerms) {
        if (term && interactionText.includes(term)) {
          // Determine severity based on keywords
          let severity: 'low' | 'moderate' | 'high' | 'critical' = 'moderate';
          if (interactionText.includes('contraindicated') || interactionText.includes('fatal') || interactionText.includes('death')) {
            severity = 'critical';
          } else if (interactionText.includes('serious') || interactionText.includes('severe') || interactionText.includes('avoid')) {
            severity = 'high';
          } else if (interactionText.includes('caution') || interactionText.includes('monitor')) {
            severity = 'low';
          }
          
          // Extract relevant section of interaction text
          const matchIndex = interactionText.indexOf(term);
          const start = Math.max(0, matchIndex - 100);
          const end = Math.min(interactionText.length, matchIndex + term.length + 200);
          const context = interactionText.substring(start, end);
          
          interactions.push({
            drug1: drugInfo.brand_name || drugInfo.generic_name || drugName,
            drug2: otherInfo?.brand_name || otherInfo?.generic_name || otherDrug,
            severity,
            description: `Potential interaction found in FDA drug labeling: ...${context}...`,
            recommendation: severity === 'critical' 
              ? 'These medications should not be used together. Consider alternative therapy.'
              : severity === 'high'
              ? 'Use with extreme caution. Close monitoring required.'
              : 'Monitor patient closely for adverse effects.',
          });
          break;
        }
      }
    }
  }
  
  // Remove duplicates (A+B and B+A)
  const seen = new Set<string>();
  return interactions.filter(interaction => {
    const key1 = `${interaction.drug1.toLowerCase()}-${interaction.drug2.toLowerCase()}`;
    const key2 = `${interaction.drug2.toLowerCase()}-${interaction.drug1.toLowerCase()}`;
    if (seen.has(key1) || seen.has(key2)) {
      return false;
    }
    seen.add(key1);
    return true;
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No valid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate user token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // Verify user has doctor or admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError || !roleData || !['doctor', 'admin'].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Only doctors and admins can check drug interactions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const { drugs } = await req.json();

    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Please provide at least 2 drugs to check for interactions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate drug names (basic sanitization)
    const sanitizedDrugs = drugs
      .map((drug: unknown) => {
        if (typeof drug !== 'string') return null;
        // Remove any special characters except spaces and hyphens
        return drug.replace(/[^a-zA-Z0-9\s\-]/g, '').trim().substring(0, 100);
      })
      .filter((drug): drug is string => drug !== null && drug.length > 0);

    if (sanitizedDrugs.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Please provide at least 2 valid drug names' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${userId} checking interactions for drugs:`, sanitizedDrugs);

    // Check interactions using FDA database
    const interactions = await checkFDAInteractions(sanitizedDrugs);
    
    // Log the check for audit purposes
    console.log(`Found ${interactions.length} interactions for drugs: ${sanitizedDrugs.join(', ')}`);

    return new Response(
      JSON.stringify({ 
        interactions,
        validated_drugs: sanitizedDrugs,
        source: 'OpenFDA Drug Labeling Database'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error checking drug interactions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to check drug interactions';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
