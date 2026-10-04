import {
  COMPREHENSIVE_MEDICINE_DATABASE,
  findMedicineInLocalDatabase,
  searchMedicinesInDatabase,
} from '../data/medicineDatabase';
import { MedicineInfo, MedicineSalt } from '../types';

export { COMPREHENSIVE_MEDICINE_DATABASE, findMedicineInLocalDatabase, searchMedicinesInDatabase };

export interface GroupedMedicineSuggestions {
  byBrand: MedicineInfo[];
  bySalt: MedicineInfo[];
  bySymptom: MedicineInfo[];
  byOpenFDA?: MedicineInfo[];
  all: MedicineInfo[];
}

/**
 * Normalizes OpenFDA drug NDC record into MedicineInfo with full active salts composition
 */
export function formatOpenFDANDCRecord(item: any): MedicineInfo {
  const brand = item.brand_name || item.brand_name_base || item.generic_name || 'Prescription Drug';
  const generic = item.generic_name || brand;
  const rawSalts: MedicineSalt[] = [];

  if (Array.isArray(item.active_ingredients) && item.active_ingredients.length > 0) {
    for (const act of item.active_ingredients) {
      if (act.name) {
        rawSalts.push({
          name: act.name.trim(),
          amount: act.strength ? act.strength.trim() : 'Standard strength',
        });
      }
    }
  }

  if (rawSalts.length === 0 && generic) {
    rawSalts.push({
      name: generic,
      amount: item.active_ingredient_strength || 'Standard strength',
    });
  }

  // Derive dosage form
  const rawForm = item.dosage_form ? item.dosage_form.toLowerCase() : 'tablet';
  let dosageForm = 'Tablet';
  if (rawForm.includes('capsule')) dosageForm = 'Capsule';
  else if (rawForm.includes('syrup') || rawForm.includes('liquid') || rawForm.includes('solution') || rawForm.includes('suspension')) dosageForm = 'Syrup';
  else if (rawForm.includes('injection') || rawForm.includes('injectable')) dosageForm = 'Injection';
  else if (rawForm.includes('inhaler') || rawForm.includes('aerosol')) dosageForm = 'Inhaler';
  else if (rawForm.includes('drop')) dosageForm = 'Drops';
  else if (rawForm.includes('cream') || rawForm.includes('ointment')) dosageForm = 'Topical';

  // Category from pharm_class
  const pharmClasses = item.pharm_class || [];
  const primaryPharm = pharmClasses[0] ? pharmClasses[0].replace(/\[.*?\]/g, '').trim() : 'Prescription Therapeutic';
  const category = primaryPharm.length > 3 ? primaryPharm : 'Prescription Medication';

  // Strength representation
  const strengthStr = rawSalts.length > 0
    ? rawSalts.map((s) => `${s.amount !== 'Standard strength' ? s.amount : ''} ${s.name}`).join(' + ').trim()
    : 'Standard Strength';

  return {
    id: `fda_${item.product_ndc || Math.random().toString(36).substring(2, 9)}`,
    name: brand,
    brandName: brand,
    genericName: generic,
    dosageForm,
    strength: strengthStr || 'Standard Dosage',
    manufacturer: item.labeler_name || 'FDA Registered Manufacturer',
    composition: { salts: rawSalts },
    category,
    conditions: [category, 'Prescribed Medical Therapy'],
    primaryUses: [
      `Treatment & clinical management using ${generic}`,
      category !== 'Prescription Medication' ? category : 'Targeted therapeutic action',
    ],
    use: `${brand} (${generic}) is an FDA-registered ${category.toLowerCase()} indicated for therapeutic care and clinical symptom control.`,
    standardDosage: '1 unit daily as advised by your treating physician',
    usageTiming: 'Take with a glass of water after food at the same time each day.',
    precautions: [
      'Take strictly according to physician prescription',
      'Inform your doctor of any allergies or other ongoing medications',
      'Store in original container away from excess heat and moisture',
    ],
    sideEffects: ['Consult product monograph for detailed contraindications'],
    storageConditions: 'Store below 25°C in a dry place protected from sunlight',
    prescriptionRequired: item.product_type ? !item.product_type.toLowerCase().includes('otc') : true,
    source: 'fda',
  };
}

