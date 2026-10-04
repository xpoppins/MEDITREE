import { MedicineInfo } from '../types';
import { INDIAN_MEDICINES_DB } from './indianMedicines';
import Fuse from 'fuse.js';

/**
 * Enterprise Clinical Medicine & Active Salt Composition Database
 * Fully structured with brand names, generic active molecules, strengths,
 * dosage forms, manufacturers, salt compositions, primary uses, side effects,
 * storage requirements, prescription schedules, and search keywords.
 * 
 * MERGED: Curated clinical database (80+ medicines) + Indian Medicine Dataset (3000 medicines)
 */
const CURATED_MEDICINES: MedicineInfo[] = [
  // ==================== 1. ANALGESICS, ANTIPYRETICS & PAIN MANAGEMENT ====================
  {
    id: 'med_pcm_650',
    name: 'Calpol 650mg Tablet',
    brandName: 'Calpol 650mg',
    genericName: 'Paracetamol',
    dosageForm: 'Tablet',
    strength: '650 mg',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    composition: {
      salts: [{ name: 'Paracetamol (Acetaminophen)', amount: '650mg' }],
    },
    aliases: ['Calpol 650', 'Dolo 650', 'Crocin 650', 'Pacimol 650', 'P-650', 'Paracip 650', 'Tylenol Extra Strength'],
    category: 'Analgesic & Antipyretic (Fever & Pain)',
    conditions: ['High Fever (Pyrexia)', 'Body Aches', 'Headache', 'Post-Vaccination Fever', 'Viral Fever'],
    primaryUses: ['Fever reduction', 'Mild to moderate body pain relief', 'Headache & toothache relief'],
    use: 'Inhibits prostaglandin synthesis in the central nervous system to reduce fever and alleviate body aches.',
    standardDosage: '1 tablet (650 mg) every 6 to 8 hours as needed. Maximum 3000 mg in 24 hours.',
    usageTiming: 'Take after food or with a glass of water. Allow at least 4 to 6 hours between consecutive doses.',
    precautions: [
      'Do not exceed 3 grams (4-5 tablets) in 24 hours to prevent severe hepatic toxicity.',
      'Do not combine with other cold or sinus remedies that already contain paracetamol.',
      'Avoid heavy alcohol consumption while taking paracetamol.',
      'Patients with liver or kidney impairment should consult a doctor before use.',
    ],
    sideEffects: ['Nausea (rare)', 'Skin rash or allergic response (rare)', 'Liver toxicity (only in chronic overdose)'],
    storageConditions: 'Store below 30°C in a dry place. Protect from direct sunlight.',
    prescriptionRequired: false,
    searchKeywords: ['fever', 'crocin', 'calpol', 'dolo', 'pcm', 'painkiller', 'headache', 'body pain', 'temperature', 'bukhar'],
    source: 'database',
  },
  {
    id: 'med_dolo_650',
    name: 'Dolo 650mg Tablet',
    brandName: 'Dolo 650',
    genericName: 'Paracetamol',
    dosageForm: 'Tablet',
    strength: '650 mg',
    manufacturer: 'Micro Labs Ltd',
    composition: {
      salts: [{ name: 'Paracetamol', amount: '650mg' }],
    },
    aliases: ['Dolo 650', 'Dolo-650mg', 'Crocin 650', 'Calpol 650', 'Dolopar'],
    category: 'Analgesic & Antipyretic',
    conditions: ['High Fever', 'Viral Illness Pain', 'Joint & Muscle Soreness', 'Migraine & Tension Headache'],
    primaryUses: ['Fast fever reduction', 'General muscle aches & back pain', 'Dental pain'],
    use: 'Fast-acting antipyretic and pain reliever widely prescribed for viral fevers and inflammatory pain.',
    standardDosage: '1 tablet every 6 to 8 hours. Max 4 tablets daily.',
    usageTiming: 'Take with warm water after meals.',
    precautions: ['Do not exceed recommended dose', 'Avoid alcohol', 'Consult doctor if fever persists > 3 days'],
    sideEffects: ['Minimal side effects at recommended dosages'],
    storageConditions: 'Store in a cool dry place.',
    prescriptionRequired: false,
    searchKeywords: ['dolo', 'dolo650', 'fever', 'flu', 'covid', 'viral', 'headache', 'body ache'],
    source: 'database',
  },
  {
    id: 'med_combiflam',
    name: 'Combiflam Tablet',
    brandName: 'Combiflam',
    genericName: 'Ibuprofen + Paracetamol',
    dosageForm: 'Tablet',
    strength: '400 mg + 325 mg',
    manufacturer: 'Sanofi India Ltd',
    composition: {
      salts: [
        { name: 'Ibuprofen', amount: '400mg' },
        { name: 'Paracetamol', amount: '325mg' },
      ],
    },
    aliases: ['Combiflam', 'Ibugesic Plus', 'Brufen Plus', 'Flexon', 'Bruspam'],
    category: 'NSAID & Analgesic (Anti-Inflammatory Pain Relief)',
    conditions: ['Severe Dental Pain', 'Joint Inflammation', 'Sprains & Strains', 'Musculoskeletal Pain', 'Dysmenorrhea'],
    primaryUses: ['Moderate to severe inflammatory pain relief', 'Swelling & tendon sprains', 'Tooth extraction pain'],
    use: 'Combines the anti-inflammatory power of Ibuprofen (NSAID) with central analgesic Paracetamol for dual pain relief.',
    standardDosage: '1 tablet twice or thrice daily strictly after meals.',
    usageTiming: 'Always take with or immediately after a full meal to protect gastric lining.',
    precautions: [
      'Strictly avoid on an empty stomach; can cause gastric irritation or ulcers.',
      'Do not use in patients with active peptic ulcer, severe kidney disease, or bleeding disorders.',
      'Not recommended in third trimester of pregnancy.',
      'Do not combine with other NSAIDs (such as Aspirin, Diclofenac, or Naproxen).',
    ],
    sideEffects: ['Heartburn / Acidity', 'Stomach discomfort', 'Nausea', 'Dizziness'],
    storageConditions: 'Store below 25°C in a dry place.',
    prescriptionRequired: false,
    searchKeywords: ['combiflam', 'ibuprofen', 'painkiller', 'swelling', 'toothache', 'period pain', 'brufen', 'joint pain'],
    source: 'database',
  },
  {
    id: 'med_zerodol_sp',
    name: 'Zerodol-SP Tablet',
    brandName: 'Zerodol-SP',
    genericName: 'Aceclofenac + Paracetamol + Serratiopeptidase',
    dosageForm: 'Tablet',
    strength: '100 mg + 325 mg + 15 mg',
    manufacturer: 'Ipca Laboratories Ltd',
    composition: {
      salts: [
        { name: 'Aceclofenac', amount: '100mg' },
        { name: 'Paracetamol', amount: '325mg' },
        { name: 'Serratiopeptidase', amount: '15mg' },
      ],
    },
    aliases: ['Zerodol SP', 'Aceclo-SP', 'Hifenac-SP', 'Altraday', 'Signoflam', 'Dolowin Forte'],
    category: 'Anti-Inflammatory, Analgesic & Proteolytic Enzyme',
    conditions: ['Post-Operative Edema', 'Severe Arthritis Pain', 'Sports Injuries & Fractures', 'ENT Inflammation'],
    primaryUses: ['Rapid resolution of surgical & traumatic swelling', 'Relief from severe arthritic joint flare-ups', 'Tooth abscess swelling'],
    use: 'Aceclofenac and Paracetamol halt pain signaling while Serratiopeptidase enzyme breaks down abnormal inflammatory exudate and proteins.',
    standardDosage: '1 tablet twice daily (morning and evening) after food.',
    usageTiming: 'Take after meals with water. Swallow whole; do not chew.',
    precautions: [
      'Take with antacid if prone to gastritis.',
      'Contraindicated in severe liver failure or active GI bleeding.',
      'Monitor kidney function during prolonged courses (> 2 weeks).',
    ],
    sideEffects: ['Indigestion', 'Nausea', 'Abdominal fullness', 'Mild diarrhea'],
    storageConditions: 'Store below 25°C protected from moisture.',
    prescriptionRequired: true,
    searchKeywords: ['zerodol', 'zerodol sp', 'swelling', 'inflammation', 'aceclofenac', 'serratiopeptidase', 'arthritis', 'orthopedic'],
    source: 'database',
  },
  {
    id: 'med_tramadol_pcm',
    name: 'Ultracet Tablet',
    brandName: 'Ultracet',
    genericName: 'Tramadol Hydrochloride + Paracetamol',
    dosageForm: 'Tablet',
    strength: '37.5 mg + 325 mg',
    manufacturer: 'Johnson & Johnson / Janssen',
    composition: {
      salts: [
        { name: 'Tramadol Hydrochloride', amount: '37.5mg' },
        { name: 'Paracetamol', amount: '325mg' },
      ],
    },
    aliases: ['Ultracet', 'Tramazac P', 'Calpol T', 'Dolzero', 'Urgent-P'],
    category: 'Centrally Acting Opioid Analgesic Combination',
    conditions: ['Moderate to Severe Chronic Pain', 'Post-Surgical Pain', 'Severe Sciatica & Disc Herniation', 'Cancer Pain'],
    primaryUses: ['Relief of moderate to severe pain refractory to standard NSAIDs', 'Post-orthopedic surgery recovery'],
    use: 'Dual-action central analgesic: Tramadol binds mu-opioid receptors and inhibits monoamine reuptake, boosted by paracetamol.',
    standardDosage: '1 to 2 tablets every 6 to 8 hours as prescribed by physician. Do not exceed 8 tablets daily.',
    usageTiming: 'Take with water with or without food. Avoid alcohol completely.',
    precautions: [
      'Schedule H1 prescription drug: potential for dependence with prolonged unmonitored use.',
      'May cause drowsiness and impaired alertness; do not drive or operate machinery.',
      'Avoid combining with sedatives, sleeping pills, or SSRI antidepressants.',
    ],
    sideEffects: ['Drowsiness / Sedation', 'Nausea / Vomiting', 'Constipation', 'Dizziness', 'Dry mouth'],
    storageConditions: 'Store in secure prescription storage below 30°C.',
    prescriptionRequired: true,
    searchKeywords: ['ultracet', 'tramadol', 'severe pain', 'back pain', 'sciatica', 'post op', 'ortho pain'],
    source: 'database',
  },

  // ==================== 2. CARDIOVASCULAR & BLOOD PRESSURE ====================
  {
    id: 'med_telma_40',
    name: 'Telma 40mg Tablet',
    brandName: 'Telma 40',
    genericName: 'Telmisartan',
    dosageForm: 'Tablet',
    strength: '40 mg',
    manufacturer: 'Glenmark Pharmaceuticals Ltd',
    composition: {
      salts: [{ name: 'Telmisartan', amount: '40mg' }],
    },
    aliases: ['Telma 40', 'Telpres 40', 'Telsar 40', 'Telmikind 40', 'Telvas 40', 'Arbitel 40', 'Micardis 40'],
    category: 'Cardiovascular / Angiotensin Receptor Blocker (ARB)',
    conditions: ['Essential Hypertension (High BP)', 'Cardiovascular Risk Reduction', 'Diabetic Nephropathy Protection'],
    primaryUses: ['24-hour blood pressure control', 'Prevention of strokes and cardiac events', 'Kidney protection in diabetic patients'],
    use: 'Selectively blocks the binding of Angiotensin II to AT1 receptors in vascular smooth muscles, promoting sustained vasodilation.',
    standardDosage: '40 mg once daily, morning. Range 20 mg to 80 mg once daily.',
    usageTiming: 'Take once daily in the morning with or without breakfast at the exact same time.',
    precautions: [
      'Avoid potassium supplements or salt substitutes containing potassium without physician clearance.',
      'Absolute contraindication in pregnancy (teratogenic risk).',
      'Rise slowly from seated or supine positions to prevent orthostatic lightheadedness.',
      'Periodic monitoring of serum potassium, BUN, and serum creatinine recommended.',
    ],
    sideEffects: ['Dizziness', 'Fatigue', 'Sinusitis / Nasal congestion', 'Mild back pain'],
    storageConditions: 'Store below 30°C in the original moisture-proof blister package.',
    prescriptionRequired: true,
    searchKeywords: ['telma', 'telmisartan', 'bp', 'blood pressure', 'hypertension', 'heart', 'telma40', 'high bp'],
    source: 'database',
  },
  {
    id: 'med_telma_h',
    name: 'Telma-H Tablet',
    brandName: 'Telma-H',
    genericName: 'Telmisartan + Hydrochlorothiazide',
    dosageForm: 'Tablet',
    strength: '40 mg + 12.5 mg',
    manufacturer: 'Glenmark Pharmaceuticals Ltd',
    composition: {
      salts: [
        { name: 'Telmisartan', amount: '40mg' },
        { name: 'Hydrochlorothiazide', amount: '12.5mg' },
      ],
    },
    aliases: ['Telma H', 'Telpres CT', 'Telmikind-H', 'Telvas-H', 'Arbitel-H', 'Micardis Plus'],
    category: 'Combination Antihypertensive (ARB + Thiazide Diuretic)',
    conditions: ['Uncontrolled Hypertension', 'Fluid-Retention Hypertension', 'Stage 2 High Blood Pressure'],
    primaryUses: ['Enhanced BP reduction when monotherapy is insufficient', 'Reduces vascular resistance and fluid volume'],
    use: 'Telmisartan dilates arterial vessels while Hydrochlorothiazide diuretic expels excess sodium and water via urine.',
    standardDosage: '1 tablet once daily in the morning after breakfast.',
    usageTiming: 'Best taken in the morning to prevent frequent nighttime urination.',
    precautions: [
      'Take early in the day (before 10 AM) to avoid nighttime sleep disruption from urination.',
      'Stay adequately hydrated in hot weather.',
      'Check electrolytes (potassium, sodium) and uric acid periodically.',
    ],
    sideEffects: ['Increased urination', 'Dizziness on standing', 'Mild fatigue', 'Electrolyte imbalance (rare)'],
    storageConditions: 'Store below 25°C in a dry place.',
    prescriptionRequired: true,
    searchKeywords: ['telma h', 'telmisartan hctz', 'diuretic', 'high bp', 'water pill', 'stage 2 bp', 'hypertension'],
    source: 'database',
  },
  {
    id: 'med_amlong_5',
    name: 'Amlong 5mg Tablet',
    brandName: 'Amlong 5',
    genericName: 'Amlodipine Besylate',
    dosageForm: 'Tablet',
    strength: '5 mg',
    manufacturer: 'Micro Labs Ltd',
    composition: {
      salts: [{ name: 'Amlodipine Besylate', amount: '5mg' }],
    },
    aliases: ['Amlong 5', 'Norvasc 5', 'Amlovas 5', 'Stamlo 5', 'Amlopres 5', 'Cilacar 5'],
    category: 'Cardiovascular / Calcium Channel Blocker (Dihydropyridine)',
    conditions: ['Hypertension', 'Chronic Stable Angina', 'Vasospastic (Prinzmetal) Angina'],
    primaryUses: ['Lowers elevated systolic and diastolic blood pressure', 'Prevents angina chest tightness and spasms'],
    use: 'Inhibits transmembrane influx of calcium ions into vascular smooth muscle and cardiac muscle, causing peripheral vasodilation.',
    standardDosage: '5 mg once daily, may be titrated to 10 mg daily.',
    usageTiming: 'Take once daily at the same time each day, before or after breakfast.',
    precautions: [
      'Report any ankle or feet swelling (peripheral edema) to your doctor.',
      'Avoid grapefruit juice which can significantly elevate blood levels.',
      'Do not abruptly discontinue without medical guidance.',
    ],
    sideEffects: ['Peripheral edema (ankle swelling)', 'Headache', 'Flushing', 'Palpitations (rare)'],
    storageConditions: 'Store below 25°C. Keep container tightly closed.',
    prescriptionRequired: true,
    searchKeywords: ['amlong', 'amlodipine', 'bp', 'angina', 'chest pain', 'calcium blocker', 'norvasc', 'amlovas'],
    source: 'database',
  },
  {
    id: 'med_cilacar_10',
    name: 'Cilacar 10mg Tablet',
    brandName: 'Cilacar 10',
    genericName: 'Cilnidipine',
    dosageForm: 'Tablet',
    strength: '10 mg',
    manufacturer: 'J.B. Chemicals & Pharmaceuticals Ltd',
    composition: {
      salts: [{ name: 'Cilnidipine', amount: '10mg' }],
    },
    aliases: ['Cilacar 10', 'Cilaheart 10', 'Nexovas 10', 'Twincal 10', 'Cildip 10'],
    category: 'Dual L/N-type Calcium Channel Blocker',
    conditions: ['Hypertension with Tachycardia', 'Diabetic Kidney Disease', 'Morning Blood Pressure Surge'],
    primaryUses: ['Smooth BP control without reflex heart rate spikes', 'Renal microcirculation protection in diabetic hypertensive elders'],
    use: 'Blocks both L-type and N-type calcium channels, dilating efferent arterioles and suppressing sympathetic nerve overactivity.',
    standardDosage: '10 mg once daily with morning breakfast, can be increased to 20 mg daily.',
    usageTiming: 'Take in the morning with water.',
    precautions: [
      'Causes significantly less ankle edema than amlodipine.',
      'Check blood pressure regularly during the first 2 weeks of initiation.',
    ],
    sideEffects: ['Mild dizziness', 'Headache', 'Flushing'],
    storageConditions: 'Store in a dry place protected from light below 30°C.',
    prescriptionRequired: true,
    searchKeywords: ['cilacar', 'cilnidipine', 'bp without swelling', 'diabetic bp', 'kidney safe bp', 'cilaheart'],
    source: 'database',
  },
  {
    id: 'med_metoprolol_er',
    name: 'Betaloc 50mg Extended Release Tablet',
    brandName: 'Betaloc 50',
    genericName: 'Metoprolol Succinate Extended Release',
    dosageForm: 'Extended Release Tablet',
    strength: '50 mg',
    manufacturer: 'AstraZeneca Pharma India Ltd',
    composition: {
      salts: [{ name: 'Metoprolol Succinate', amount: '47.5mg (equiv. to 50mg Metoprolol Tartrate)' }],
    },
    aliases: ['Betaloc 50', 'Toprol-XL', 'Metolar-XR 50', 'Starpress-XL 50', 'Met-XL 50', 'Revelol-XL 50'],
    category: 'Cardiovascular / Cardioselective Beta-1 Blocker',
    conditions: ['Fast Heart Rate (Tachycardia)', 'Hypertension', 'Post-Heart Attack Maintenance', 'Congestive Heart Failure', 'Angina'],
    primaryUses: ['Reduces heart rate and cardiac workload', 'Long-term mortality reduction post-myocardial infarction', 'Prevents angina episodes'],
    use: 'Selectively blocks beta-1 adrenergic receptors in the myocardium, lowering cardiac output, resting heart rate, and myocardial oxygen demand.',
    standardDosage: '25 mg to 100 mg once daily in the morning.',
    usageTiming: 'Take with or immediately following a meal. Swallow whole with water; do not crush or chew extended-release beads.',
    precautions: [
      'CRITICAL: NEVER stop taking beta-blockers suddenly; abrupt stoppage can trigger rebound severe angina or heart attacks.',
      'Inform doctor if resting pulse falls below 55 beats per minute.',
      'Use with caution in patients with asthma or severe COPD.',
      'May mask early warning signs of hypoglycemia (such as shakiness/tremors) in diabetic patients.',
    ],
    sideEffects: ['Bradycardia (slow pulse)', 'Cold extremities (hands/feet)', 'Fatigue', 'Dizziness', 'Vivid dreams (rare)'],
    storageConditions: 'Store below 25°C in original packaging.',
    prescriptionRequired: true,
    searchKeywords: ['betaloc', 'metoprolol', 'met-xl', 'pulse', 'tachycardia', 'heart rate', 'palpitations', 'beta blocker', 'angina'],
    source: 'database',
  },
  {
    id: 'med_ecosprin_75',
    name: 'Ecosprin 75mg Tablet',
    brandName: 'Ecosprin 75',
    genericName: 'Aspirin (Acetylsalicylic Acid)',
    dosageForm: 'Gastro-resistant Tablet',
    strength: '75 mg',
    manufacturer: 'USV Private Limited',
    composition: {
      salts: [{ name: 'Aspirin (Enteric Coated)', amount: '75mg' }],
    },
    aliases: ['Ecosprin 75', 'Ecosprin-AV', 'Delisprin 75', 'Aspent 75', 'Bayer Low Dose Aspirin'],
    category: 'Antiplatelet & Cardioprotective Agent',
    conditions: ['Coronary Artery Disease', 'Stent Implantation Care', 'Secondary Stroke Prevention', 'Heart Attack Prevention'],
    primaryUses: ['Prevents arterial blood clot formation', 'Secondary prevention of recurrent myocardial infarction and ischemic stroke'],
    use: 'Irreversibly inhibits cyclooxygenase-1 (COX-1) in platelets, halting thromboxane A2 production and blocking platelet aggregation.',
    standardDosage: '75 mg once daily with the main meal.',
    usageTiming: 'Take once daily after lunch or dinner with a full glass of water. Swallow whole (enteric coating protects stomach).',
    precautions: [
      'Do not crush or chew; enteric coating prevents direct gastric mucosal erosion.',
      'Inform surgeons and dentists about aspirin use before scheduled surgical procedures.',
      'Report any signs of unusual bruising, black tarry stools, or coffee-ground vomiting immediately.',
    ],
    sideEffects: ['Mild dyspepsia', 'Increased tendency to bruise or bleed', 'Gastric irritation (rare with enteric coat)'],
    storageConditions: 'Store in a dry place below 25°C. Moisture sensitive.',
    prescriptionRequired: true,
    searchKeywords: ['ecosprin', 'aspirin', 'blood thinner', 'heart attack', 'stent', 'stroke', 'clot prevention', 'ecosprin75'],
    source: 'database',
  },

  // ==================== 3. DIABETES & METABOLIC DISORDERS ====================
  {
    id: 'med_glycomet_500_sr',
    name: 'Glycomet 500mg SR Tablet',
    brandName: 'Glycomet 500 SR',
    genericName: 'Metformin Sustained Release',
    dosageForm: 'Sustained Release Tablet',
    strength: '500 mg',
    manufacturer: 'USV Private Limited',
    composition: {
      salts: [{ name: 'Metformin Hydrochloride (Sustained Release)', amount: '500mg' }],
    },
    aliases: ['Glycomet 500 SR', 'Glucophage SR', 'Glyciphage SR', 'Formin 500', 'Riomet', 'Cetapin XR'],
    category: 'Antidiabetic / Biguanide (First-Line Glucose Controller)',
    conditions: ['Type 2 Diabetes Mellitus', 'Prediabetes', 'Insulin Resistance Syndrome', 'PCOS Glucose Regulation'],
    primaryUses: ['Lowers fasting and postprandial blood glucose', 'Improves peripheral tissue insulin sensitivity', 'Weight-neutral glycemic control'],
    use: 'Suppresses hepatic gluconeogenesis (liver glucose production), reduces intestinal glucose absorption, and enhances peripheral glucose uptake.',
    standardDosage: '500 mg once or twice daily with major meals (maximum 2000 mg daily).',
    usageTiming: 'Must be taken with or immediately after major meals (breakfast/dinner) to minimize GI side effects.',
    precautions: [
      'Take strictly with food; taking on an empty stomach frequently causes nausea and loose stools.',
      'Avoid excessive alcohol consumption to prevent lactic acidosis.',
      'Temporarily stop medication prior to procedures requiring iodinated radiocontrast dyes.',
      'Monitor kidney function (eGFR) and Vitamin B12 levels annually during long-term therapy.',
    ],
    sideEffects: ['Metallic taste in mouth', 'Nausea / Flatulence', 'Loose stools / Diarrhea (usually subsides after 1-2 weeks)'],
    storageConditions: 'Store below 30°C in a dry place.',
    prescriptionRequired: true,
    searchKeywords: ['glycomet', 'metformin', 'sugar', 'diabetes', 'fasting sugar', 'pp sugar', 'glucophage', 'glyciphage', 'type 2'],
    source: 'database',
  },
  {
    id: 'med_glycomet_gp1',
    name: 'Glycomet-GP 1 Tablet',
    brandName: 'Glycomet-GP 1',
    genericName: 'Glimepiride + Metformin Sustained Release',
    dosageForm: 'Bilayered Tablet',
    strength: '1 mg + 500 mg',
    manufacturer: 'USV Private Limited',
    composition: {
      salts: [
        { name: 'Glimepiride', amount: '1mg' },
        { name: 'Metformin Hydrochloride (SR)', amount: '500mg' },
      ],
    },
    aliases: ['Glycomet GP 1', 'Zoryl M1', 'Amaryl M1', 'Gemer 1', 'Glimestar M1', 'Glyciphage-G1'],
    category: 'Combination Antidiabetic (Sulfonylurea + Biguanide)',
    conditions: ['Type 2 Diabetes uncontrolled on single agent', 'High Postprandial Blood Sugar', 'Metabolic Syndrome'],
    primaryUses: ['Dual-action glycemic control for fasting and after-meal glucose surges'],
    use: 'Glimepiride stimulates beta cells to secrete insulin during meals while Metformin reduces liver glucose production.',
    standardDosage: '1 tablet once daily in the morning with breakfast.',
    usageTiming: 'Take immediately before or with the first major meal (breakfast). Never skip meals after taking this tablet.',
    precautions: [
      'CRITICAL: Risk of hypoglycemia (low blood sugar). Always carry glucose sweets or fruit juice.',
      'Never skip a meal after taking this medicine.',
      'Learn low blood sugar symptoms: sweating, shaking, sudden hunger, dizziness, and rapid heartbeat.',
    ],
    sideEffects: ['Hypoglycemia risk', 'Nausea', 'Mild abdominal fullness', 'Weight gain (mild)'],
    storageConditions: 'Store below 25°C.',
    prescriptionRequired: true,
    searchKeywords: ['glycomet gp1', 'glimepiride metformin', 'diabetes 2 in 1', 'sugar tablet', 'zoryl m1', 'amaryl m1'],
    source: 'database',
  },
  {
    id: 'med_janumet_50_500',
    name: 'Janumet 50/500mg Tablet',
    brandName: 'Janumet 50/500',
    genericName: 'Sitagliptin + Metformin Hydrochloride',
    dosageForm: 'Film-coated Tablet',
    strength: '50 mg + 500 mg',
    manufacturer: 'MSD Pharmaceuticals / Sun Pharma',
    composition: {
      salts: [
        { name: 'Sitagliptin Phosphate', amount: '50mg' },
        { name: 'Metformin Hydrochloride', amount: '500mg' },
      ],
    },
    aliases: ['Janumet 50/500', 'Januvia Met', 'Istamet 50/500', 'Zita-Met Plus', 'Sitaglyn-M'],
    category: 'DPP-4 Inhibitor + Biguanide Combination',
    conditions: ['Type 2 Diabetes Mellitus', 'Postprandial Hyperglycemia', 'Low-Hypoglycemia Risk Diabetes Care'],
    primaryUses: ['Glucose-dependent insulin release with zero weight gain and low risk of hypoglycemia'],
    use: 'Sitagliptin prolongs active incretin hormones (GLP-1/GIP) to trigger insulin release only when food is present; Metformin enhances liver sensitivity.',
    standardDosage: '1 tablet twice daily with morning and evening meals.',
    usageTiming: 'Take with meals to minimize stomach upset.',
    precautions: [
      'Low intrinsic hypoglycemia risk when used without sulfonylureas.',
      'Report severe persistent upper stomach pain (rule out pancreatitis).',
      'Adjust dose if kidney impairment is present.',
    ],
    sideEffects: ['Stuffy / runny nose', 'Sore throat', 'Mild digestive discomfort'],
    storageConditions: 'Store below 25°C in original container.',
    prescriptionRequired: true,
    searchKeywords: ['janumet', 'sitagliptin', 'dpp4', 'sugar without low bp', 'januvia', 'istamet', 'diabetes'],
    source: 'database',
  },
  {
    id: 'med_forxiga_10',
    name: 'Forxiga 10mg Tablet',
    brandName: 'Forxiga 10',
    genericName: 'Dapagliflozin',
    dosageForm: 'Film-coated Tablet',
    strength: '10 mg',
    manufacturer: 'AstraZeneca Pharma India Ltd',
    composition: {
      salts: [{ name: 'Dapagliflozin Propanediol', amount: '10mg' }],
    },
    aliases: ['Forxiga 10', 'Farxiga 10', 'Oxra 10', 'Dapanorm 10', 'Dapaglyn 10', 'G Швеda 10'],
    category: 'SGLT-2 Inhibitor (Glucoretic & Cardiorenal Protector)',
    conditions: ['Type 2 Diabetes', 'Heart Failure with Reduced Ejection Fraction (HFrEF)', 'Chronic Kidney Disease (CKD)'],
    primaryUses: ['Eliminates glucose via urine', 'Significant reduction in cardiac failure hospitalizations and CKD progression', 'Mild weight loss & BP reduction'],
    use: 'Inhibits Sodium-Glucose Cotransporter 2 (SGLT2) in proximal renal tubules, inducing urinary excretion of ~70g glucose per day (~280 kcal).',
    standardDosage: '10 mg once daily, taken in the morning.',
    usageTiming: 'Take in the morning with a full glass of water, with or without food.',
    precautions: [
      'Drink plenty of fluids (6-8 glasses of water daily) to avoid dehydration.',
      'Maintain diligent genital hygiene to prevent urinary and fungal yeast infections.',
      'Withhold temporary use before major surgeries or prolonged fasting to prevent euglycemic DKA.',
    ],
    sideEffects: ['Increased frequency of urination', 'Genital fungal itching/infections', 'Thirst', 'Mild dizziness from volume loss'],
    storageConditions: 'Store below 30°C.',
    prescriptionRequired: true,
    searchKeywords: ['forxiga', 'dapagliflozin', 'sglt2', 'heart kidney sugar', 'farxiga', 'oxra', 'diabetes weight loss'],
    source: 'database',
  },

  // ==================== 4. GASTROENTEROLOGY & ACIDITY ====================
  {
    id: 'med_pan_d',
    name: 'Pan-D Capsule',
    brandName: 'Pan-D',
    genericName: 'Pantoprazole + Domperidone Sustained Release',
    dosageForm: 'Capsule',
    strength: '40 mg + 30 mg',
    manufacturer: 'Alkem Laboratories Ltd',
    composition: {
      salts: [
        { name: 'Pantoprazole Sodium (Enteric Coated)', amount: '40mg' },
        { name: 'Domperidone (Sustained Release)', amount: '30mg' },
      ],
    },
    aliases: ['Pan-D', 'Pantocid DSR', 'Pan DSR', 'Pantosec DSR', 'Nupenta-D', 'Protium-D'],
    category: 'Proton Pump Inhibitor (PPI) + Prokinetic',
    conditions: ['Gastroesophageal Reflux Disease (GERD)', 'Acid Reflux with Nausea', 'Gastritis & Heartburn', 'Bloating & Dyspepsia'],
    primaryUses: ['Suppresses stomach acid secretion', 'Speeds up gastric emptying to prevent regurgitation and nausea', 'Heals esophagus inflammation'],
    use: 'Pantoprazole irreversibly inhibits H+/K+ ATPase acid pumps in parietal cells; Domperidone increases upper GI motility and tone.',
    standardDosage: '1 capsule once daily in the morning.',
    usageTiming: 'MUST be taken on an empty stomach at least 30 to 45 minutes BEFORE breakfast with plain water.',
    precautions: [
      'Must be swallowed whole; do not open, chew, or crush the capsule beads.',
      'Ineffective if taken after eating food (acid pumps must be inactive when drug arrives).',
      'Long-term continuous use (> 1 year) may reduce calcium and magnesium absorption; review regularly.',
    ],
    sideEffects: ['Headache', 'Mild diarrhea or dry mouth', 'Abdominal flatulence', 'Dizziness (rare)'],
    storageConditions: 'Store below 25°C in a dry place protected from light and moisture.',
    prescriptionRequired: true,
    searchKeywords: ['pan d', 'pantoprazole', 'domperidone', 'acidity', 'gas', 'heartburn', 'gerd', 'reflux', 'vomiting', 'pan-d'],
    source: 'database',
  },
  {
    id: 'med_pantocid_40',
    name: 'Pantocid 40mg Tablet',
    brandName: 'Pantocid 40',
    genericName: 'Pantoprazole Gastro-resistant',
    dosageForm: 'Tablet',
    strength: '40 mg',
    manufacturer: 'Sun Pharmaceutical Industries Ltd',
    composition: {
      salts: [{ name: 'Pantoprazole Sodium', amount: '40mg' }],
    },
    aliases: ['Pantocid 40', 'Pan 40', 'Pantop 40', 'Protonix 40', 'Pantodac 40', 'Nupenta 40'],
    category: 'Proton Pump Inhibitor (Gastric Acid Reducer)',
    conditions: ['Gastric & Duodenal Ulcers', 'Acid Reflux / GERD', 'NSAID-Induced Gastritis Prevention', 'Zollinger-Ellison Syndrome'],
    primaryUses: ['Rapid ulcer healing', 'Prevents stomach irritation caused by painkillers and cardiac medicines', 'Severe heartburn relief'],
    use: 'Provides profound, long-lasting reduction of basal and stimulated gastric acid output for 24 hours.',
    standardDosage: '40 mg once daily, 30-45 minutes before morning breakfast.',
    usageTiming: 'Take first thing in the morning with a glass of water on an empty stomach.',
    precautions: ['Swallow whole; do not break or crush', 'Inform doctor if symptoms do not improve after 14 days'],
    sideEffects: ['Headache', 'Loose stools', 'Nausea'],
    storageConditions: 'Store below 25°C.',
    prescriptionRequired: true,
    searchKeywords: ['pantocid', 'pan 40', 'pantoprazole', 'acidity', 'stomach burning', 'ulcer', 'gastric'],
    source: 'database',
  },
  {
    id: 'med_digene_syrup',
    name: 'Digene Antacid Gel / Syrup',
    brandName: 'Digene Gel',
    genericName: 'Magnesium Hydroxide + Aluminium Hydroxide + Simethicone',
    dosageForm: 'Oral Liquid Gel',
    strength: '250mg + 300mg + 25mg per 5ml',
    manufacturer: 'Abbott Healthcare Pvt Ltd',
    composition: {
      salts: [
        { name: 'Magnesium Hydroxide', amount: '250mg' },
        { name: 'Aluminium Hydroxide', amount: '300mg' },
        { name: 'Simethicone', amount: '25mg' },
        { name: 'Sodium Carboxymethylcellulose', amount: '50mg' },
      ],
    },
    aliases: ['Digene', 'Gelusil', 'Mucaine Gel', 'Eno', 'Cremaffin', 'Polycrol'],
    category: 'Rapid Antacid & Antiflatulent Oral Gel',
    conditions: ['Instant Heartburn & Acidity', 'Gas & Trapped Wind', 'Bloating after heavy spicy meals', 'Acid Indigestion'],
    primaryUses: ['Neutralizes excess stomach acid within 2 minutes', 'Disperses gas bubbles to relieve flatulent fullness'],
    use: 'Direct chemical neutralization of stomach hydrochloric acid combined with surfactant Simethicone to burst gas pockets.',
    standardDosage: '2 to 3 teaspoonfuls (10-15 ml) after meals or at the onset of acidity symptoms.',
    usageTiming: 'Take 30 minutes after meals and before bedtime. Shake bottle well before use.',
    precautions: [
      'Allow a 2-hour gap between taking antacid gels and other oral medications (such as antibiotics or thyroid tablets).',
      'Patients on low-phosphate diets or with severe kidney failure should avoid prolonged intake.',
    ],
    sideEffects: ['Chalky taste', 'Mild bowel irregularity'],
    storageConditions: 'Store at room temperature. Do not freeze.',
    prescriptionRequired: false,
    searchKeywords: ['digene', 'antacid', 'gelusil', 'gas relief', 'acidity syrup', 'eno', 'indigestion', 'burning chest'],
    source: 'database',
  },

  // ==================== 5. THYROID & ENDOCRINE ====================
  {
    id: 'med_thyronorm_50',
    name: 'Thyronorm 50mcg Tablet',
    brandName: 'Thyronorm 50',
    genericName: 'Levothyroxine Sodium',
    dosageForm: 'Tablet',
    strength: '50 mcg',
    manufacturer: 'Abbott Healthcare Pvt Ltd',
    composition: {
      salts: [{ name: 'Levothyroxine Sodium (Synthetic T4)', amount: '50mcg (0.05mg)' }],
    },
    aliases: ['Thyronorm 50', 'Eltroxin 50', 'Synthroid 50', 'Thyrox 50', 'Levoxyl'],
    category: 'Endocrine / Synthetic Thyroid Hormone Replacement',
    conditions: ['Hypothyroidism (Underactive Thyroid)', 'Goiter Prevention', 'Hashimoto Thyroiditis', 'Post-Thyroidectomy Care'],
    primaryUses: ['Restores circulating T3/T4 thyroid hormone levels to normal metabolic baseline', 'Alleviates chronic fatigue, weight gain, and cold sensitivity'],
    use: 'Synthetic tetraiodothyronine (T4) that is deiodinated in peripheral organs into active triiodothyronine (T3) to regulate cellular metabolism.',
    standardDosage: '50 mcg once daily (dosage ranges from 12.5 mcg up to 150 mcg based on serum TSH reports).',
    usageTiming: 'CRITICAL: Must be taken FIRST THING in the morning on an empty stomach with a full glass of plain water, at least 45 to 60 minutes BEFORE morning tea, coffee, breakfast, or other medications.',
    precautions: [
      'NEVER take with milk, tea, coffee, or calcium/iron tablets, which drastically block absorption by up to 80%.',
      'Do not change brands without consulting your doctor; bioavailability varies between manufacturers.',
      'Check fasting TSH / Free T3/T4 every 6 to 12 weeks during dose titration, and every 6-12 months thereafter.',
    ],
    sideEffects: ['None when correctly dosed', 'Palpitations, tremors, weight loss or sweating only if overdosed (hyperthyroidism signs)'],
    storageConditions: 'Store below 25°C in a dry place. Protect from heat, direct light, and moisture.',
    prescriptionRequired: true,
    searchKeywords: ['thyronorm', 'thyroid', 'eltroxin', 'levothyroxine', 'tsh', 'thyronorm50', 'underactive thyroid', 't4', 'hypothyroid'],
    source: 'database',
  },
  {
    id: 'med_thyronorm_25',
    name: 'Thyronorm 25mcg Tablet',
    brandName: 'Thyronorm 25',
    genericName: 'Levothyroxine Sodium',
    dosageForm: 'Tablet',
    strength: '25 mcg',
    manufacturer: 'Abbott Healthcare Pvt Ltd',
    composition: {
      salts: [{ name: 'Levothyroxine Sodium', amount: '25mcg' }],
    },
    aliases: ['Thyronorm 25', 'Eltroxin 25', 'Thyrox 25', 'Synthroid 25'],
    category: 'Thyroid Hormone',
    conditions: ['Mild Subclinical Hypothyroidism', 'Elderly Thyroid Starter Dose'],
    primaryUses: ['Starting dose for elderly cardiac patients or mild TSH elevation'],
    use: 'Regulates basal metabolic rate and body energy levels.',
    standardDosage: '25 mcg once daily first thing in morning.',
    usageTiming: 'Empty stomach 45 mins before breakfast with water.',
    precautions: ['Do not take with tea/coffee', 'Regular TSH monitoring'],
    sideEffects: ['None at correct dose'],
    storageConditions: 'Store below 25°C.',
    prescriptionRequired: true,
    searchKeywords: ['thyronorm 25', 'thyroid 25', 'eltroxin 25', 'levothyroxine'],
    source: 'database',
  },

  // ==================== 6. CHOLESTEROL & LIPID MANAGEMENT ====================
  {
    id: 'med_rozavel_10',
    name: 'Rozavel 10mg Tablet',
    brandName: 'Rozavel 10',
    genericName: 'Rosuvastatin Calcium',
    dosageForm: 'Film-coated Tablet',
    strength: '10 mg',
    manufacturer: 'Sun Pharmaceutical Industries Ltd',
    composition: {
      salts: [{ name: 'Rosuvastatin Calcium', amount: '10mg' }],
    },
    aliases: ['Rozavel 10', 'Rosuvas 10', 'Crestor 10', 'Rosave 10', 'Roseday 10', 'Novastat 10'],
    category: 'Lipid Lowering / HMG-CoA Reductase Inhibitor (High-Intensity Statin)',
    conditions: ['Hypercholesterolemia (High LDL & Triglycerides)', 'Atherosclerosis Plaque Stabilization', 'Heart Attack & Stroke Prevention'],
    primaryUses: ['Lowers bad LDL cholesterol by 45-55%', 'Increases protective HDL cholesterol', 'Stabilizes arterial plaques to prevent rupture'],
    use: 'Competitively inhibits HMG-CoA reductase, the rate-limiting enzyme in hepatic cholesterol biosynthesis, clearing circulating LDL particles.',
    standardDosage: '10 mg once daily, taken at bedtime or dinner (range 5 mg to 20 mg daily).',
    usageTiming: 'Best taken at bedtime with water for optimal nocturnal hepatic cholesterol synthesis inhibition.',
    precautions: [
      'Report any unexplained, severe muscle pain, tenderness, or weakness (myopathy/rhabdomyolysis) immediately.',
      'Avoid heavy alcohol intake and excessive grapefruit consumption.',
      'Check baseline liver function tests (ALT/AST) and lipid profile periodically.',
    ],
    sideEffects: ['Mild muscle soreness / myalgia', 'Headache', 'Mild abdominal discomfort', 'Mild elevation in blood sugar in high doses'],
    storageConditions: 'Store below 30°C in original moisture-proof blister pack.',
    prescriptionRequired: true,
    searchKeywords: ['rozavel', 'rosuvastatin', 'cholesterol', 'ldl', 'triglycerides', 'lipid', 'crestor', 'rosuvas', 'statin', 'heart blockage'],
    source: 'database',
  },
  {
    id: 'med_atorva_20',
    name: 'Atorva 20mg Tablet',
    brandName: 'Atorva 20',
    genericName: 'Atorvastatin Calcium',
    dosageForm: 'Tablet',
    strength: '20 mg',
    manufacturer: 'Zydus Cadila',
    composition: {
      salts: [{ name: 'Atorvastatin Calcium', amount: '20mg' }],
    },
    aliases: ['Atorva 20', 'Lipitor 20', 'Storvas 20', 'Atocor 20', 'Tonact 20', 'Atorlip 20'],
    category: 'Lipid Lowering / HMG-CoA Reductase Inhibitor',
    conditions: ['High Cholesterol', 'Dyslipidemia', 'Post-Angioplasty Care', 'Coronary Plaque Management'],
    primaryUses: ['Reduces total cholesterol, LDL, and Apo-B', 'Reduces risk of non-fatal stroke and MI'],
    use: 'Suppresses liver cholesterol output and up-regulates cell-surface LDL receptors.',
    standardDosage: '20 mg once daily at bedtime (ranges 10 mg to 80 mg daily).',
    usageTiming: 'Take in the evening or bedtime with water.',
    precautions: ['Report severe muscle weakness', 'Avoid excessive alcohol', 'Not for pregnant women'],
    sideEffects: ['Joint ache', 'Mild digestive upset', 'Fatigue'],
    storageConditions: 'Store below 25°C.',
    prescriptionRequired: true,
    searchKeywords: ['atorva', 'atorvastatin', 'lipitor', 'cholesterol', 'storvas', 'tonact', 'heart block'],
    source: 'database',
  },

  // ==================== 7. ANTIBIOTICS & ANTIMICROBIALS ====================
  {
    id: 'med_augmentin_625',
    name: 'Augmentin 625 Duo Tablet',
    brandName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Clavulanic Acid',
    dosageForm: 'Film-coated Tablet',
    strength: '500 mg + 125 mg',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    composition: {
      salts: [
        { name: 'Amoxicillin Trihydrate', amount: '500mg' },
        { name: 'Clavulanate Potassium', amount: '125mg' },
      ],
    },
    aliases: ['Augmentin 625', 'Moxikind-CV 625', 'Clavam 625', 'Amoxyclav 625', 'Novamox-CV', 'Advent 625'],
    category: 'Broad-Spectrum Penicillin Antibiotic + Beta-Lactamase Inhibitor',
    conditions: ['Bacterial Sinusitis', 'Pneumonia & Bronchitis', 'Ear Infections (Otitis Media)', 'Urinary Tract Infections (UTI)', 'Skin & Soft Tissue Infections', 'Dental Abscess'],
    primaryUses: ['Eradicates beta-lactamase producing resistant bacterial infections', 'Severe throat, chest, and tooth infections'],
    use: 'Amoxicillin bactericidally disrupts bacterial cell wall synthesis while Clavulanic Acid protects it by neutralizing destructive beta-lactamase enzymes.',
    standardDosage: '1 tablet (625 mg) twice daily (every 12 hours) for 5 to 7 days.',
    usageTiming: 'Take at the start of a meal or with food to optimize absorption and prevent antibiotic-induced stomach upset.',
    precautions: [
      'CRITICAL: Complete the FULL prescribed 5-7 day course even if you feel completely healthy after 2 days.',
      'Contraindicated in patients with severe penicillin or cephalosporin allergy.',
      'Consider taking a probiotic supplement 2 hours apart to protect beneficial gut microflora.',
    ],
    sideEffects: ['Loose stools / Mild diarrhea', 'Nausea / Abdominal cramping', 'Oral or vaginal candidiasis (thrush)', 'Skin rash'],
    storageConditions: 'Store below 25°C in original moisture-tight aluminum blister. Highly hygroscopic.',
    prescriptionRequired: true,
    searchKeywords: ['augmentin', 'augmentin625', 'clavam', 'moxikind cv', 'antibiotic', 'infection', 'throat infection', 'chest infection', 'sinus', 'pus', 'tooth infection'],
    source: 'database',
  },
  {
    id: 'med_azithral_500',
    name: 'Azithral 500mg Tablet',
    brandName: 'Azithral 500',
    genericName: 'Azithromycin',
    dosageForm: 'Tablet',
    strength: '500 mg',
    manufacturer: 'Alembic Pharmaceuticals Ltd',
    composition: {
      salts: [{ name: 'Azithromycin Dihydrate', amount: '500mg' }],
    },
    aliases: ['Azithral 500', 'Azee 500', 'Zithromax 500', 'Azimax 500', 'Azibact 500'],
    category: 'Macrolide Antibiotic',
    conditions: ['Tonsillitis & Pharyngitis', 'Community Acquired Pneumonia', 'Typhoid Fever Adjunct', 'Skin Infections', 'Bronchial Infections'],
    primaryUses: ['Convenient once-daily 3 to 5 day short-course antibiotic for respiratory and throat infections'],
    use: 'Reversibly binds to 50S ribosomal subunit of bacteria, blocking transpeptidation and bacterial protein synthesis.',
    standardDosage: '500 mg once daily for 3 consecutive days (or 500 mg day 1, then 250 mg days 2-5).',
    usageTiming: 'Take once daily at the same time, 1 hour before or 2 hours after food with a full glass of water.',
    precautions: [
      'Finish the complete 3-day or 5-day cycle as instructed.',
      'Inform doctor if you have known cardiac QT interval prolongation.',
    ],
    sideEffects: ['Mild loose stools', 'Nausea', 'Abdominal pain', 'Transient taste disturbance'],
    storageConditions: 'Store below 30°C.',
    prescriptionRequired: true,
    searchKeywords: ['azithral', 'azithromycin', 'azee', 'throat pain', 'tonsils', 'antibiotic 3 days', 'cough infection'],
    source: 'database',
  },
  {
    id: 'med_taxim_o_200',
    name: 'Taxim-O 200mg Tablet',
    brandName: 'Taxim-O 200',
    genericName: 'Cefixime Trihydrate',
    dosageForm: 'Dispersible / Film-coated Tablet',
    strength: '200 mg',
    manufacturer: 'Alkem Laboratories Ltd',
    composition: {
      salts: [{ name: 'Cefixime Trihydrate', amount: '200mg' }],
    },
    aliases: ['Taxim O 200', 'Zifi 200', 'Cefspan 200', 'Mahacef 200', 'Omnicef', 'Cefolac 200'],
    category: 'Third-Generation Cephalosporin Antibiotic',
    conditions: ['Urinary Tract Infections (UTI)', 'Typhoid Fever', 'Acute Bronchitis', 'Otitis Media'],
    primaryUses: ['Oral cephalosporin treatment for resistant urinary and systemic fever infections'],
    use: 'Binds penicillin-binding proteins (PBPs) to inhibit bacterial cell wall peptidoglycan synthesis.',
    standardDosage: '200 mg twice daily for 5 to 10 days.',
    usageTiming: 'Take after meals with water.',
    precautions: ['Complete full course', 'Take with food to minimize loose stools'],
    sideEffects: ['Diarrhea', 'Mild stomach upset'],
    storageConditions: 'Store below 25°C.',
    prescriptionRequired: true,
    searchKeywords: ['taxim o', 'zifi', 'cefixime', 'uti', 'urine infection', 'typhoid', 'fever antibiotic'],
    source: 'database',
  },

  // ==================== 8. VITAMINS, MINERALS & NUTRACEUTICALS ====================
  {
    id: 'med_shelcal_500',
    name: 'Shelcal 500mg Tablet',
    brandName: 'Shelcal 500',
    genericName: 'Calcium + Vitamin D3 (Cholecalciferol)',
    dosageForm: 'Tablet',
    strength: '500 mg Calcium + 250 IU Vitamin D3',
    manufacturer: 'Torrent Pharmaceuticals Ltd',
    composition: {
      salts: [
        { name: 'Elemental Calcium (from Calcium Carbonate)', amount: '500mg' },
        { name: 'Vitamin D3 (Cholecalciferol)', amount: '250 IU' },
      ],
    },
    aliases: ['Shelcal 500', 'Calcirol Gem', 'Cipcal 500', 'Gemcal', 'Maxical 500', 'Supracal'],
    category: 'Nutritional / Bone & Mineral Supplement',
    conditions: ['Osteoporosis Prevention', 'Osteopenia in Elders', 'Calcium Deficiency', 'Post-Menopausal Bone Health', 'Fracture Healing'],
    primaryUses: ['Maintains bone mineral density and prevents brittle bones in seniors', 'Facilitates calcium absorption in gut'],
    use: 'Supplies bioavailable elemental calcium to skeletal matrix while Vitamin D3 activates intestinal calcium transport proteins.',
    standardDosage: '1 tablet once or twice daily after meals.',
    usageTiming: 'Take immediately after breakfast or lunch with water (gastric acid helps dissolve calcium carbonate).',
    precautions: [
      'Maintain at least a 2-hour gap between taking Shelcal and Thyroid medicine (Thyronorm) or Iron supplements.',
      'Do not exceed recommended daily allowance unless specifically instructed by your physician.',
      'Drink plenty of water to prevent kidney stone formation in prone individuals.',
    ],
    sideEffects: ['Mild constipation', 'Abdominal gas / bloating', 'Chalky taste'],
    storageConditions: 'Store below 25°C in a dry place.',
    prescriptionRequired: false,
    searchKeywords: ['shelcal', 'calcium', 'vitamin d3', 'bone', 'joint weakness', 'osteoporosis', 'calcium 500', 'cipcal'],
    source: 'database',
  },
  {
    id: 'med_becosules_z',
    name: 'Becosules Z Capsule',
    brandName: 'Becosules Z',
    genericName: 'B-Complex Vitamins + Vitamin C + Zinc',
    dosageForm: 'Capsule',
    strength: 'B1, B2, B6, B12, Niacinamide, Folic Acid, Vitamin C 50mg, Zinc 41.4mg',
    manufacturer: 'Pfizer Limited',
    composition: {
      salts: [
        { name: 'Vitamin B1 (Thiamine)', amount: '10mg' },
        { name: 'Vitamin B2 (Riboflavin)', amount: '10mg' },
        { name: 'Vitamin B6 (Pyridoxine)', amount: '3mg' },
        { name: 'Vitamin B12 (Cyanocobalamin)', amount: '15mcg' },
        { name: 'Niacinamide (Vitamin B3)', amount: '100mg' },
        { name: 'Calcium Pantothenate', amount: '50mg' },
        { name: 'Folic Acid', amount: '1.5mg' },
        { name: 'Vitamin C (Ascorbic Acid)', amount: '150mg' },
        { name: 'Zinc Sulphate Monohydrate', amount: '41.4mg' },
      ],
    },
    aliases: ['Becosules', 'Becosules Z', 'Cobadex Forte', 'Surbex XT', 'B-Plex', 'Polycare B'],
    category: 'Multivitamin & Immune Support Formulation',
    conditions: ['Mouth Ulcers (Aphthous Stomatitis)', 'Post-Antibiotic Fatigue', 'General Debility & Convalescence', 'Immunity Boost'],
    primaryUses: ['Rapid healing of mouth ulcers and tongue sores', 'Restores depleted B-complex reserves after viral illness', 'Energy metabolism support'],
    use: 'Replenishes cofactors essential for cellular Krebs cycle ATP generation, mucosal tissue repair, and immune neutrophil activity.',
    standardDosage: '1 capsule daily for 15 to 30 days.',
    usageTiming: 'Take once daily after breakfast or lunch with water.',
    precautions: [
      'Urine will turn bright harmless neon-yellow due to excretion of excess riboflavin (Vitamin B2); this is completely normal.',
    ],
    sideEffects: ['Bright yellow urine (harmless)', 'Mild flushing'],
    storageConditions: 'Store in a cool dry place below 25°C.',
    prescriptionRequired: false,
    searchKeywords: ['becosules', 'mouth ulcer', 'vitamin b complex', 'zinc', 'weakness', 'fatigue', 'energy capsule', 'pfizer'],
    source: 'database',
  },
  {
    id: 'med_neurobion_forte',
    name: 'Neurobion Forte Tablet',
    brandName: 'Neurobion Forte',
    genericName: 'High Potency B1 + B6 + B12 (Cyanocobalamin)',
    dosageForm: 'Tablet',
    strength: 'B1 10mg + B2 10mg + B3 45mg + B5 50mg + B6 3mg + B12 15mcg',
    manufacturer: 'Procter & Gamble Health Ltd (P&G)',
    composition: {
      salts: [
        { name: 'Vitamin B1', amount: '10mg' },
        { name: 'Vitamin B2', amount: '10mg' },
        { name: 'Vitamin B3', amount: '45mg' },
        { name: 'Vitamin B5', amount: '50mg' },
        { name: 'Vitamin B6', amount: '3mg' },
        { name: 'Vitamin B12 (Cyanocobalamin)', amount: '15mcg' },
      ],
    },
    aliases: ['Neurobion Forte', 'Nurokind-Gold', 'Optineuron', 'Nurokind-Plus', 'Meganeuron'],
    category: 'Neurotropic Vitamin Supplement',
    conditions: ['Diabetic Peripheral Neuropathy (Tingling & Numbness in Feet)', 'Sciatica Nerve Soreness', 'Vitamin B12 Deficiency'],
    primaryUses: ['Soothes burning and tingling sensations in hands and feet', 'Promotes myelin sheath regeneration around peripheral nerves'],
    use: 'Supplies key neurotrophic vitamins essential for neural axon health, myelin maintenance, and neurotransmitter synthesis.',
    standardDosage: '1 tablet daily after food.',
    usageTiming: 'Take daily with water after morning meal.',
    precautions: ['Safe for long-term supportive care in diabetic patients', 'Report any severe sensory loss to your neurologist'],
    sideEffects: ['Minimal side effects', 'Bright yellow urine'],
    storageConditions: 'Store below 25°C.',
    prescriptionRequired: false,
    searchKeywords: ['neurobion', 'neurobion forte', 'tingling feet', 'numbness', 'nerve pain', 'b12', 'diabetic nerve', 'sciatica'],
    source: 'database',
  },

  // ==================== 9. RESPIRATORY & ANTI-ALLERGIC ====================
  {
    id: 'med_allegra_120',
    name: 'Allegra 120mg Tablet',
    brandName: 'Allegra 120',
    genericName: 'Fexofenadine Hydrochloride',
    dosageForm: 'Tablet',
    strength: '120 mg',
    manufacturer: 'Sanofi India Ltd',
    composition: {
      salts: [{ name: 'Fexofenadine Hydrochloride', amount: '120mg' }],
    },
    aliases: ['Allegra 120', 'Allegra 180', 'Fexova 120', 'Fexigra 120', 'Histafree 120', 'Telfast'],
    category: 'Second-Generation Non-Sedating Antihistamine',
    conditions: ['Allergic Rhinitis (Sneezing & Runny Nose)', 'Seasonal Hay Fever', 'Chronic Urticaria (Hives & Itching)', 'Dust & Pollen Allergies'],
    primaryUses: ['Rapid relief from watery eyes, sneezing, and nasal discharge with zero daytime sleepiness'],
    use: 'Selectively antagonizes peripheral H1 receptors without crossing the blood-brain barrier, preventing sedative drowsiness.',
    standardDosage: '120 mg once daily (or 180 mg for severe skin hives).',
    usageTiming: 'Take once daily with water. Avoid taking with fruit juices (apple, orange, grapefruit) which reduce absorption.',
    precautions: [
      'Take with plain water only; fruit juices can decrease bioavailability by 30-50%.',
      'Non-drowsy formulation safe for daytime office and driving use.',
    ],
    sideEffects: ['Headache (mild)', 'Dry mouth (rare)', 'Nausea (rare)'],
    storageConditions: 'Store below 25°C in a dry place.',
    prescriptionRequired: false,
    searchKeywords: ['allegra', 'fexofenadine', 'allergy', 'sneezing', 'runny nose', 'hives', 'itching', 'dust allergy', 'non drowsy allergy'],
    source: 'database',
  },
  {
    id: 'med_montair_lc',
    name: 'Montair-LC Tablet',
    brandName: 'Montair-LC',
    genericName: 'Levocetirizine + Montelukast',
    dosageForm: 'Film-coated Tablet',
    strength: '5 mg + 10 mg',
    manufacturer: 'Cipla Ltd',
    composition: {
      salts: [
        { name: 'Levocetirizine Dihydrochloride', amount: '5mg' },
        { name: 'Montelukast Sodium', amount: '10mg' },
      ],
    },
    aliases: ['Montair LC', 'Montek-LC', 'Telekast-L', 'Monticope', 'Levocet-M', 'Romilast-L'],
    category: 'Antihistamine + Leukotriene Receptor Antagonist (LTRA)',
    conditions: ['Allergic Asthma Prophylaxis', 'Nighttime Allergic Cough', 'Severe Chronic Rhinitis', 'Post-Nasal Drip'],
    primaryUses: ['Blocks both histamine and leukotriene pathways to soothe airway inflammation, chest tightness, and nasal congestion'],
    use: 'Montelukast blocks cysteinyl leukotriene CysLT1 receptors on bronchioles; Levocetirizine blocks histamine H1 receptors.',
    standardDosage: '1 tablet once daily at bedtime.',
    usageTiming: 'Best taken in the evening / at bedtime with water.',
    precautions: [
      'May cause mild drowsiness; avoid driving if feeling sleepy.',
      'Report any unusual mood changes or vivid dreams to your physician.',
      'Not for acute emergency asthma attacks (use rescue inhaler instead).',
    ],
    sideEffects: ['Drowsiness', 'Fatigue', 'Dry mouth', 'Vivid dreams (rare)'],
    storageConditions: 'Store in a dry place below 30°C.',
    prescriptionRequired: true,
    searchKeywords: ['montair lc', 'montelukast', 'levocetirizine', 'asthma allergy', 'night cough', 'wheezing', 'cipla', 'montek lc'],
    source: 'database',
  },
  {
    id: 'med_foracort_200',
    name: 'Foracort 200 Inhaler',
    brandName: 'Foracort 200',
    genericName: 'Budesonide + Formoterol Fumarate',
    dosageForm: 'Metered Dose Inhaler (MDI)',
    strength: '200 mcg + 6 mcg per actuation',
    manufacturer: 'Cipla Ltd',
    composition: {
      salts: [
        { name: 'Budesonide (Inhaled Corticosteroid)', amount: '200mcg' },
        { name: 'Formoterol Fumarate (LABA)', amount: '6mcg' },
      ],
    },
    aliases: ['Foracort 200', 'Symbicort 200', 'Budamate 200', 'Formonide 200', 'Duoresp Spiromax'],
    category: 'Respiratory / Inhaled Corticosteroid (ICS) + Long-Acting Beta Agonist (LABA)',
    conditions: ['Bronchial Asthma Maintenance', 'Chronic Obstructive Pulmonary Disease (COPD)', 'Chronic Bronchitis Breathlessness'],
    primaryUses: ['Daily controller therapy to prevent asthma attacks, wheezing, and morning chest tightness'],
    use: 'Formoterol rapidly and continuously relaxes bronchial smooth muscle for 12 hours while Budesonide dampens airway mucosal swelling.',
    standardDosage: '1 to 2 puffs twice daily (morning and night), followed by mouth gargling.',
    usageTiming: 'Inhale with spacer or directly, breathe in deeply and hold breath for 10 seconds. Rinse mouth thoroughly afterwards.',
    precautions: [
      'CRITICAL: ALWAYS rinse your mouth and gargle with warm water and spit it out after every inhalation to prevent fungal oral thrush (candidiasis) and hoarseness.',
      'Do not suddenly stop maintenance inhaler even when breathing feels clear.',
    ],
    sideEffects: ['Oral thrush (if mouth not rinsed)', 'Hoarseness of voice', 'Mild finger tremor (rare)', 'Palpitations (rare)'],
    storageConditions: 'Store pressurized canister below 30°C. Protect from puncture or direct flame.',
    prescriptionRequired: true,
    searchKeywords: ['foracort', 'inhaler', 'asthma', 'budesonide', 'formoterol', 'copd', 'breathlessness', 'wheezing', 'cipla inhaler', 'symbicort'],
    source: 'database',
  },
];

