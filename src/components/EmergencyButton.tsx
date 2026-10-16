import { Check, Edit3, Phone, PhoneCall, Plus, Save, ShieldCheck, UserCheck, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import * as api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export const EmergencyButton: React.FC = () => {
  const { currentMember, members, family, refreshMembers } = useAuth();
  const { language } = usePreferences();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customRelation, setCustomRelation] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Clear any legacy dummy test numbers from previous storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('meditree_active_emergency_contact');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed?.phone === '+91 98765 43210' ||
          parsed?.phone === '+919876543210' ||
          parsed?.phone?.includes('98765 43210') ||
          parsed?.phone === '+91 98111 22334' ||
          parsed?.phone === '+91 98222 33445' ||
          parsed?.phone === '+91 98333 44556'
        ) {
          localStorage.removeItem('meditree_active_emergency_contact');
        }
      }
    } catch {}
  }, []);

  // 1. Locate the Family Manager member (by managerUid or fallback to m1/first member)
  const managerMember =
    members.find(
      (m) =>
        (family?.managerUid && (m.userUid === family.managerUid || m.userId === family.managerUid)) ||
        m.id === 'm1' ||
        m.relation.toLowerCase().includes('manager')
    ) || members[0];

  // 2. Build list of family members with their actual saved phone numbers (no dummy fixed numbers)
  const familyContacts = members.map((m) => {
    const isMgr = m.id === managerMember?.id;
    const realPhone = m.emergencyContact?.phone?.trim() || '';

    return {
      id: m.id,
      name: isMgr ? `${m.name} (Family Manager)` : m.name,
      phone: realPhone,
      relation: isMgr ? 'Family Manager' : m.relation || 'Family Member',
      isManager: isMgr,
    };
  });

  // 3. Active contact state (fetches from manager, or saved selection, or blank)
  const [contact, setContact] = useState<{
    id?: string;
    name: string;
    phone: string;
    relation: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('meditree_active_emergency_contact');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name && parsed?.phone && !parsed.phone.includes('98765 43210')) {
          return parsed;
        }
      }
    } catch {}

    // Default: fetch directly from manager
    if (managerMember) {
      return {
        id: managerMember.id,
        name: `${managerMember.name} (Family Manager)`,
        phone: managerMember.emergencyContact?.phone?.trim() || '',
        relation: 'Family Manager',
      };
    }

    return {
      name: 'Family Manager',
      phone: '',
      relation: 'Family Manager',
    };
  });

  // Keep contact in sync with latest manager / member data from backend
  useEffect(() => {
    try {
      const saved = localStorage.getItem('meditree_active_emergency_contact');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name && !parsed?.phone?.includes('98765 43210')) {
          // If this contact exists in members, re-fetch their latest phone
          const matched = members.find((m) => m.id === parsed.id);
          if (matched) {
            setContact({
              id: matched.id,
              name: matched.id === managerMember?.id ? `${matched.name} (Family Manager)` : matched.name,
              phone: matched.emergencyContact?.phone?.trim() || '',
              relation: matched.id === managerMember?.id ? 'Family Manager' : matched.relation || 'Family Member',
            });
            return;
          }
          setContact(parsed);
          return;
        }
      }
    } catch {}

    // If no custom selection, fetch directly from manager
    if (managerMember) {
      setContact({
        id: managerMember.id,
        name: `${managerMember.name} (Family Manager)`,
        phone: managerMember.emergencyContact?.phone?.trim() || '',
        relation: 'Family Manager',
      });
    }
  }, [managerMember, members]);

  // When contact changes or dialog opens, sync input
  useEffect(() => {
    setPhoneInput(contact.phone || '');
    if (!contact.phone) {
      setIsEditingPhone(true);
    } else {
      setIsEditingPhone(false);
    }
  }, [contact.id, showConfirm]);

  const handleSelectContact = (c: {
    id?: string;
    name: string;
    phone: string;
    relation: string;
  }) => {
    setContact(c);
    setPhoneInput(c.phone || '');
    if (!c.phone) {
      setIsEditingPhone(true);
    } else {
      setIsEditingPhone(false);
    }
    try {
      localStorage.setItem('meditree_active_emergency_contact', JSON.stringify(c));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phoneInput.trim();
    const updated = {
      ...contact,
      phone: cleanPhone,
    };
    setContact(updated);
    setIsEditingPhone(false);

    try {
      localStorage.setItem('meditree_active_emergency_contact', JSON.stringify(updated));

      // If this contact corresponds to a member in our family, persist to member profile
      const targetMemberId = contact.id || managerMember?.id || currentMember?.id;
      if (targetMemberId) {
        await api.updateMember(targetMemberId, {
          emergencyContact: {
            name: contact.name,
            phone: cleanPhone,
            relation: contact.relation,
          },
        });
        await refreshMembers();
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save emergency phone', err);
    }
  };

  const handleSaveCustomContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newContact = {
      name: customName.trim(),
      phone: customPhone.trim(),
      relation: customRelation.trim() || (language === 'hi' ? 'कस्टम संपर्क' : 'Custom Contact'),
    };
    handleSelectContact(newContact);
    setShowCustomForm(false);
    if (newContact.phone) {
      try {
        localStorage.setItem('meditree_active_emergency_contact', JSON.stringify(newContact));
      } catch {}
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="px-2 sm:px-3 py-1.5 rounded-xl bg-[#FEECEE] hover:bg-[#FCD7DA] text-[#E5484D] border border-[#E5484D]/30 flex items-center gap-1 sm:gap-1.5 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
        aria-label="Call emergency contact"
      >
        <PhoneCall className="w-3.5 h-3.5 animate-pulse text-[#E5484D]" />
        <span className="hidden sm:inline">{language === 'hi' ? 'आपातकालीन SOS' : 'Emergency SOS'}</span>
        <span className="sm:hidden font-bold">SOS</span>
      </button>

      {/* Emergency Dialing Sheet / Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="card-wellness p-5 sm:p-6 bg-white dark:bg-[#0E1B2C] max-w-sm sm:max-w-md w-full text-center border-2 border-[#E5484D] dark:border-[#E5484D]/50 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 p-2 text-[#7E90A5] dark:text-[#A0B2C6] hover:text-[#0E1B2C] dark:hover:text-white cursor-pointer rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* div:nth-of-type(1) inside Selector 1: Icon container */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FEECEE] dark:bg-[#E5484D]/20 text-[#E5484D] flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
              <PhoneCall className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#0E1B2C] dark:text-white font-heading">
              {language === 'hi' ? 'आपातकालीन संपर्क' : 'Emergency Contact'}
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-[#7E90A5] dark:text-[#A0B2C6] mt-1">
              {language === 'hi' ? 'सीधे फोन मिलाने के लिए नीचे टैप करें:' : 'Tap below to dial immediate family help:'}
            </p>

            {/* div:nth-of-type(2) inside Selector 1: Active Contact Card */}
            <div className="my-3 sm:my-4 p-3.5 sm:p-4 rounded-2xl bg-[#F9FBFC] dark:bg-[#17263A] border border-black/10 dark:border-white/10 text-left">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase text-[#7E90A5] dark:text-[#A0B2C6]">Primary Contact</p>
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(!isEditingPhone)}
                  className="text-[11px] font-black text-[#12B5A6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  {isEditingPhone
                    ? language === 'hi' ? 'छुपाएं' : 'Hide'
                    : contact.phone
                    ? language === 'hi' ? 'नंबर बदलें' : 'Edit Number'
                    : language === 'hi' ? '+ नंबर दर्ज करें' : '+ Enter Number'}
                </button>
              </div>

              {/* p:nth-of-type(2) is contact.name */}
              <p className="text-lg sm:text-xl font-black text-[#0E1B2C] dark:text-white mt-0.5">{contact.name}</p>

              {/* p:nth-of-type(3) is contact.phone: Fetched from manager or blank */}
              <p className="text-base sm:text-lg font-black text-[#E5484D] font-mono mt-0.5">
                {contact.phone ? (
                  contact.phone
                ) : (
                  <span className="text-xs sm:text-sm font-semibold text-[#7E90A5] dark:text-[#A0B2C6] italic">
                    {language === 'hi' ? '— खाली (SOS नंबर नीचे दर्ज करें) —' : '— Blank (Enter SOS number below) —'}
                  </span>
                )}
              </p>

              {/* Inline Phone Entry / Edit Input */}
              {isEditingPhone && (
                <form onSubmit={handleSavePhone} className="mt-2.5 pt-2.5 border-t border-black/10 dark:border-white/10">
                  <label className="block text-[11px] font-bold text-[#0E1B2C] dark:text-white mb-1">
                    {language === 'hi'
                      ? `${contact.name} का SOS फ़ोन नंबर दर्ज करें:`
                      : `Enter SOS phone number for ${contact.name}:`}
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="tel"
                      placeholder={language === 'hi' ? 'उदा. +91 98765 00000' : 'e.g. +91 98765 00000'}
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#08101A] border border-black/15 dark:border-white/15 text-xs font-mono font-bold text-[#0E1B2C] dark:text-white focus:outline-hidden focus:border-[#E5484D]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-[#E5484D] hover:bg-[#D4373C] text-white text-xs font-black shadow-xs cursor-pointer active:scale-95 flex items-center gap-1 shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'सेव' : 'Save'}</span>
                    </button>
                  </div>
                  {saveSuccess && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      {language === 'hi' ? '✓ फ़ोन नंबर सफलतापूर्वक सेव हो गया' : '✓ SOS phone saved successfully'}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Contact Switcher: Family Manager & Other Members */}
            <div className="mb-4 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#7E90A5] dark:text-[#A0B2C6] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#12B5A6]" />
                  {language === 'hi' ? 'सदस्य का SOS चुनें या नंबर दर्ज करें:' : 'Select Member or Enter SOS:'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(!showCustomForm)}
                  className="text-xs font-black text-[#12B5A6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  {showCustomForm
                    ? language === 'hi' ? 'सूची देखें' : 'View List'
                    : language === 'hi' ? '+ अन्य नंबर' : '+ Other Number'}
                </button>
              </div>

              {/* Custom Number Input Form */}
              {showCustomForm ? (
                <form
                  onSubmit={handleSaveCustomContact}
                  className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2 mb-3"
                >
                  <p className="text-xs font-bold text-[#0E1B2C] dark:text-white">
                    {language === 'hi' ? 'कस्टम आपातकालीन नंबर जोड़ें:' : 'Enter Custom Emergency Number:'}
                  </p>
                  <input
                    type="text"
                    required
                    placeholder={language === 'hi' ? 'संपर्क का नाम (उदा. डॉ. वर्मा / एम्बुलेंस)' : 'Contact Name (e.g. Dr. Verma / Ambulance)'}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#08101A] border border-black/15 dark:border-white/15 text-xs font-bold text-[#0E1B2C] dark:text-white focus:outline-hidden focus:border-[#E5484D]"
                  />
                  <input
                    type="tel"
                    placeholder={language === 'hi' ? 'फोन नंबर (खाली छोड़ सकते हैं या दर्ज करें)' : 'Phone Number (Optional or enter)'}
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#08101A] border border-black/15 dark:border-white/15 text-xs font-mono font-bold text-[#0E1B2C] dark:text-white focus:outline-hidden focus:border-[#E5484D]"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 rounded-lg bg-[#E5484D] text-white text-xs font-black shadow-xs hover:opacity-90 active:scale-95 cursor-pointer"
                    >
                      {language === 'hi' ? 'यह नंबर सेट करें' : 'Set as Active Contact'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-black/10 dark:bg-white/10 text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6] cursor-pointer"
                    >
                      {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {familyContacts.map((m) => {
                    const isSelected = contact.id === m.id || (contact.name.includes(m.name) && !contact.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectContact(m)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 active:scale-98 ${
                          isSelected
                            ? 'bg-[#FEECEE] dark:bg-[#E5484D]/20 border-[#E5484D] shadow-xs'
                            : 'bg-white dark:bg-[#17263A] border-black/8 dark:border-white/8 hover:border-black/20 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[#0E1B2C] dark:text-white truncate">
                              {m.name}
                            </span>
                            {m.isManager && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#FF6B4A]/15 text-[#FF6B4A] font-black shrink-0">
                                Manager
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono font-bold text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5 truncate">
                            {m.phone ? m.phone : (
                              <span className="italic text-amber-600 dark:text-amber-400 font-sans font-semibold">
                                {language === 'hi' ? 'खाली (दर्ज करें)' : 'Blank (Enter SOS)'}
                              </span>
                            )}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#E5484D] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              {contact.phone ? (
                <a
                  href={`tel:${contact.phone.replace(/[\s()-]/g, '')}`}
                  className="w-full min-h-[52px] sm:min-h-[58px] rounded-2xl bg-[#E5484D] hover:bg-[#D4373C] text-white text-base sm:text-lg font-black flex items-center justify-center gap-2 shadow-lg shadow-[#E5484D]/30 active:scale-98 transition-transform"
                >
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>
                    {language === 'hi' ? 'अभी कॉल करें' : 'Call Emergency Now'}
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(true)}
                  className="w-full min-h-[52px] sm:min-h-[58px] rounded-2xl bg-[#FF6B4A] hover:bg-[#FF5A35] text-white text-base sm:text-lg font-black flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform cursor-pointer"
                >
                  <Edit3 className="w-5 h-5" />
                  <span>
                    {language === 'hi' ? 'कॉल के लिए SOS नंबर दर्ज करें' : 'Enter SOS Number to Call'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="w-full py-2 text-sm font-bold text-[#7E90A5] dark:text-[#A0B2C6] hover:underline cursor-pointer"
              >
                {language === 'hi' ? 'बंद करें' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


