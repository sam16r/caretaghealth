import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drugs } = await req.json();

    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Please provide at least 2 drugs to check for interactions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking interactions for drugs:', drugs);

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `You are a pharmacist AI assistant. Analyze the following list of medications for potential drug-drug interactions.

Medications to check: ${drugs.join(', ')}

For each potential interaction found, provide:
1. The two drugs involved
2. Severity level (low, moderate, high, or critical)
3. A brief description of the interaction
4. A recommendation for the healthcare provider

Respond in valid JSON format only, with no additional text:
{
  "interactions": [
    {
      "drug1": "drug name 1",
      "drug2": "drug name 2", 
      "severity": "low|moderate|high|critical",
      "description": "Brief description of the interaction",
      "recommendation": "What the healthcare provider should do"
    }
  ]
}

If no significant interactions are found, return: { "interactions": [] }`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a clinical pharmacist expert. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '{}';
    
    console.log('AI response:', content);

    // Parse the JSON response
    let result;
    try {
      // Clean up the response if it has markdown code blocks
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      result = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      result = { interactions: [] };
    }

    return new Response(
      JSON.stringify(result),
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