/**
 * Calculates Levenshtein edit distance between two strings
 * for robust fuzzy typo tolerance.
 */
function getLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Merged Database: Curated Clinical + Indian Medicine Dataset
 * Curated medicines take priority (higher quality data)
 * Indian medicines supplement with broader coverage
 */
export const COMPREHENSIVE_MEDICINE_DATABASE: MedicineInfo[] = [
  ...CURATED_MEDICINES,
  ...INDIAN_MEDICINES_DB.filter(
    (indian) => !CURATED_MEDICINES.some((c) => c.brandName?.toLowerCase() === indian.brandName?.toLowerCase())
  ),
];

/**
 * Fuse.js powered fuzzy search for instant typo-tolerant results
 */
const fuseOptions = {
  keys: [
    { name: 'name', weight: 10 },
    { name: 'brandName', weight: 10 },
    { name: 'genericName', weight: 7 },
    { name: 'manufacturer', weight: 3 },
    { name: 'composition.salts.name', weight: 7 },
    { name: 'searchKeywords', weight: 5 },
    { name: 'primaryUses', weight: 3 },
    { name: 'conditions', weight: 3 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

const fuseIndex = new Fuse(COMPREHENSIVE_MEDICINE_DATABASE, fuseOptions);

/**
 * Weighted Clinical Medicine Search with Typo Tolerance
 * Ranking priority:
 * 1. Brand Name & exact alias match (Weight: 10)
 * 2. Active Salt Composition / Generic Name (Weight: 7)
 * 3. Search Keywords & Clinical Abbreviations (Weight: 5)
 * 4. Primary Uses & Conditions (Weight: 3)
 */
export function searchMedicinesInDatabase(query: string): MedicineInfo[] {
  if (!query || !query.trim()) {
    return COMPREHENSIVE_MEDICINE_DATABASE.slice(0, 50);
  }

  const rawQuery = query.trim().toLowerCase();
  
  // Try exact prefix matches first (instant)
  const exactMatches = COMPREHENSIVE_MEDICINE_DATABASE.filter((med) => {
    const brand = (med.brandName || med.name).toLowerCase();
    const generic = (med.genericName || '').toLowerCase();
    const salts = (med.composition?.salts || []).map((s) => s.name.toLowerCase()).join(' ');
    const aliases = (med.aliases || []).map((a) => a.toLowerCase());
    
    return brand.startsWith(rawQuery) || 
           aliases.some(a => a.startsWith(rawQuery)) ||
           generic.startsWith(rawQuery) ||
           salts.startsWith(rawQuery);
  });
  
  if (exactMatches.length > 0) {
    return exactMatches.slice(0, 20);
  }

  // Use Fuse.js for fuzzy search
  const fuseResults = fuseIndex.search(rawQuery);
  return fuseResults.map(r => r.item).slice(0, 30);
}

/**
 * Instant local lookup for exact or top match
 */
export function findMedicineInLocalDatabase(query: string): MedicineInfo | null {
  const results = searchMedicinesInDatabase(query);
  return results.length > 0 ? results[0] : null;
}
