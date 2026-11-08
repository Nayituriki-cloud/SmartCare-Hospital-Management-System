import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Clinical Notes & SOAP summary generation endpoint
app.post('/api/ai/clinical-notes', async (req: Request, res: Response) => {
  try {
    const { patientInfo, symptoms, vitals, examFindings, preliminaryPlan } = req.body;

    if (!aiClient) {
      // High quality clinical template fallback
      return res.json({
        success: true,
        isFallback: true,
        notes: {
          subjective: `Patient ${patientInfo?.name || 'Chief Complaint'}, age ${patientInfo?.age || 'N/A'}. Reports: ${symptoms || 'General malaise, acute discomfort'}. Denies acute loss of consciousness or severe chest pain.`,
          objective: `Vitals: BP ${vitals?.bp || '120/80'}, HR ${vitals?.hr || '75'} bpm, SpO2 ${vitals?.spo2 || '98'}%, Temp ${vitals?.temp || '36.8'}°C. Physical exam reveals: ${examFindings || 'Alert and oriented, regular rate and rhythm, clear breath sounds bilaterally.'}`,
          assessment: `Primary clinical impression: ${preliminaryPlan || 'Acute symptomatic presentation under evaluation'}. Differential considerations reviewed in line with regional clinical protocols.`,
          plan: `1. Monitor vitals Q4H. 2. Baseline CBC, malaria RDT, urinalysis as indicated. 3. Prescribed symptomatic relief. 4. Follow-up consultation in 48 hours or return immediately if red flag symptoms arise.`,
          disclaimer: 'Clinical decision support generated for licensed healthcare professional review only. Not an independent medical diagnosis.'
        }
      });
    }

    const prompt = `You are a clinical documentation assistant for a licensed physician at a modern hospital (SmartCare Hospital). 
Generate a structured, professional SOAP medical note based on:
Patient: ${JSON.stringify(patientInfo || {})}
Symptoms & History: ${symptoms}
Vitals: ${JSON.stringify(vitals || {})}
Physical Exam: ${examFindings}
Physician's initial impression: ${preliminaryPlan}

Return a valid JSON object strictly with these keys:
{
  "subjective": "detailed subjective narrative",
  "objective": "structured objective physical findings and vitals analysis",
  "assessment": "clinical assessment & differential diagnoses",
  "plan": "evidence-based management plan, investigations, and follow-up guidance",
  "disclaimer": "AI generated for licensed clinician review and confirmation only."
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text ?? '{}');
    return res.json({ success: true, notes: parsed });
  } catch (error: any) {
    console.error('Error generating clinical note:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to generate note' });
  }
});

// 2. Clinical Decision & Triage Helper endpoint
app.post('/api/ai/triage-support', async (req: Request, res: Response) => {
  try {
    const { age, gender, symptoms, vitals, medicalHistory } = req.body;

    if (!aiClient) {
      return res.json({
        success: true,
        isFallback: true,
        support: {
          triageLevel: 'Yellow (Urgent)',
          rationale: 'Stable hemodynamics with notable symptomatic distress requiring priority review.',
          redFlags: ['Sudden spike in temperature > 38.8°C', 'Oxygen desaturation below 94%', 'Persistent tachycardia'],
          recommendedTests: ['Full Blood Count (FBC/NFS)', 'Rapid Diagnostic Test / Blood smear', 'Electrolytes & Creatinine'],
          differentialSuggestions: ['Upper Respiratory Tract Infection', 'Acute febrile syndrome', 'Gastroenteritis'],
          safetyWarning: 'Requires validation by on-duty medical officer or triage nurse.'
        }
      });
    }

    const prompt = `As an evidence-based clinical decision support assistant (for hospital triage in Rwanda/East Africa & international guidelines), analyze this patient case:
Age: ${age}, Gender: ${gender}
Symptoms: ${symptoms}
Vitals: ${JSON.stringify(vitals || {})}
Medical History: ${medicalHistory || 'None reported'}

Return a strict JSON object with keys:
{
  "triageLevel": "Red (Immediate) | Orange (Very Urgent) | Yellow (Urgent) | Green (Standard) | Blue (Non-Urgent)",
  "rationale": "Clear clinical rationale based on vital thresholds and risk factors",
  "redFlags": ["list of critical warning signs to watch"],
  "recommendedTests": ["recommended initial diagnostic investigations"],
  "differentialSuggestions": ["evidence-based differential conditions to consider"],
  "safetyWarning": "Mandatory disclaimer stating clinician authority"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text ?? '{}');
    return res.json({ success: true, support: parsed });
  } catch (error: any) {
    console.error('Error in triage support:', error);
    return res.status(500).json({ success: false, error: error.message || 'Triage helper failed' });
  }
});

