import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Info,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { COMPREHENSIVE_MEDICINE_DATABASE } from '../data/medicineDatabase';
import {
  getGroupedMedicineSuggestions,
  lookupMedicineInfo,
  searchOpenFDAMedicines,
} from '../services/medicineService';
import { MedicineInfo } from '../types';

interface MedicineSearchDirectoryProps {
  onAddMedicineToMember?: (medInfo: MedicineInfo, memberId?: string) => void;
}

const CATEGORY_CHIPS = [
  'All',
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

export const MedicineSearchDirectory: React.FC<MedicineSearchDirectoryProps> = ({
  onAddMedicineToMember,
}) => {
  const { language } = usePreferences();
  const { members } = useAuth();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchSource, setSearchSource] = useState<'all' | 'openfda'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedMed, setSelectedMed] = useState<MedicineInfo | null>(COMPREHENSIVE_MEDICINE_DATABASE[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [openFdaResults, setOpenFdaResults] = useState<MedicineInfo[]>([]);

  // Categorized suggestions for instant local database
  const suggestions = getGroupedMedicineSuggestions(query);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setShowDropdown(val.trim().length > 1);
  };

  const handleSearch = async (searchTerm?: string, forceFda = false) => {
    const term = (searchTerm || query).trim();
    if (!term) return;

    setLoading(true);
    setShowDropdown(false);
    try {
      if (forceFda || searchSource === 'openfda') {
        const fdaList = await searchOpenFDAMedicines(term, 8);
        setOpenFdaResults(fdaList);
        if (fdaList.length > 0) {
          setSelectedMed(fdaList[0]);
        } else {
          // fallback to general lookup
          const result = await lookupMedicineInfo(term);
          setSelectedMed(result);
        }
      } else {
        const result = await lookupMedicineInfo(term);
        setSelectedMed(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedicine = (med: MedicineInfo) => {
    setSelectedMed(med);
    setQuery(med.name);
    setShowDropdown(false);
  };

  // Filter list by category chip for local catalog
  const filteredCategoryList = COMPREHENSIVE_MEDICINE_DATABASE.filter((m) => {
    if (activeCategory === 'All') return true;
    const cat = activeCategory.toLowerCase();
    const medCat = (m.category || '').toLowerCase();
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

  return (
    <div className="card-wellness p-5 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 shadow-sm space-y-4">
      {/* Header with OpenFDA Live API Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/8 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0E1B2C] dark:text-white font-heading flex items-center gap-2 flex-wrap">
              <span>{language === 'hi' ? 'दवाइयों की संपूर्ण निर्देशिका' : 'Clinical Medicine & Drug Directory'}</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#12B5A6] text-white">
                Compositions & Salts
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#3B82F6] text-white flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" />
                <span>OpenFDA NDC API Connected</span>
              </span>
            </h3>
            <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
              {language === 'hi'
                ? 'सभी साल्ट कंपोज़ीशन, खुराक, सावधानी और US FDA ओपन डेटाबेस से लाइव दवाइयां देखें'
                : 'Browse, search, and inspect active salt compositions, strengths, indications & live US FDA NDC drug registry'}
            </p>
          </div>
        </div>

        {/* Database Source Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#F4F6F9] dark:bg-[#17263A] p-1 rounded-xl border border-black/10 dark:border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setSearchSource('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              searchSource === 'all'
                ? 'bg-[#0E1B2C] text-white dark:bg-white dark:text-[#0E1B2C] shadow-xs'
                : 'text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white'
            }`}
          >
            Formulary Catalog
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchSource('openfda');
              if (query.trim()) handleSearch(query, true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              searchSource === 'openfda'
                ? 'bg-[#3B82F6] text-white shadow-xs'
                : 'text-[#7E90A5] hover:text-[#3B82F6]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>OpenFDA Live</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar with Live Autocomplete */}
      <div className="relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => {
                if (query.trim().length > 1) setShowDropdown(true);
              }}
              placeholder={
                searchSource === 'openfda'
                  ? 'Search live US FDA NDC Registry (e.g., Lisinopril, Metformin, Amoxicillin, Ibuprofen)...'
                  : language === 'hi'
                  ? 'दवाई या साल्ट का नाम लिखें (जैसे Calpol 650, Metformin, Pan D, Augmentin, BP)...'
                  : 'Search brand, generic salt or condition (e.g., Calpol, Metformin, Augmentin 625, Pan D, BP, Fever)...'
              }
              className="w-full h-12 rounded-2xl bg-[#F4F6F9] dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/15 dark:border-white/15 pl-11 pr-4 font-bold text-sm focus:border-[#12B5A6] focus:ring-2 focus:ring-[#12B5A6]/20 placeholder-[#7E90A5] transition-all"
            />
            <Search className="w-5 h-5 text-[#7E90A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setShowDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-12 px-5 rounded-2xl bg-[#0E1B2C] hover:bg-[#1a2d47] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#0E1B2C] font-black text-sm flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <Sparkles className="w-4 h-4 animate-spin text-[#12B5A6]" />
            ) : (
              <Search className="w-4 h-4 text-[#12B5A6]" />
            )}
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </form>

        {/* Live Categorized Auto-complete Dropdown */}
        {showDropdown && query.trim().length > 1 && (
          <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white dark:bg-[#132032] border border-black/15 dark:border-white/15 rounded-2xl shadow-2xl divide-y divide-black/5 dark:divide-white/5 overflow-hidden max-h-72 overflow-y-auto">
            {suggestions.byBrand.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-black uppercase text-[#12B5A6] px-2 py-1">
                  💊 Brand & Dosage Form
                </p>
                {suggestions.byBrand.map((item, idx) => (
                  <button
                    key={`d-b-${idx}`}
                    type="button"
                    onClick={() => handleSelectMedicine(item)}
                    className="w-full p-2.5 rounded-xl text-left hover:bg-[#E6F8F6] dark:hover:bg-[#1A2E44] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-[#0E1B2C] dark:text-white">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-bold text-[#FF6B4A]">
                          {item.strength}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7E90A5] font-semibold mt-0.5">
                        Active Salt: {item.genericName}
                      </p>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] shrink-0">
                      View
                    </span>
                  </button>
                ))}
              </div>
            )}

            {suggestions.bySalt.length > 0 && (
              <div className="p-2 bg-[#F9FBFC] dark:bg-[#101C2B]">
                <p className="text-[10px] font-black uppercase text-[#3B82F6] px-2 py-1">
                  🧬 Generic Salt Compositions
                </p>
                {suggestions.bySalt.map((item, idx) => (
                  <button
                    key={`d-s-${idx}`}
                    type="button"
                    onClick={() => handleSelectMedicine(item)}
                    className="w-full p-2.5 rounded-xl text-left hover:bg-[#E6F8F6] dark:hover:bg-[#1A2E44] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-black text-xs text-[#0E1B2C] dark:text-white">
                        {item.genericName}
                      </span>
                      <p className="text-[10px] text-[#7E90A5] font-semibold mt-0.5">
                        Brand: {item.brandName || item.name} ({item.strength})
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-[#7E90A5]">
                      {item.dosageForm}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Live OpenFDA NDC API Trigger */}
            <button
              type="button"
              onClick={() => handleSearch(query, true)}
              className="w-full p-3 text-left bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 transition-colors flex items-center justify-between gap-2 cursor-pointer font-black text-xs text-[#3B82F6]"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 shrink-0 text-[#3B82F6]" />
                <span>Query Live US OpenFDA NDC Registry for &ldquo;{query}&rdquo;</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        )}
      </div>

      {/* Category Pills & OpenFDA Live Results */}
      {searchSource === 'openfda' && openFdaResults.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-black uppercase text-[#3B82F6] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>OpenFDA NDC Registry Results ({openFdaResults.length} found):</span>
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {openFdaResults.map((med) => {
              const isSelected = selectedMed?.id === med.id || selectedMed?.name === med.name;
              return (
                <button
                  key={med.id || med.name}
                  type="button"
                  onClick={() => setSelectedMed(med)}
                  className={`p-2.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBF5FF] dark:bg-[#1E3A5F] border-[#3B82F6] shadow-2xs'
                      : 'bg-[#F9FBFC] dark:bg-[#17263A] border-black/8 dark:border-white/10 hover:border-[#3B82F6]/50'
                  }`}
                >
                  <p className="font-black text-xs text-[#0E1B2C] dark:text-white">
                    {med.name}
                  </p>
                  <p className="text-[10px] font-semibold text-[#3B82F6]">
                    {med.manufacturer?.substring(0, 24)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="font-black text-[#7E90A5] dark:text-[#A0B2C6] shrink-0 text-[11px] uppercase tracking-wider">
              Browse by Class:
            </span>
            {CATEGORY_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveCategory(chip)}
                className={`shrink-0 px-3 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeCategory === chip
                    ? 'bg-[#12B5A6] text-white shadow-xs font-black'
                    : 'bg-black/5 dark:bg-white/10 hover:bg-[#E6F8F6] dark:hover:bg-[#12B5A6]/20 text-[#0E1B2C] dark:text-white border border-transparent'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Quick select horizontal list */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filteredCategoryList.slice(0, 10).map((med) => {
              const isSelected = selectedMed?.name === med.name;
              return (
                <button
                  key={med.id || med.name}
                  type="button"
                  onClick={() => setSelectedMed(med)}
                  className={`p-2.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E6F8F6] dark:bg-[#12B5A6]/25 border-[#12B5A6] shadow-2xs'
                      : 'bg-[#F9FBFC] dark:bg-[#17263A] border-black/8 dark:border-white/10 hover:border-[#12B5A6]/50'
                  }`}
                >
                  <p className="font-black text-xs text-[#0E1B2C] dark:text-white">
                    {med.name}
                  </p>
                  <p className="text-[10px] font-semibold text-[#FF6B4A]">
                    {med.strength} • {med.dosageForm}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CLINICAL MEDICINE INTELLIGENCE CARD RESULT */}
      {selectedMed && (
        <div className="rounded-2xl p-4 sm:p-5 bg-[#F2FAF9] dark:bg-[#0D2428] border-2 border-[#12B5A6]/40 shadow-sm space-y-4 animate-in fade-in duration-200">
          {/* Top Title & Classification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#12B5A6]/20">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xl sm:text-2xl font-black text-[#0E1B2C] dark:text-white font-heading">
                  {selectedMed.name}
                </h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#12B5A6] text-white">
                  {selectedMed.dosageForm || 'Oral Medication'}
                </span>
                {selectedMed.source === 'fda' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#3B82F6] text-white flex items-center gap-1">
                    <Globe className="w-2.5 h-2.5" />
                    <span>OpenFDA NDC</span>
                  </span>
                )}
                {selectedMed.prescriptionRequired && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E5484D] text-white">
                    Rx Required
                  </span>
                )}
              </div>
              {selectedMed.genericName && (
                <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B8D0] mt-0.5">
                  Generic Molecule: <span className="text-[#0E1B2C] dark:text-white font-black">{selectedMed.genericName}</span>
                  {selectedMed.manufacturer && ` • Mfr: ${selectedMed.manufacturer}`}
                </p>
              )}
            </div>

            {/* Quick Action: Add to Family Member */}
            {onAddMedicineToMember && members.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="h-9 px-2.5 rounded-xl bg-white dark:bg-[#17263A] border border-black/15 dark:border-white/15 text-xs font-bold text-[#0E1B2C] dark:text-white w-full sm:w-auto min-w-0"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relation})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    onAddMedicineToMember(selectedMed, selectedMemberId);
                    setAddedSuccess(true);
                    setTimeout(() => setAddedSuccess(false), 3000);
                  }}
                  className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-[#12B5A6] to-[#0D9688] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer w-full sm:w-auto shrink-0"
                >
                  {addedSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      <span>+ Prescribe</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Active Salts & Composition Box */}
          {selectedMed.composition?.salts && selectedMed.composition.salts.length > 0 && (
            <div className="bg-white/90 dark:bg-white/5 p-3 rounded-xl border border-[#12B5A6]/30">
              <p className="text-xs font-black uppercase tracking-wider text-[#12B5A6] mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1FA971]" />
                <span>Active Salt Formulation & Composition:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedMed.composition.salts.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-black px-2.5 py-1 rounded-lg bg-white dark:bg-[#142234] border border-[#12B5A6]/40 text-[#0E1B2C] dark:text-white shadow-2xs"
                  >
                    🧪 {s.name}: <span className="text-[#FF6B4A] dark:text-[#FF8A65]">{s.amount}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conditions for which medicine is used */}
          <div className="bg-white/90 dark:bg-white/5 p-3.5 rounded-xl border border-[#12B5A6]/20">
            <p className="text-xs font-black uppercase tracking-wider text-[#12B5A6] mb-1.5 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              <span>Primary Indications & Treated Conditions (उपयोग):</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedMed.conditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#0F5C5C] dark:text-[#67E2D5] border border-[#12B5A6]/30"
                >
                  ✓ {cond}
                </span>
              ))}
            </div>
          </div>

          {/* Primary Mechanism & Clinical Action */}
          <div className="bg-white/90 dark:bg-white/5 p-3.5 rounded-xl border border-black/5 dark:border-white/5">
            <p className="text-xs font-black uppercase tracking-wider text-[#7E90A5] dark:text-[#A0B2C6] mb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#12B5A6]" />
              <span>How It Works & Primary Action:</span>
            </p>
            <p className="text-sm font-bold text-[#0E1B2C] dark:text-white leading-relaxed">
              {selectedMed.use}
            </p>
          </div>

          {/* Dosage & Usage Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/90 dark:bg-white/5 p-3.5 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
              <p className="font-black uppercase tracking-wider text-[#12B5A6] flex items-center gap-1.5">
                <Pill className="w-4 h-4" />
                <span>Standard Dosage Guidance (खुराक):</span>
              </p>
              <p className="text-sm font-bold text-[#0E1B2C] dark:text-white">
                {selectedMed.standardDosage}
              </p>
              <p className="text-[11px] font-semibold text-[#7E90A5] dark:text-[#A0B2C6]">
                Strength: {selectedMed.strength || 'Standard clinical dose'}
              </p>
            </div>

            <div className="bg-white/90 dark:bg-white/5 p-3.5 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
              <p className="font-black uppercase tracking-wider text-[#FF6B4A] flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Usage & Timing (कब और कैसे लें):</span>
              </p>
              <p className="text-sm font-bold text-[#0E1B2C] dark:text-white">
                {selectedMed.usageTiming}
              </p>
              {selectedMed.storageConditions && (
                <p className="text-[11px] font-semibold text-[#7E90A5] dark:text-[#A0B2C6]">
                  📦 Storage: {selectedMed.storageConditions}
                </p>
              )}
            </div>
          </div>

          {/* Safety Precautions & Warnings */}
          {selectedMed.precautions && selectedMed.precautions.length > 0 && (
            <div className="bg-[#FFF5F5] dark:bg-[#E5484D]/10 p-3.5 rounded-xl border border-[#E5484D]/30 space-y-1.5">
              <p className="text-xs font-black uppercase tracking-wider text-[#E5484D] dark:text-[#FF8080] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Important Precautions & Warnings (जरूरी सावधानियां):</span>
              </p>
              <ul className="space-y-1 text-xs font-bold text-[#80181B] dark:text-[#FFAEAE]">
                {selectedMed.precautions.map((prec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#E5484D] font-black">•</span>
                    <span>{prec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