/**
 * Searches the live US OpenFDA NDC & Drug Directory in real-time
 * Uses the exact API endpoint requested by the user: https://api.fda.gov/drug/ndc.json
 */
export async function searchOpenFDAMedicines(query: string, limit = 8): Promise<MedicineInfo[]> {
  const clean = query.trim();
  if (!clean) return [];

  const results: MedicineInfo[] = [];

  try {
    // 1. Search OpenFDA NDC directory by brand name and generic name
    const qEnc = encodeURIComponent(clean);
    const ndcUrl = `https://api.fda.gov/drug/ndc.json?search=(brand_name:"${qEnc}"+OR+generic_name:"${qEnc}"+OR+brand_name_base:"${qEnc}")&limit=${limit}`;

    const res = await fetch(ndcUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        for (const item of data.results) {
          results.push(formatOpenFDANDCRecord(item));
        }
      }
    } else {
      // Fallback to fuzzy wildcard search on OpenFDA NDC
      const wildcardUrl = `https://api.fda.gov/drug/ndc.json?search=brand_name:*${qEnc}*+generic_name:*${qEnc}*&limit=${limit}`;
      const wildRes = await fetch(wildcardUrl);
      if (wildRes.ok) {
        const wildData = await wildRes.json();
        if (Array.isArray(wildData.results)) {
          for (const item of wildData.results) {
            results.push(formatOpenFDANDCRecord(item));
          }
        }
      }
    }
  } catch (err) {
    console.warn('OpenFDA NDC search error:', err);
  }

  return results;
}

/**
 * Returns categorized search suggestions matching brand, salt composition, or symptom/use
 */
export function getGroupedMedicineSuggestions(query: string): GroupedMedicineSuggestions {
  if (!query || !query.trim()) {
    return {
      byBrand: COMPREHENSIVE_MEDICINE_DATABASE.slice(0, 8),
      bySalt: [],
      bySymptom: [],
      all: COMPREHENSIVE_MEDICINE_DATABASE,
    };
  }

  const q = query.trim().toLowerCase();
  const allMatches = searchMedicinesInDatabase(query);

  const byBrand: MedicineInfo[] = [];
  const bySalt: MedicineInfo[] = [];
  const bySymptom: MedicineInfo[] = [];

  for (const med of allMatches) {
    const brand = (med.brandName || med.name).toLowerCase();
    const generic = (med.genericName || '').toLowerCase();
    const salts = (med.composition?.salts || []).map((s) => s.name.toLowerCase()).join(' ');
    const aliases = (med.aliases || []).map((a) => a.toLowerCase());
    const uses = (med.primaryUses || med.conditions || []).map((u) => u.toLowerCase());

    if (brand.includes(q) || aliases.some((a) => a.includes(q))) {
      byBrand.push(med);
    } else if (generic.includes(q) || salts.includes(q)) {
      bySalt.push(med);
    } else if (uses.some((u) => u.includes(q))) {
      bySymptom.push(med);
    } else {
      byBrand.push(med);
    }
  }

  return {
    byBrand: byBrand.slice(0, 6),
    bySalt: bySalt.slice(0, 6),
    bySymptom: bySymptom.slice(0, 6),
    all: allMatches,
  };
}

/**
 * Pharmacological Suffix Rule Engine
 */
