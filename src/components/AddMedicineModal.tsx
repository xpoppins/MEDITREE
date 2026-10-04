import {
  AlertTriangle,
  Building2,
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  Globe,
  Info,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';
import {
  COMPREHENSIVE_MEDICINE_DATABASE,
  getGroupedMedicineSuggestions,
  lookupMedicineInfo,
  searchOpenFDAMedicines,
} from '../services/medicineService';
import { Member, MedicineInfo } from '../types';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMemberId?: string;
}

const CATEGORY_TABS = [
  'All Medicines',
  'Blood Pressure',
  'Diabetes',
  'Fever & Pain',
  'Acidity & GERD',
  'Thyroid',
  'Heart & Cholesterol',
  'Antibiotics',
  'Vitamins & Nerve',
  'Respiratory & Allergy',
] as const;

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMemberId,
}) => {
  const { members, user, family } = useAuth();
  const { language } = usePreferences();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    initialMemberId || members[0]?.id || ''
  );

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All Medicines');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [selectedMedicineInfo, setSelectedMedicineInfo] = useState<MedicineInfo | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [dose, setDose] = useState('1 tablet');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:30 AM']);
  const [foodRelation, setFoodRelation] = useState<'After food' | 'Before food' | 'With food' | 'At bedtime'>('After food');
  const [condition, setCondition] = useState('');
  const [instructions, setInstructions] = useState('Take with plain water');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialMemberId) {
      setSelectedMemberId(initialMemberId);
    } else if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
    }
  }, [initialMemberId, members]);

  if (!isOpen) return null;

  // Filter medicines for direct list selection based on category tab & search query
  const filteredList = COMPREHENSIVE_MEDICINE_DATABASE.filter((m) => {
    if (activeCategory === 'All Medicines') return true;
    const cat = activeCategory.toLowerCase();
    const medCat = (m.category || '').toLowerCase();
    const conds = m.conditions.map((c) => c.toLowerCase()).join(' ');
    if (cat.includes('pressure') || cat.includes('bp')) {
      return medCat.includes('pressure') || medCat.includes('arb') || medCat.includes('calcium');
    }
    if (cat.includes('diabetes')) {
      return medCat.includes('diabetes') || medCat.includes('sugar') || medCat.includes('biguanide');
    }
    if (cat.includes('fever') || cat.includes('pain')) {
      return medCat.includes('analgesic') || medCat.includes('nsaid') || medCat.includes('pain');
    }
    if (cat.includes('acidity') || cat.includes('gerd')) {
      return medCat.includes('acidity') || medCat.includes('ppi') || medCat.includes('antacid');
    }
    if (cat.includes('thyroid')) {
      return medCat.includes('thyroid') || medCat.includes('endocrine');
    }
    if (cat.includes('cholesterol') || cat.includes('heart')) {
      return medCat.includes('lipid') || medCat.includes('statin') || medCat.includes('cardio');
    }
    if (cat.includes('antibiotic')) {
      return medCat.includes('antibiotic') || medCat.includes('cephalosporin');
    }
    if (cat.includes('vitamin') || cat.includes('nerve')) {
      return medCat.includes('vitamin') || medCat.includes('neuro') || medCat.includes('mineral');
    }
    if (cat.includes('respiratory') || cat.includes('allergy')) {
      return medCat.includes('respiratory') || medCat.includes('allergic') || medCat.includes('antihistamine');
    }
    return true;
  });

  // Categorized suggestions for search bar dropdown
  const suggestions = getGroupedMedicineSuggestions(searchQuery);

  const handleSelectMedicine = (med: MedicineInfo) => {
    setName(med.name);
    setSearchQuery(med.name);
    setShowDropdown(false);
    setSelectedMedicineInfo(med);

    // Auto-fill standard dosage, conditions, and timing
    if (med.strength) {
      setDose(med.strength);
    } else if (med.standardDosage) {
      setDose(med.standardDosage.split(',')[0].trim());
    }

    if (med.conditions && med.conditions.length > 0) {
      setCondition(med.conditions[0]);
    }

    if (med.usageTiming) {
      setInstructions(med.usageTiming);
      const lower = med.usageTiming.toLowerCase();
      if (lower.includes('before') || lower.includes('empty stomach')) {
        setFoodRelation('Before food');
      } else if (lower.includes('bedtime') || lower.includes('night')) {
        setFoodRelation('At bedtime');
      } else {
        setFoodRelation('After food');
      }
    }
  };

  const handleLookupAI = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingAI(true);
    try {
      const info = await lookupMedicineInfo(searchQuery.trim());
      handleSelectMedicine(info);
    } finally {
      setIsSearchingAI(false);
    }
  };

  const handleLookupOpenFDA = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingAI(true);
    try {
      const results = await searchOpenFDAMedicines(searchQuery.trim(), 1);
      if (results.length > 0) {
        handleSelectMedicine(results[0]);
      } else {
        await handleLookupAI();
      }
    } catch {
      await handleLookupAI();
    } finally {
      setIsSearchingAI(false);
    }
  };

  const toggleTimePreset = (timeStr: string) => {
    if (selectedTimes.includes(timeStr)) {
      if (selectedTimes.length > 1) {
        setSelectedTimes(selectedTimes.filter((t) => t !== timeStr));
      }
    } else {
      setSelectedTimes([...selectedTimes, timeStr]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || searchQuery.trim();
    if (!cleanName) {
      setError('Please select or enter a medicine name');
      return;
    }

    if (!selectedMemberId) {
      setError('Please select a family member');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const combinedInstructions = `${foodRelation} • ${instructions.trim()}`;
      await api.addMedicine({
        familyId: family?.id || user?.familyId || 'f1',
        memberId: selectedMemberId,
        name: cleanName,
        dose: dose.trim() || selectedMedicineInfo?.strength || '1 tablet',
        times: selectedTimes.length > 0 ? selectedTimes : ['08:30 AM'],
        days: ['Daily'],
        instructions: combinedInstructions,
        condition: condition.trim() || selectedMedicineInfo?.conditions?.[0] || 'General Care',
        use: selectedMedicineInfo?.use || '',
        usageTiming: selectedMedicineInfo?.usageTiming || '',
        precautions: selectedMedicineInfo?.precautions || [],
        genericName: selectedMedicineInfo?.genericName || '',
        dosageForm: selectedMedicineInfo?.dosageForm || 'Tablet',
        strength: selectedMedicineInfo?.strength || dose.trim(),
        manufacturer: selectedMedicineInfo?.manufacturer || '',
        composition: selectedMedicineInfo?.composition,
        prescriptionRequired: selectedMedicineInfo?.prescriptionRequired,
        prescribedBy: prescribedBy.trim() || 'Consulting Physician',
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save medicine');
    } finally {
      setSaving(false);
    }
  };

  const currentSelectedMember = members.find((m) => m.id === selectedMemberId);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="card-wellness p-5 sm:p-7 bg-white dark:bg-[#0E1B2C] max-w-xl w-full max-h-[92vh] overflow-y-auto relative border border-black/10 dark:border-white/10 shadow-2xl rounded-3xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 text-[#0E1B2C] dark:text-white flex items-center justify-center hover:opacity-80 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#12B5A6] to-[#0D9688] text-white flex items-center justify-center shadow-md shadow-[#12B5A6]/25 shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#0E1B2C] dark:text-white font-heading">
              {language === 'hi' ? 'दवाई जोड़ें व खोजें' : 'Clinical Medicine Search & Add'}
            </h3>
            <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
              {language === 'hi'
                ? 'सभी साल्ट कंपोज़ीशन व ब्रांड लिस्ट से सीधे चुनें'
                : 'Directly select from complete compositions, brands & active molecules'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#FEECEE] dark:bg-[#E5484D]/15 border border-[#E5484D] text-[#E5484D] dark:text-[#FF8080] font-bold text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* 1. Pick Family Member */}
          <div>
            <label className="block text-xs font-black uppercase text-[#7E90A5] dark:text-[#A0B2C6] mb-1.5">
              1. {language === 'hi' ? 'किस सदस्य के लिए?' : 'For Family Member'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedMemberId === m.id
                      ? 'bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] border-transparent shadow-xs scale-102 font-black'
                      : 'bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border-black/10 dark:border-white/10 hover:border-[#12B5A6]'
                  }`}
                >
                  <p className="font-black text-xs truncate">{m.name}</p>
                  <p className="text-[10px] opacity-75 truncate">{m.relation}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Medicine Search Bar with Typo Tolerance & Categorized Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase text-[#7E90A5] dark:text-[#A0B2C6]">
                2. {language === 'hi' ? 'दवाई या साल्ट का नाम खोजें' : 'Search Medicine or Active Salt Composition'}
              </label>
              <button
                type="button"
                onClick={handleLookupAI}
                disabled={isSearchingAI || !searchQuery.trim()}
                className="text-[11px] font-black text-[#12B5A6] flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSearchingAI ? 'Searching...' : 'AI Global Lookup'}</span>
              </button>
            </div>

            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setName(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Type brand, salt or symptom (e.g., Calpol, Metformin, Augmentin, BP, Fever)..."
                  className="w-full h-12 rounded-2xl bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/15 dark:border-white/15 pl-10 pr-4 font-bold text-sm focus:border-[#12B5A6] focus:ring-2 focus:ring-[#12B5A6]/20 transition-all placeholder-[#7E90A5]"
                />
                <Search className="w-4 h-4 text-[#7E90A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Categorized Suggestions Dropdown */}
              {showDropdown && searchQuery.trim().length > 1 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#132032] border border-black/15 dark:border-white/15 rounded-2xl shadow-2xl max-h-72 overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
                  {/* Matching Brands */}
                  {suggestions.byBrand.length > 0 && (
                    <div className="p-2">
                      <p className="text-[10px] font-black uppercase text-[#12B5A6] px-2 py-1">
                        💊 Brand & Dosage Strength
                      </p>
                      {suggestions.byBrand.map((item, idx) => (
                        <button
                          key={`b-${idx}`}
                          type="button"
                          onClick={() => handleSelectMedicine(item)}
                          className="w-full p-2.5 rounded-xl text-left hover:bg-[#E6F8F6] dark:hover:bg-[#1A2E44] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-xs text-[#0E1B2C] dark:text-white">
                                {item.name}
                              </span>
                              {item.dosageForm && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-bold text-[#7E90A5]">
                                  {item.dosageForm}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-semibold text-[#FF6B4A]">
                              Active: {item.genericName}
                            </p>
                          </div>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] shrink-0">
                            Select
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matching Salts */}
                  {suggestions.bySalt.length > 0 && (
                    <div className="p-2 bg-[#F9FBFC] dark:bg-[#101C2B]">
                      <p className="text-[10px] font-black uppercase text-[#3B82F6] px-2 py-1">
                        🧬 Generic Salt Compositions
                      </p>
                      {suggestions.bySalt.map((item, idx) => (
                        <button
                          key={`s-${idx}`}
                          type="button"
                          onClick={() => handleSelectMedicine(item)}
                          className="w-full p-2.5 rounded-xl text-left hover:bg-[#E6F8F6] dark:hover:bg-[#1A2E44] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div>
                            <p className="font-black text-xs text-[#0E1B2C] dark:text-white">
                              {item.genericName}
                            </p>
                            <p className="text-[10px] font-semibold text-[#7E90A5]">
                              Available as: {item.brandName || item.name} ({item.strength})
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#7E90A5]" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matching Symptoms / Uses */}
                  {suggestions.bySymptom.length > 0 && (
                    <div className="p-2">
                      <p className="text-[10px] font-black uppercase text-[#FFB020] px-2 py-1">
                        🩺 By Indication & Symptoms
                      </p>
                      {suggestions.bySymptom.map((item, idx) => (
                        <button
                          key={`sym-${idx}`}
                          type="button"
                          onClick={() => handleSelectMedicine(item)}
                          className="w-full p-2.5 rounded-xl text-left hover:bg-[#E6F8F6] dark:hover:bg-[#1A2E44] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div>
                            <p className="font-black text-xs text-[#0E1B2C] dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-[10px] font-semibold text-[#147A50] dark:text-[#34D399]">
                              Indicated for: {item.conditions.join(', ')}
                            </p>
                          </div>
                          <span className="text-[9px] font-bold text-[#7E90A5]">
                            {item.strength}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* OpenFDA NDC Live Search option */}
                  <button
                    type="button"
                    onClick={handleLookupOpenFDA}
                    className="w-full p-2.5 text-left bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 transition-colors flex items-center justify-between gap-2 cursor-pointer font-black text-xs text-[#3B82F6]"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 shrink-0 text-[#3B82F6]" />
                      <span>Search Live US OpenFDA NDC Registry for &ldquo;{searchQuery}&rdquo;</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </button>

                  {/* AI Search option */}
                  <button
                    type="button"
                    onClick={handleLookupAI}
                    className="w-full p-2.5 text-left bg-[#E6F8F6]/80 dark:bg-[#12B5A6]/10 hover:bg-[#E6F8F6] dark:hover:bg-[#12B5A6]/20 transition-colors flex items-center gap-2 cursor-pointer font-black text-xs text-[#12B5A6]"
                  >
                    <Sparkles className="w-4 h-4 shrink-0 text-[#12B5A6]" />
                    <span>
                      {isSearchingAI
                        ? 'Looking up composition...'
                        : `AI Clinical Molecule Analysis for "${searchQuery}"`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3. DIRECT QUICK SELECTION LIST (Filter by Category or Pick Directly) */}
          <div className="border border-black/10 dark:border-white/10 rounded-2xl p-3 bg-[#F9FBFC] dark:bg-[#142234] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#0E1B2C] dark:text-white flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#12B5A6]" />
                <span>Quick-Select from Verified Catalog</span>
              </span>
              <span className="text-[10px] font-bold text-[#7E90A5]">
                {filteredList.length} medications
              </span>
            </div>

            {/* Category scroll tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-black shrink-0 transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#12B5A6] text-white shadow-xs'
                      : 'bg-white dark:bg-[#1A2E44] text-[#7E90A5] dark:text-[#A0B2C6] border border-black/5 dark:border-white/5 hover:text-[#0E1B2C] dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scrollable list of medicines with full composition preview */}
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
              {filteredList.slice(0, 15).map((med) => {
                const isSelected = name === med.name || searchQuery === med.name;
                return (
                  <div
                    key={med.id || med.name}
                    onClick={() => handleSelectMedicine(med)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#E6F8F6] dark:bg-[#12B5A6]/20 border-[#12B5A6] shadow-2xs'
                        : 'bg-white dark:bg-[#17263A] border-black/6 dark:border-white/6 hover:border-[#12B5A6]/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs text-[#0E1B2C] dark:text-white">
                          {med.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-[#FF6B4A]">
                          {med.strength}
                        </span>
                        {med.manufacturer && (
                          <span className="text-[9px] font-semibold text-[#7E90A5] truncate hidden sm:inline">
                            • {med.manufacturer.split(' ')[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold text-[#7E90A5] dark:text-[#A0B2C6] truncate mt-0.5">
                        🧬 Salt: {med.genericName}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[#12B5A6] text-white'
                          : 'bg-black/5 dark:bg-white/10 text-[#0E1B2C] dark:text-white hover:bg-[#12B5A6] hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : '+ Use'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Full Structured Composition Card (When selected) */}
          {selectedMedicineInfo && (
            <div className="p-4 rounded-2xl bg-[#E6F8F6] dark:bg-[#0D2428] border border-[#12B5A6]/30 text-xs space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-black uppercase tracking-wider text-[10px] text-[#12B5A6] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1FA971]" />
                  <span>Verified Clinical Composition</span>
                </span>
                <span className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] bg-white/70 dark:bg-white/10 px-2 py-0.5 rounded">
                  {selectedMedicineInfo.dosageForm || 'Oral Tablet'}
                </span>
              </div>

              <div>
                <p className="font-black text-sm text-[#0E1B2C] dark:text-white">
                  {selectedMedicineInfo.name}
                </p>
                {selectedMedicineInfo.composition?.salts && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    {selectedMedicineInfo.composition.salts.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-[#142234] border border-[#12B5A6]/30 text-[10px] font-bold text-[#0E1B2C] dark:text-white"
                      >
                        🧪 {s.name}: <span className="text-[#12B5A6]">{s.amount}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-white/80 dark:bg-white/5 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                  <p className="font-extrabold text-[#0E1B2C] dark:text-white">🩺 Primary Indication:</p>
                  <p className="text-[#4A5B70] dark:text-[#A0B8D0]">
                    {selectedMedicineInfo.conditions.join(', ')}
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-white/5 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                  <p className="font-extrabold text-[#0E1B2C] dark:text-white">🍽️ Recommended Timing:</p>
                  <p className="text-[#4A5B70] dark:text-[#A0B8D0]">
                    {selectedMedicineInfo.usageTiming}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. Dosage, Timing Presets & Meal Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#7E90A5] dark:text-[#A0B2C6] mb-1">
                Dosage Strength
              </label>
              <input
                type="text"
                required
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g. 650mg, 1 tablet, 5ml"
                className="w-full h-11 rounded-xl bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/15 dark:border-white/15 px-3 text-xs font-bold focus:border-[#12B5A6]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#7E90A5] dark:text-[#A0B2C6] mb-1">
                Food / Meal Relation
              </label>
              <select
                value={foodRelation}
                onChange={(e: any) => setFoodRelation(e.target.value)}
                className="w-full h-11 rounded-xl bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/15 dark:border-white/15 px-3 text-xs font-bold focus:border-[#12B5A6]"
              >
                <option value="After food">After food (Post-Meal)</option>
                <option value="Before food">Before food (Empty Stomach)</option>
                <option value="With food">With major meal</option>
                <option value="At bedtime">At bedtime (Night)</option>
              </select>
            </div>
          </div>

          {/* Daily Timings */}
          <div>
            <label className="block text-xs font-black uppercase text-[#7E90A5] dark:text-[#A0B2C6] mb-1.5">
              Daily Prescribed Timings
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Morning (08:30 AM)', val: '08:30 AM' },
                { label: 'Afternoon (01:30 PM)', val: '01:30 PM' },
                { label: 'Night (08:30 PM)', val: '08:30 PM' },
              ].map((t) => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => toggleTimePreset(t.val)}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                    selectedTimes.includes(t.val)
                      ? 'bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] shadow-xs'
                      : 'bg-[#F4F6F9] dark:bg-[#17263A] text-[#7E90A5] dark:text-[#A0B2C6] border border-black/5 dark:border-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submitting Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 bg-gradient-to-r from-[#12B5A6] to-[#0D9688] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-[#12B5A6]/25 hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-5 h-5" strokeWidth={3} />
              <span>
                {saving
                  ? 'Adding...'
                  : `Save for ${currentSelectedMember?.name?.split(' ')[0] || 'Member'}`}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 border border-black/15 dark:border-white/15 rounded-2xl text-xs font-bold text-[#0E1B2C] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
