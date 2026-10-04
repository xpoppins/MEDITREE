import csv
import json
from collections import Counter

SALT_KNOWLEDGE_BASE = {
    "paracetamol": {"uses": "Fever reduction, headache relief, mild to moderate body pain.", "dosage_standard": "1 tablet every 4-6 hours as needed. Max 3000 mg/day.", "food_relation": "Best taken after meals."},
    "telmisartan": {"uses": "High blood pressure, cardiovascular protection, diabetic kidney disease.", "dosage_standard": "40 mg once daily (20-80 mg).", "food_relation": "With/without food, same time daily."},
    "amoxicillin": {"uses": "Bacterial infections (throat, respiratory, UTI, skin).", "dosage_standard": "Complete full 5-7 day course as prescribed.", "food_relation": "With food to reduce nausea."},
    "clavulanic acid": {"uses": "Enhances amoxicillin against resistant bacteria.", "dosage_standard": "Combined with amoxicillin (125mg).", "food_relation": "With food."},
    "azithromycin": {"uses": "Respiratory, throat, skin infections.", "dosage_standard": "500mg day 1, then 250mg days 2-5.", "food_relation": "1hr before/2hr after food."},
    "ambroxol": {"uses": "Chest congestion, mucus clearance.", "dosage_standard": "30mg 2-3 times daily.", "food_relation": "With/without food."},
    "levosalbutamol": {"uses": "Asthma, COPD - bronchodilator.", "dosage_standard": "As prescribed.", "food_relation": "With/without food."},
    "fexofenadine": {"uses": "Allergic rhinitis, hives - non-sedating.", "dosage_standard": "120mg once daily (180mg for urticaria).", "food_relation": "With water; avoid fruit juices."},
    "metformin": {"uses": "Type 2 diabetes - first line.", "dosage_standard": "500-1000mg 1-2x daily with meals (max 2000mg).", "food_relation": "MUST with food."},
    "glimepiride": {"uses": "Type 2 diabetes - sulfonylurea.", "dosage_standard": "1-4mg once daily with breakfast.", "food_relation": "With first meal; never skip meals."},
    "sitagliptin": {"uses": "Type 2 diabetes - DPP-4 inhibitor.", "dosage_standard": "100mg once daily (adjust for kidney).", "food_relation": "With/without food."},
    "dapagliflozin": {"uses": "Type 2 diabetes, heart failure, CKD - SGLT2.", "dosage_standard": "10mg once daily morning.", "food_relation": "With water; drink fluids."},
    "pantoprazole": {"uses": "GERD, acid reflux, ulcers - PPI.", "dosage_standard": "40mg once daily, 30-45min BEFORE breakfast.", "food_relation": "CRITICAL: Empty stomach before food."},
    "domperidone": {"uses": "Nausea, vomiting, gastric motility.", "dosage_standard": "10-30mg 15-30min before meals.", "food_relation": "Before meals."},
    "amlodipine": {"uses": "Hypertension, angina - CCB.", "dosage_standard": "5-10mg once daily.", "food_relation": "With/without food; avoid grapefruit."},
    "cilnidipine": {"uses": "Hypertension with tachycardia - dual L/N blocker.", "dosage_standard": "10-20mg once daily.", "food_relation": "Morning with water."},
    "metoprolol": {"uses": "Hypertension, tachycardia, angina - beta blocker.", "dosage_standard": "25-100mg once daily (ER).", "food_relation": "With/after food; NEVER stop suddenly."},
    "aspirin": {"uses": "Antiplatelet, heart/stroke prevention.", "dosage_standard": "75-150mg once daily with meal.", "food_relation": "After food; swallow whole."},
    "rosuvastatin": {"uses": "High LDL, cardio protection - statin.", "dosage_standard": "10-20mg once daily at bedtime.", "food_relation": "Bedtime optimal; avoid grapefruit."},
    "atorvastatin": {"uses": "High cholesterol - statin.", "dosage_standard": "10-80mg once daily at bedtime.", "food_relation": "Evening; avoid excess alcohol."},
    "levothyroxine": {"uses": "Hypothyroidism - thyroid hormone.", "dosage_standard": "Per TSH (12.5-150mcg daily).", "food_relation": "CRITICAL: Empty stomach 45-60min before ANYTHING."},
    "calcium carbonate": {"uses": "Osteoporosis, calcium deficiency.", "dosage_standard": "500-1000mg 1-2x daily.", "food_relation": "After meals; separate from thyroid/iron 2hrs."},
    "vitamin d3": {"uses": "Vitamin D deficiency, bone health.", "dosage_standard": "1000-4000 IU daily/weekly.", "food_relation": "With fat-containing meal."},
    "mecobalamin": {"uses": "B12 deficiency, neuropathy.", "dosage_standard": "500-1500mcg daily.", "food_relation": "With/without food."},
    "pregabalin": {"uses": "Neuropathic pain, fibromyalgia.", "dosage_standard": "75-300mg daily divided.", "food_relation": "With/without food."},
    "gabapentin": {"uses": "Neuropathic pain, seizures.", "dosage_standard": "300-1800mg daily divided.", "food_relation": "With/without food."},
    "rabeprazole": {"uses": "GERD, ulcers - PPI.", "dosage_standard": "20mg once daily before breakfast.", "food_relation": "Empty stomach 30min before food."},
    "esomeprazole": {"uses": "GERD, acid reflux - PPI.", "dosage_standard": "20-40mg once daily before meal.", "food_relation": "At least 1hr before meals."},
    "losartan": {"uses": "Hypertension, diabetic nephropathy - ARB.", "dosage_standard": "50-100mg once daily.", "food_relation": "With/without food."},
    "olmesartan": {"uses": "Hypertension - ARB.", "dosage_standard": "20-40mg once daily.", "food_relation": "With/without food."},
    "hydrochlorothiazide": {"uses": "Hypertension, edema - diuretic.", "dosage_standard": "12.5-25mg once daily morning.", "food_relation": "Morning to avoid nighttime urination."},
    "ibuprofen": {"uses": "Pain, inflammation, fever - NSAID.", "dosage_standard": "400-600mg every 6-8hrs with food.", "food_relation": "ALWAYS with food."},
    "diclofenac": {"uses": "Pain, inflammation - NSAID.", "dosage_standard": "50-100mg 2-3x daily with food.", "food_relation": "Must with food."},
    "aceclofenac": {"uses": "Arthritis pain - NSAID.", "dosage_standard": "100mg twice daily with food.", "food_relation": "With food; antacid if gastritis-prone."},
    "serratiopeptidase": {"uses": "Swelling, inflammation - enzyme.", "dosage_standard": "10-20mg 2-3x daily.", "food_relation": "After meals."},
    "tramadol": {"uses": "Moderate-severe pain - opioid.", "dosage_standard": "50-100mg every 6-8hrs (max 400mg).", "food_relation": "With/without food; avoid alcohol."},
    "cefixime": {"uses": "UTI, typhoid, respiratory - cephalosporin.", "dosage_standard": "200mg twice daily 5-10 days.", "food_relation": "With food."},
    "cefpodoxime": {"uses": "Respiratory, UTI, skin - cephalosporin.", "dosage_standard": "200mg twice daily.", "food_relation": "With food."},
    "ofloxacin": {"uses": "Bacterial infections - fluoroquinolone.", "dosage_standard": "200-400mg twice daily.", "food_relation": "With water; avoid dairy 2hrs."},
    "levofloxacin": {"uses": "Respiratory, UTI - fluoroquinolone.", "dosage_standard": "500-750mg once daily.", "food_relation": "With/without food; hydrate."},
    "doxycycline": {"uses": "Acne, respiratory, tick-borne - tetracycline.", "dosage_standard": "100mg twice daily.", "food_relation": "Full glass water; don't lie down 30min."},
    "clarithromycin": {"uses": "Respiratory, skin, H. pylori - macrolide.", "dosage_standard": "250-500mg twice daily.", "food_relation": "With food if stomach upset."},
    "montelukast": {"uses": "Asthma, allergic rhinitis.", "dosage_standard": "10mg once daily at bedtime.", "food_relation": "With/without food."},
    "cetirizine": {"uses": "Allergies, hives - antihistamine.", "dosage_standard": "10mg once daily.", "food_relation": "With/without food; may cause drowsiness."},
    "levocetirizine": {"uses": "Allergic rhinitis, urticaria.", "dosage_standard": "5mg once daily at bedtime.", "food_relation": "Evening preferred."},
    "bilastine": {"uses": "Allergic rhinitis - non-sedating.", "dosage_standard": "20mg once daily.", "food_relation": "Empty stomach 1hr before/2hr after food."},
    "famotidine": {"uses": "Acid reflux - H2 blocker.", "dosage_standard": "20-40mg once/twice daily.", "food_relation": "With/without food."},
    "ondansetron": {"uses": "Nausea, vomiting.", "dosage_standard": "4-8mg every 8 hours.", "food_relation": "With/without food."},
    "vitamin b12": {"uses": "B12 deficiency, neuropathy.", "dosage_standard": "500-1500mcg daily.", "food_relation": "With/without food."},
    "folic acid": {"uses": "Folate deficiency, pregnancy.", "dosage_standard": "400-5000mcg daily.", "food_relation": "With/without food."},
    "iron": {"uses": "Iron deficiency anemia.", "dosage_standard": "100-200mg elemental iron daily.", "food_relation": "With vitamin C; avoid tea/coffee/calcium 2hrs."},
    "zinc": {"uses": "Immunity, wound healing.", "dosage_standard": "15-30mg daily.", "food_relation": "With food to avoid nausea."},
    "magnesium": {"uses": "Muscle cramps, sleep.", "dosage_standard": "200-400mg daily.", "food_relation": "With food; glycinate at bedtime."},
}