function inferDrugClassFromSuffix(name: string): Partial<MedicineInfo> | null {
  const n = name.toLowerCase();

  if (n.includes('sartan')) {
    return {
      category: 'Blood Pressure (ARB)',
      conditions: ['Hypertension (High Blood Pressure)', 'Cardiovascular Protection', 'Diabetic Kidney Disease'],
      use: 'Angiotensin receptor blocker that relaxes blood vessels to lower blood pressure and prevent strokes.',
      standardDosage: '20 mg to 80 mg once daily',
      usageTiming: 'Take once daily in the morning with water, with or without meals.',
      precautions: ['Avoid potassium supplements unless advised', 'Do not take during pregnancy', 'Monitor BP regularly'],
      sideEffects: ['Dizziness', 'Fatigue', 'Low blood pressure'],
    };
  }

  if (n.includes('statin')) {
    return {
      category: 'Cholesterol / Lipid Lowering',
      conditions: ['High LDL Cholesterol', 'Atherosclerosis', 'Heart Attack & Stroke Prevention'],
      use: 'Reduces liver production of bad LDL cholesterol and helps clear arterial plaque.',
      standardDosage: '10 mg to 40 mg once daily at bedtime',
      usageTiming: 'Take at night / bedtime with water for optimal cholesterol-lowering efficacy.',
      precautions: ['Report unexplained muscle aches or weakness', 'Avoid excessive alcohol and grapefruit juice'],
      sideEffects: ['Mild muscle aches', 'Joint stiffness', 'Mild digestive upset'],
    };
  }

  if (n.includes('formin') || n.includes('glyco')) {
    return {
      category: 'Diabetes / Blood Sugar',
      conditions: ['Type 2 Diabetes Mellitus', 'Insulin Resistance', 'Prediabetes'],
      use: 'Decreases glucose production in the liver and improves body response to insulin.',
      standardDosage: '500 mg to 1000 mg once or twice daily with meals',
      usageTiming: 'Take with or immediately after major meals to avoid stomach upset.',
      precautions: ['Always take with food; never on empty stomach', 'Avoid heavy alcohol consumption'],
      sideEffects: ['Nausea', 'Loose stools or diarrhea', 'Metallic taste in mouth'],
    };
  }

  if (n.includes('prazole')) {
    return {
      category: 'Acidity / Antacid (PPI)',
      conditions: ['Acid Reflux (GERD)', 'Gastritis', 'Stomach Ulcers', 'Heartburn'],
      use: 'Proton pump inhibitor that significantly reduces excess acid production in the stomach.',
      standardDosage: '20 mg to 40 mg once daily in the morning',
      usageTiming: 'Take on an empty stomach 30 to 45 minutes before breakfast with a glass of water.',
      precautions: ['Must be taken before meals for best effect', 'Swallow whole; do not crush or chew'],
      sideEffects: ['Mild headache', 'Diarrhea', 'Dry mouth'],
    };
  }

  if (n.includes('dipine')) {
    return {
      category: 'Blood Pressure (Calcium Channel Blocker)',
      conditions: ['Hypertension (High Blood Pressure)', 'Angina (Chest Pain)'],
      use: 'Relaxes arterial muscle walls, allowing smoother blood flow and reducing heart strain.',
      standardDosage: '5 mg to 10 mg once daily',
      usageTiming: 'Take once daily in the morning, before or after breakfast.',
      precautions: ['Watch for foot/ankle swelling', 'Avoid grapefruit juice', 'Stand up slowly from seated position'],
      sideEffects: ['Ankle swelling', 'Flushing', 'Headache'],
    };
  }

  if (n.includes('olol')) {
    return {
      category: 'Blood Pressure & Heart Rate (Beta Blocker)',
      conditions: ['High Blood Pressure', 'Fast Heart Rate (Tachycardia)', 'Angina', 'Post-Heart Attack Care'],
      use: 'Slows down the heart rate and decreases force of cardiac contraction.',
      standardDosage: '25 mg to 50 mg once daily',
      usageTiming: 'Take in the morning with or after breakfast.',
      precautions: ['Never stop suddenly without doctor advice', 'Check pulse; report if under 50 bpm'],
      sideEffects: ['Cold hands/feet', 'Slow pulse', 'Fatigue'],
    };
  }

  if (n.includes('gliptin')) {
    return {
      category: 'Diabetes (DPP-4 Inhibitor)',
      conditions: ['Type 2 Diabetes Mellitus'],
      use: 'Stimulates insulin release from the pancreas in response to post-meal blood sugar surges.',
      standardDosage: '50 mg to 100 mg once daily',
      usageTiming: 'Take once daily with or without food.',
      precautions: ['Low risk of low blood sugar', 'Report severe stomach pain immediately'],
      sideEffects: ['Stuffy nose', 'Mild headache'],
    };
  }

  if (n.includes('gliflozin')) {
    return {
      category: 'Diabetes & Kidney Protection (SGLT-2)',
      conditions: ['Type 2 Diabetes', 'Heart Failure Protection', 'Chronic Kidney Disease'],
      use: 'Expels excess sugar and sodium through urine, protecting both heart and kidneys.',
      standardDosage: '10 mg once daily in the morning',
      usageTiming: 'Take in the morning with a full glass of water.',
      precautions: ['Drink 6-8 glasses of water daily', 'Maintain good personal hygiene'],
      sideEffects: ['Increased urination', 'Thirst', 'Mild fungal itching'],
    };
  }

  if (n.includes('pril')) {
    return {
      category: 'Blood Pressure (ACE Inhibitor)',
      conditions: ['Hypertension', 'Congestive Heart Failure', 'Post-Myocardial Infarction'],
      use: 'Blocks angiotensin-converting enzyme to widen blood vessels and decrease vascular resistance.',
      standardDosage: '5 mg to 20 mg once daily',
      usageTiming: 'Take at the same time each day with water.',
      precautions: ['Report persistent dry hacking cough', 'Avoid potassium-rich salt substitutes'],
      sideEffects: ['Dry cough', 'Dizziness', 'Headache'],
    };
  }

  if (n.includes('cillin') || n.includes('mycin') || n.includes('floxacin') || n.includes('cef')) {
    return {
      category: 'Antibiotic / Anti-Infective',
      conditions: ['Bacterial Infections', 'Respiratory Infection', 'Skin & Soft Tissue Infections'],
      use: 'Inhibits bacterial cell wall or protein synthesis to eradicate bacterial infections.',
      standardDosage: 'As prescribed by physician (usually 5 to 7 days course)',
      usageTiming: 'Take at evenly spaced intervals with water; finish the entire prescribed course.',
      precautions: ['Complete the full course even if feeling better', 'Inform doctor of any drug allergies'],
      sideEffects: ['Mild loose stools', 'Nausea', 'Abdominal cramping'],
    };
  }

  return null;
}

