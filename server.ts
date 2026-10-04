import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize server-side Gemini client with telemetric header
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API endpoint for comprehensive medicine clinical lookup
  app.post('/api/medicine-lookup', async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const cleanQuery = query.trim();

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Falling back to local clinical engine.',
      });
    }

    try {
      const prompt = `You are a clinical pharmacologist and medical information specialist.
Provide authoritative, accurate, and elder-friendly clinical data for the medication or chemical drug: "${cleanQuery}".
You MUST return ONLY a clean JSON object conforming exactly to this structure with no markdown backticks or commentary:
{
  "name": "${cleanQuery}",
  "brandName": "Common commercial brand name or ${cleanQuery}",
  "genericName": "Generic active salt or chemical molecule name",
  "dosageForm": "Tablet / Capsule / Syrup / Inhaler / Injection / Sachet / Drops",
  "strength": "Standard strength (e.g. 650mg, 500mg + 125mg, 40mg)",
  "manufacturer": "Leading pharmaceutical manufacturer",
  "composition": {
    "salts": [
      { "name": "Active Salt Molecule Name", "amount": "Strength in mg/mcg" }
    ]
  },
  "category": "Therapeutic class (e.g. Antihypertensive / ARB, Antidiabetic, Statin, Antibiotic)",
  "conditions": ["Condition 1", "Condition 2", "Condition 3"],
  "primaryUses": ["Primary clinical use 1", "Use 2"],
  "use": "Concise 1-2 sentence explanation of why this medicine is used and how it works in the body.",
  "standardDosage": "Typical adult maintenance dosage (e.g. 40 mg once daily, 500 mg twice daily with meals)",
  "usageTiming": "Clear timing instructions (e.g. Take in the morning before breakfast with a full glass of water)",
  "precautions": [
    "Crucial elder safety warning or contraindication 1",
    "Food or interaction warning 2",
    "Monitoring instruction 3"
  ],
  "sideEffects": ["Common mild side effect 1", "Side effect 2", "Side effect 3"],
  "storageConditions": "Store below 25°C in a dry place protected from direct sunlight",
  "prescriptionRequired": true
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return res.json({
        ...parsed,
        source: 'ai',
      });
    } catch (err: any) {
      console.warn('Server Gemini medicine lookup temporary error, using clinical rule fallback:', err?.message || err);

      // Resilient pharmacological rule fallback
      const q = cleanQuery.toLowerCase();
      let category = 'Prescription Medication';
      let conditions = ['Routine Health Maintenance', 'Prescribed Therapy'];
      let use = `Clinical medicine for managing ${cleanQuery} indications under medical supervision.`;
      let standardDosage = '1 tablet once daily, or as specified on your doctor prescription.';
      let usageTiming = 'Take with a glass of water after food at the same time each day.';
      let precautions = [
        'Take strictly according to physician instructions',
        'Do not alter the dosage without consulting your doctor',
        'Store below 25°C in a dry place',
      ];
      let sideEffects = ['Mild stomach discomfort', 'Drowsiness or dizziness in rare cases'];

      if (q.includes('sartan')) {
        category = 'Blood Pressure (ARB)';
        conditions = ['Hypertension (High Blood Pressure)', 'Cardiovascular Protection', 'Diabetic Kidney Disease'];
        use = 'Angiotensin receptor blocker that relaxes blood vessels to lower blood pressure and prevent strokes.';
        standardDosage = '20 mg to 80 mg once daily in the morning';
        usageTiming = 'Take once daily in the morning with water, with or without meals.';
        precautions = ['Avoid potassium supplements unless advised', 'Do not take during pregnancy', 'Monitor BP regularly'];
        sideEffects = ['Dizziness', 'Fatigue', 'Low blood pressure'];
      } else if (q.includes('statin')) {
        category = 'Cholesterol / Lipid Lowering';
        conditions = ['High LDL Cholesterol', 'Atherosclerosis', 'Heart Attack & Stroke Prevention'];
        use = 'Reduces liver production of bad LDL cholesterol and helps clear arterial plaque.';
        standardDosage = '10 mg to 40 mg once daily at bedtime';
        usageTiming = 'Take at night / bedtime with water for optimal cholesterol-lowering efficacy.';
        precautions = ['Report unexplained muscle aches or weakness', 'Avoid excessive alcohol and grapefruit juice'];
        sideEffects = ['Mild muscle aches', 'Joint stiffness', 'Mild digestive upset'];
      } else if (q.includes('formin') || q.includes('glyco')) {
        category = 'Diabetes / Blood Sugar';
        conditions = ['Type 2 Diabetes Mellitus', 'Insulin Resistance', 'Prediabetes'];
        use = 'Decreases glucose production in the liver and improves body response to insulin.';
        standardDosage = '500 mg to 1000 mg once or twice daily with meals';
        usageTiming = 'Take with or immediately after major meals to avoid stomach upset.';
        precautions = ['Always take with food; never on empty stomach', 'Avoid heavy alcohol consumption'];
        sideEffects = ['Nausea', 'Loose stools or diarrhea', 'Metallic taste in mouth'];
      } else if (q.includes('prazole')) {
        category = 'Acidity / Antacid (PPI)';
        conditions = ['Acid Reflux (GERD)', 'Gastritis', 'Stomach Ulcers', 'Heartburn'];
        use = 'Proton pump inhibitor that significantly reduces excess acid production in the stomach.';
        standardDosage = '20 mg to 40 mg once daily in the morning';
        usageTiming = 'Take on an empty stomach 30 to 45 minutes before breakfast with a glass of water.';
        precautions = ['Must be taken before meals for best effect', 'Swallow whole; do not crush or chew'];
        sideEffects = ['Mild headache', 'Diarrhea', 'Dry mouth'];
      } else if (q.includes('dipine')) {
        category = 'Blood Pressure (Calcium Channel Blocker)';
        conditions = ['Hypertension (High Blood Pressure)', 'Angina (Chest Pain)'];
        use = 'Relaxes arterial muscle walls, allowing smoother blood flow and reducing heart strain.';
        standardDosage = '5 mg to 10 mg once daily';
        usageTiming = 'Take once daily in the morning, before or after breakfast.';
        precautions = ['Watch for foot/ankle swelling', 'Avoid grapefruit juice', 'Stand up slowly from seated position'];
        sideEffects = ['Ankle swelling', 'Flushing', 'Headache'];
      } else if (q.includes('sacubitril') || q.includes('entresto') || q.includes('vymada')) {
        category = 'Heart Failure (ARNI)';
        conditions = ['Chronic Heart Failure (Reduced Ejection Fraction)', 'Cardiovascular Mortality Reduction'];
        use = 'Neprilysin inhibitor combined with ARB that relaxes blood vessels and reduces fluid strain on failing heart muscle.';
        standardDosage = '24/26 mg to 97/103 mg twice daily as titrated by cardiologist';
        usageTiming = 'Take twice daily with water, morning and evening, with or without food.';
        precautions = ['Do not take within 36 hours of an ACE inhibitor', 'Monitor serum potassium and blood pressure regularly'];
        sideEffects = ['Low blood pressure (hypotension)', 'Dizziness', 'Mild hyperkalemia'];
      }

      return res.json({
        name: cleanQuery,
        genericName: cleanQuery,
        category,
        conditions,
        use,
        standardDosage,
        usageTiming,
        precautions,
        sideEffects,
        source: 'database',
      });
    }
  });

  // Mount Vite middleware in development
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (dev: ${isDev})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