# High-priority salts to prioritize in the dataset
PRIORITY_SALTS = set(SALT_KNOWLEDGE_BASE.keys())

def extract_strength(comp):
    import re
    match = re.search(r'(\d+(?:\.\d+)?\s*mg)', comp, re.IGNORECASE)
    return match.group(1) if match else "Standard"

def clean_and_build_curated_db(csv_file_path, output_ts_path, max_medicines=3000):
    """Build a curated subset of the most relevant medicines for frontend use."""
    
    # First pass: count salt frequencies to identify common medicines
    salt_counter = Counter()
    manufacturer_counter = Counter()
    
    with open(csv_file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('Is_discontinued', '').strip().upper() == 'TRUE':
                continue
            comp1 = row.get('short_composition1', '').lower()
            comp2 = row.get('short_composition2', '').lower()
            full_comp = f"{comp1} {comp2}".strip()
            manufacturer = row.get('manufacturer_name', '').strip()
            
            for salt in PRIORITY_SALTS:
                if salt in full_comp:
                    salt_counter[salt] += 1
            if manufacturer:
                manufacturer_counter[manufacturer] += 1
    
    print(f"Salt frequencies: {salt_counter.most_common(20)}")
    print(f"Top manufacturers: {manufacturer_counter.most_common(10)}")
    
    # Second pass: collect medicines with priority scoring
    medicines = []
    seen = set()
    
    with open(csv_file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('Is_discontinued', '').strip().upper() == 'TRUE':
                continue
            
            brand = row.get('name', '').strip()
            manufacturer = row.get('manufacturer_name', '').strip()
            price = row.get('price(₹)', row.get('price', '0')).strip()
            comp1 = row.get('short_composition1', '').strip()
            comp2 = row.get('short_composition2', '').strip()
            full_comp = f"{comp1} {comp2}".strip()
            full_comp_lower = full_comp.lower()
            pack_size = row.get('pack_size_label', '').strip()
            med_type = row.get('type', '').strip()
            
            dedup_key = f"{brand.lower()}|{full_comp_lower}"
            if dedup_key in seen:
                continue
            seen.add(dedup_key)
            
            # Score based on salt priority + manufacturer reputation
            score = 0
            matched_salt = None
            for salt in PRIORITY_SALTS:
                if salt in full_comp_lower:
                    score += salt_counter[salt] * 10
                    matched_salt = salt
                    break
            
            # Boost for known major manufacturers
            major_mfrs = ['Glaxo', 'Sun Pharma', 'Cipla', 'Dr. Reddy', 'Lupin', 'Torrent', 
                          'Alkem', 'Glenmark', 'Zydus', 'Abbott', 'Sanofi', 'Pfizer', 
                          'Novartis', 'GSK', 'Micro Labs', 'USV', 'Mankind', 'Intas']
            for mfr in major_mfrs:
                if mfr.lower() in manufacturer.lower():
                    score += 100
                    break
            
            # Get salt-specific info
            uses = "Consult a certified medical practitioner."
            dosage = "Use strictly under medical supervision."
            food = "Refer to packaging or pharmacist."
            
            if matched_salt and matched_salt in SALT_KNOWLEDGE_BASE:
                info = SALT_KNOWLEDGE_BASE[matched_salt]
                uses = info["uses"]
                dosage = info["dosage_standard"]
                food = info["food_relation"]
            
            medicines.append({
                "brand": brand,
                "manufacturer": manufacturer,
                "price": price,
                "composition": full_comp,
                "composition_lower": full_comp_lower,
                "strength": extract_strength(full_comp),
                "uses": uses,
                "dosage": dosage,
                "food": food,
                "pack": pack_size,
                "type": med_type,
                "score": score,
                "matched_salt": matched_salt
            })
    
    # Sort by score descending and take top N
    medicines.sort(key=lambda x: x["score"], reverse=True)
    curated = medicines[:max_medicines]
    
    print(f"Selected top {len(curated)} medicines from {len(medicines)} unique")
    
    # Build final TypeScript-ready structure matching MedicineInfo type
    final_medicines = []
    for i, m in enumerate(curated):
        # Determine category from salt
        category_map = {
            "paracetamol": "Analgesic & Antipyretic",
            "ibuprofen": "NSAID & Analgesic", "diclofenac": "NSAID & Analgesic", 
            "aceclofenac": "NSAID & Analgesic", "aceclofenac": "NSAID & Analgesic",
            "telmisartan": "Cardiovascular / ARB", "losartan": "Cardiovascular / ARB", 
            "olmesartan": "Cardiovascular / ARB",
            "amlodipine": "Cardiovascular / CCB", "cilnidipine": "Cardiovascular / CCB",
            "metoprolol": "Cardiovascular / Beta Blocker",
            "aspirin": "Antiplatelet & Cardioprotective",
            "rosuvastatin": "Lipid Lowering / Statin", "atorvastatin": "Lipid Lowering / Statin",
            "metformin": "Antidiabetic / Biguanide", "glimepiride": "Antidiabetic / Sulfonylurea",
            "sitagliptin": "Antidiabetic / DPP-4 Inhibitor", "dapagliflozin": "Antidiabetic / SGLT-2 Inhibitor",
            "pantoprazole": "Proton Pump Inhibitor", "rabeprazole": "Proton Pump Inhibitor",
            "esomeprazole": "Proton Pump Inhibitor", "domperidone": "Prokinetic",
            "famotidine": "H2 Blocker",
            "levothyroxine": "Thyroid Hormone",
            "fexofenadine": "Antihistamine", "cetirizine": "Antihistamine", 
            "levocetirizine": "Antihistamine", "bilastine": "Antihistamine",
            "montelukast": "Leukotriene Antagonist",
            "amoxicillin": "Antibiotic / Penicillin", "azithromycin": "Antibiotic / Macrolide",
            "cefixime": "Antibiotic / Cephalosporin", "cefpodoxime": "Antibiotic / Cephalosporin",
            "ofloxacin": "Antibiotic / Fluoroquinolone", "levofloxacin": "Antibiotic / Fluoroquinolone",
            "doxycycline": "Antibiotic / Tetracycline", "clarithromycin": "Antibiotic / Macrolide",
            "clavulanic acid": "Beta-Lactamase Inhibitor",
            "ambroxol": "Mucolytic", "levosalbutamol": "Bronchodilator",
            "pregabalin": "Neuropathic Pain", "gabapentin": "Neuropathic Pain",
            "tramadol": "Opioid Analgesic",
            "serratiopeptidase": "Proteolytic Enzyme",
            "ondansetron": "Antiemetic",
            "calcium carbonate": "Calcium Supplement", "vitamin d3": "Vitamin D Supplement",
            "mecobalamin": "Vitamin B12", "folic acid": "Folate Supplement",
            "iron": "Iron Supplement", "zinc": "Zinc Supplement", "magnesium": "Magnesium Supplement",
            "vitamin c": "Vitamin C", "vitamin e": "Vitamin E", "omega-3": "Omega-3",
            "coenzyme q10": "CoQ10", "glucosamine": "Joint Health",
        }
        
        category = "Prescription Medication"
        if m["matched_salt"] and m["matched_salt"] in category_map:
            category = category_map[m["matched_salt"]]
        
        # Determine dosage form from pack_size
        pack_lower = m["pack"].lower()
        if "syrup" in pack_lower or "suspension" in pack_lower:
            dosage_form = "Syrup"
        elif "injection" in pack_lower or "ampoule" in pack_lower or "vial" in pack_lower:
            dosage_form = "Injection"
        elif "capsule" in pack_lower or "cap" in pack_lower:
            dosage_form = "Capsule"
        elif "drop" in pack_lower:
            dosage_form = "Drops"
        elif "cream" in pack_lower or "ointment" in pack_lower or "gel" in pack_lower:
            dosage_form = "Topical"
        elif "inhaler" in pack_lower or "rotacap" in pack_lower:
            dosage_form = "Inhaler"
        else:
            dosage_form = "Tablet"
        
        final_med = {
            "id": f"indian_{i}",
            "name": m["brand"],
            "brandName": m["brand"],
            "genericName": m["composition"],
            "dosageForm": dosage_form,
            "strength": m["strength"],
            "manufacturer": m["manufacturer"],
            "composition": {"salts": [{"name": m["matched_salt"].title() if m["matched_salt"] else m["composition"], "amount": m["strength"]}]},
            "category": category,
            "conditions": [category, "Prescribed Therapy"],
            "primaryUses": [m["uses"]],
            "use": m["uses"],
            "standardDosage": m["dosage"],
            "usageTiming": m["food"],
            "precautions": [
                "Take strictly according to physician instructions",
                "Do not exceed recommended dose",
                "Store in cool dry place"
            ],
            "sideEffects": ["Consult package insert for detailed side effects"],
            "storageConditions": "Store below 25°C in dry place",
            "prescriptionRequired": m["type"].lower() != "otc" if m["type"] else True,
            "searchKeywords": [m["brand"].lower(), m["composition"].lower(), m["matched_salt"] or ""],
            "source": "database"
        }
        final_medicines.append(final_med)
    
    # Generate TypeScript
    ts_content = f"""// Auto-generated curated Indian Medicines Database
// {len(final_medicines)} medicines from junioralive/Indian-Medicine-Dataset
// Generated: {__import__('datetime').datetime.now().isoformat()}

import {{ MedicineInfo }} from '../types';

export const INDIAN_MEDICINES_DB: MedicineInfo[] = {json.dumps(final_medicines, ensure_ascii=False, indent=2)};

export function searchIndianMedicines(query: string, limit = 20): MedicineInfo[] {{
  if (!query || !query.trim()) return INDIAN_MEDICINES_DB.slice(0, limit);
  const q = query.trim().toLowerCase();
  return INDIAN_MEDICINES_DB.filter(m => 
    m.name.toLowerCase().includes(q) ||
    m.genericName.toLowerCase().includes(q) ||
    m.brandName.toLowerCase().includes(q) ||
    m.manufacturer.toLowerCase().includes(q) ||
    (m.composition?.salts?.some(s => s.name.toLowerCase().includes(q))) ||
    m.aliases?.some(a => a.toLowerCase().includes(q))
  ).slice(0, limit);
}}
"""
    
    with open(output_ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print(f"Saved curated TypeScript: {output_ts_path} ({len(final_medicines)} medicines)")

if __name__ == "__main__":
    clean_and_build_curated_db(
        'temp_dataset/DATA/indian_medicine_data.csv',
        'src/data/indianMedicines.ts',
        max_medicines=3000
    )