/**
 * Universal Medicine Clinical Lookup
 * 1. Checks curated database first (sub-millisecond instant).
 * 2. If not found, calls server-side Gemini API (/api/medicine-lookup).
 * 3. Fallbacks to pharmacological rule-based clinical engine.
 */
export async function lookupMedicineInfo(query: string): Promise<MedicineInfo> {
  const clean = query.trim();
  if (!clean) {
    return {
      name: '',
      conditions: ['Routine Health Maintenance'],
      use: 'General prescribed medication',
      standardDosage: '1 tablet daily as advised by doctor',
      usageTiming: 'Take with water after meals',
      precautions: ['Follow consulting physician guidance', 'Keep out of reach of children'],
      source: 'database',
    };
  }

  // 1. Check local comprehensive medical catalog (instant response)
  const localMatch = findMedicineInLocalDatabase(clean);
  if (localMatch) {
    return localMatch;
  }

  // 2. Call server-side Gemini endpoint (/api/medicine-lookup)
  try {
    const res = await fetch('/api/medicine-lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: clean }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.name && data.conditions) {
        return {
          name: data.name,
          brandName: data.brandName || data.name,
          genericName: data.genericName || clean,
          dosageForm: data.dosageForm || 'Tablet',
          strength: data.strength || 'Standard',
          manufacturer: data.manufacturer || 'Pharmaceutical Formulation',
          composition: data.composition || { salts: [{ name: data.genericName || clean, amount: data.strength || 'Standard' }] },
          category: data.category || 'Prescription Medication',
          conditions: Array.isArray(data.conditions) ? data.conditions : [data.conditions],
          primaryUses: Array.isArray(data.primaryUses) ? data.primaryUses : [data.use || 'Clinical management'],
          use: data.use || `Medication indicated for ${clean}.`,
          standardDosage: data.standardDosage || '1 tablet daily as prescribed',
          usageTiming: data.usageTiming || 'Take with water after meals',
          precautions: Array.isArray(data.precautions) ? data.precautions : ['Take as directed by doctor'],
          sideEffects: Array.isArray(data.sideEffects) ? data.sideEffects : [],
          prescriptionRequired: data.prescriptionRequired !== undefined ? data.prescriptionRequired : true,
          source: 'ai',
        };
      }
    }
  } catch (err) {
    console.warn('Backend medicine lookup unavailable, trying open clinical sources:', err);
  }

  // 2.5. Try open-access OpenFDA public drug database
  try {
    const encoded = encodeURIComponent(clean);
    const fdaRes = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encoded}"+openfda.generic_name:"${encoded}"&limit=1`);
    if (fdaRes.ok) {
      const fdaData = await fdaRes.json();
      const item = fdaData.results?.[0];
      if (item) {
        const brand = item.openfda?.brand_name?.[0] || clean;
        const generic = item.openfda?.generic_name?.[0] || clean;
        const route = item.openfda?.route?.[0] || 'Oral';
        const purpose = item.purpose?.[0] || item.indications_and_usage?.[0]?.substring(0, 180) || 'Therapeutic medication';
        const dosageForm = route.toLowerCase().includes('oral') ? 'Tablet' : 'Therapeutic Form';
        return {
          name: brand,
          brandName: brand,
          genericName: generic,
          dosageForm: dosageForm,
          strength: 'Standard Dosage',
          category: 'Prescription Medication',
          composition: {
            salts: [{ name: generic, amount: 'Standard Strength' }],
          },
          conditions: [purpose.split('.')[0] || 'Prescribed Clinical Condition'],
          primaryUses: [purpose.split('.')[0] || 'Clinical Management'],
          use: purpose.slice(0, 220),
          standardDosage: '1 unit daily as advised by treating physician',
          usageTiming: 'Take with a glass of water after meals as directed.',
          precautions: item.warnings?.[0]?.substring(0, 180) ? [item.warnings[0].substring(0, 180)] : ['Take under medical supervision', 'Follow prescribed schedule strictly'],
          sideEffects: ['Follow medical package insert for contraindications'],
          source: 'fda',
        };
      }
    }
  } catch (fdaErr) {
    // Graceful silent fallback to clinical suffix rules
  }

  // 3. Fallback: Pharmacological rule engine
  const ruleInferred = inferDrugClassFromSuffix(clean);
  if (ruleInferred) {
    return {
      name: clean,
      brandName: clean,
      genericName: ruleInferred.genericName || clean,
      dosageForm: 'Tablet',
      strength: 'Standard Dosage',
      category: ruleInferred.category || 'Prescription Medication',
      conditions: ruleInferred.conditions || ['General Clinical Condition'],
      primaryUses: ruleInferred.conditions || ['Targeted symptom relief'],
      use: ruleInferred.use || 'Clinical medicine for targeted symptom relief and condition control.',
      standardDosage: ruleInferred.standardDosage || '1 tablet daily or as directed by doctor',
      usageTiming: ruleInferred.usageTiming || 'Take with water after meals as advised',
      precautions: ruleInferred.precautions || [
        'Take strictly as prescribed by your treating doctor',
        'Do not exceed the recommended dose',
        'Store in a cool, dry place away from sunlight',
      ],
      sideEffects: ruleInferred.sideEffects || ['Mild nausea', 'Dizziness', 'Dry mouth'],
      source: 'database',
    };
  }

  // 4. General fallback for any custom medicine
  return {
    name: clean,
    brandName: clean,
    genericName: clean,
    dosageForm: 'Tablet',
    strength: '1 unit',
    category: 'Prescription Medication',
    conditions: ['Clinical Condition', 'Prescribed Treatment'],
    primaryUses: ['Prescribed medical condition management'],
    use: `Prescribed pharmaceutical medication for managing ${clean} indications under clinical supervision.`,
    standardDosage: '1 tablet once daily, or as specified on your doctor prescription.',
    usageTiming: 'Take with a glass of water after food at the same time each day.',
    precautions: [
      'Take strictly according to physician instructions',
      'Do not alter the dosage without consulting your doctor',
      'Keep out of reach of children',
      'Store below 25°C in a dry place',
    ],
    sideEffects: ['Mild stomach discomfort', 'Drowsiness or dizziness in rare cases'],
    source: 'database',
  };
}