// 3. Pharmacy Stock Shortage Prediction & Restock Advisor endpoint
app.post('/api/ai/inventory-predict', async (req: Request, res: Response) => {
  try {
    const { inventoryItems, season, hospitalOccupancyRate } = req.body;

    if (!aiClient) {
      return res.json({
        success: true,
        isFallback: true,
        insights: [
          {
            name: 'Amoxicillin 500mg capsules',
            status: 'Critical Alert',
            runoutDays: 4,
            suggestedOrder: 500,
            unitCostRWF: 150,
            totalEstRWF: 75000,
            reason: 'High respiratory season demand surge and current stock at 12% reorder point.'
          },
          {
            name: 'Paracetamol IV 1g/100ml',
            status: 'Reorder Soon',
            runoutDays: 9,
            suggestedOrder: 250,
            unitCostRWF: 1200,
            totalEstRWF: 300000,
            reason: 'Inpatient surgical and medical ward daily consumption rate rising.'
          },
          {
            name: 'Artemether + Lumefantrine (Coartem)',
            status: 'Monitoring',
            runoutDays: 18,
            suggestedOrder: 200,
            unitCostRWF: 2500,
            totalEstRWF: 500000,
            reason: 'Rainy season malaria vector uptick anticipated over next month.'
          }
        ]
      });
    }

    const prompt = `You are a hospital pharmacy supply chain AI specialist for SmartCare Hospital (Kigali, Rwanda & regional healthcare).
Analyze current inventory snapshot and recent dispensing trends:
Current Inventory: ${JSON.stringify(inventoryItems || [])}
Season/Current Period: ${season || 'Rainy season'}
Hospital Bed Occupancy: ${hospitalOccupancyRate || '85%'}

Predict potential stockouts in next 30 days and calculate recommended purchase quantities.
Return a strict JSON array of objects with keys:
[
  {
    "name": "drug name",
    "status": "Critical Alert" | "Reorder Soon" | "Monitoring" | "Adequate",
    "runoutDays": number (days until depletion),
    "suggestedOrder": number (units to purchase),
    "unitCostRWF": number,
    "totalEstRWF": number,
    "reason": "epidemiological or consumption reasoning"
  }
]`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text ?? '[]');
    return res.json({ success: true, insights: parsed });
  } catch (error: any) {
    console.error('Error in inventory predict:', error);
    return res.status(500).json({ success: false, error: error.message || 'Inventory prediction failed' });
  }
});

// 4. Multilingual Patient Instructions (English, Kinyarwanda, French)
app.post('/api/ai/patient-message', async (req: Request, res: Response) => {
  try {
    const { patientName, language, messageType, details } = req.body;
    const targetLang = language || 'Kinyarwanda'; // 'Kinyarwanda' | 'Français' | 'English'

    if (!aiClient) {
      let defaultMsg = '';
      if (targetLang === 'Kinyarwanda') {
        defaultMsg = `Muraho ${patientName || 'Murwayi'}. Ibitaro bya SmartCare birakumenyesha ko gahunda yawe y'ubuvuzi yagenze neza. Nyabuneka unywe imiti uko muganga yabigutegetse, kandi uzagaruke kwisuzumisha ku itariki mwemeranyijweho. Niba hari ikibazo waduhamagara kuri 0788000111. Ubugingo buzira umuze!`;
      } else if (targetLang === 'Français') {
        defaultMsg = `Bonjour ${patientName || 'Patient'}. L'hôpital SmartCare vous rappelle de suivre attentivement vos prescriptions médicales. Prenez vos médicaments aux heures indiquées et présentez-vous à votre prochain rendez-vous de suivi. En cas d'urgence, contactez le 0788000111. Prompt rétablissement!`;
      } else {
        defaultMsg = `Hello ${patientName || 'Patient'}. SmartCare Hospital reminds you to follow your treatment plan carefully. Take your medications as directed by your physician and attend your scheduled follow-up consultation. In case of urgent concerns, call 0788000111. Wishing you good health!`;
      }

      return res.json({ success: true, isFallback: true, message: defaultMsg, language: targetLang });
    }

    const prompt = `Compose a warm, clear, professional patient communication from SmartCare Hospital in ${targetLang}.
Patient Name: ${patientName}
Type: ${messageType || 'Discharge Medication & Follow-up Instructions'}
Clinical/Care context: ${details}

The tone must be compassionate, culturally respectful for Rwanda and international patients, and explicitly clear about medication timing, warning signs to return to the emergency department, and follow-up date.
Return a strict JSON object: { "message": "translated text string", "language": "${targetLang}" }`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text ?? '{}');
    return res.json({ success: true, message: parsed.message || '', language: targetLang });
  } catch (error: any) {
    console.error('Error in patient message:', error);
    return res.status(500).json({ success: false, error: error.message || 'Message generation failed' });
  }
});

// Setup Vite middlewares for dev or static serving for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartCare HMS running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
