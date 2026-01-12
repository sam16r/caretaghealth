import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionData {
  id: string;
  patientName: string;
  caretagId: string;
  diagnosis: string | null;
  medications: Medication[];
  notes: string | null;
  createdAt: string;
  validUntil: string | null;
  doctorName?: string;
}

export function generatePrescriptionPDF(prescription: PrescriptionData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error('Please allow popups to export PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Prescription - ${prescription.patientName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            color: #1a1a1a;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #0ea5e9;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 { 
            color: #0ea5e9; 
            font-size: 28px;
            margin-bottom: 5px;
          }
          .header p { color: #666; font-size: 14px; }
          .patient-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .patient-info h2 {
            font-size: 18px;
            color: #334155;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .info-item { font-size: 14px; }
          .info-label { color: #64748b; font-weight: 500; }
          .diagnosis {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 0 8px 8px 0;
          }
          .diagnosis h3 { color: #92400e; font-size: 14px; margin-bottom: 5px; }
          .diagnosis p { color: #78350f; font-size: 16px; font-weight: 500; }
          .medications h3 {
            font-size: 18px;
            color: #334155;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          .med-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .med-table th {
            background: #0ea5e9;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
          }
          .med-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
          }
          .med-table tr:nth-child(even) { background: #f8fafc; }
          .med-name { font-weight: 600; color: #0369a1; }
          .notes {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 15px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 25px;
          }
          .notes h3 { color: #166534; font-size: 14px; margin-bottom: 5px; }
          .notes p { color: #14532d; font-size: 14px; }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
          }
          .signature { text-align: right; }
          .signature-line {
            width: 200px;
            border-top: 1px solid #334155;
            margin-top: 50px;
            padding-top: 5px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CareTag Medical</h1>
          <p>Prescription</p>
        </div>

        <div class="patient-info">
          <h2>Patient Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Name:</span> ${prescription.patientName}
            </div>
            <div class="info-item">
              <span class="info-label">CareTag ID:</span> ${prescription.caretagId}
            </div>
            <div class="info-item">
              <span class="info-label">Date:</span> ${format(parseISO(prescription.createdAt), 'MMMM d, yyyy')}
            </div>
            <div class="info-item">
              <span class="info-label">Valid Until:</span> ${prescription.validUntil ? format(parseISO(prescription.validUntil), 'MMMM d, yyyy') : 'N/A'}
            </div>
          </div>
        </div>

        ${prescription.diagnosis ? `
          <div class="diagnosis">
            <h3>Diagnosis</h3>
            <p>${prescription.diagnosis}</p>
          </div>
        ` : ''}

        <div class="medications">
          <h3>Prescribed Medications</h3>
          <table class="med-table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.medications.map(med => `
                <tr>
                  <td class="med-name">${med.name}</td>
                  <td>${med.dosage}</td>
                  <td>${med.frequency}</td>
                  <td>${med.duration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${prescription.notes ? `
          <div class="notes">
            <h3>Additional Notes</h3>
            <p>${prescription.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <div>
            <p style="font-size: 12px; color: #64748b;">Prescription ID: ${prescription.id.slice(0, 8)}</p>
          </div>
          <div class="signature">
            <div class="signature-line">
              <p style="font-size: 12px; color: #64748b;">Doctor's Signature</p>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  toast.success('Prescription PDF opened for printing');
}

interface PrescriptionPDFExportProps {
  prescription: PrescriptionData;
  variant?: 'default' | 'icon';
}

export function PrescriptionPDFExport({ prescription, variant = 'default' }: PrescriptionPDFExportProps) {
  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    generatePrescriptionPDF(prescription);
  };

  if (variant === 'icon') {
    return (
      <Button variant="ghost" size="icon" onClick={handleExport} className="h-8 w-8">
        <FileDown className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
      <FileDown className="h-4 w-4" />
      Export PDF
    </Button>
  );
}
