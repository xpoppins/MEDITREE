import {
  Calendar,
  Clock,
  Download,
  Edit,
  FileText,
  Globe,
  Heart,
  LogOut,
  MapPin,
  Moon,
  Phone,
  Pill,
  Plus,
  Scale,
  ShieldAlert,
  Sun,
  Trash2,
  Type,
  User as UserIcon,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddMedicineModal } from '../components/AddMedicineModal';
import { ExportPrescriptionModal } from '../components/ExportPrescriptionModal';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { StatusChip } from '../components/StatusCard';
import { TopHeader } from '../components/TopHeader';
import { useAuth } from '../context/AuthContext';
import { TextSize, usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';
import { Appointment, Member, Medicine } from '../types';
import { bmiInfo } from '../utils/healthRules';

export const MemberProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isManager, members, logout, refreshMembers } = useAuth();
  const { textSize, setTextSize, language, setLanguage } = usePreferences();

  const member = members.find((m) => m.id === user?.memberId) || members[0];
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showAddApp, setShowAddApp] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showExportRxModal, setShowExportRxModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docSpec, setDocSpec] = useState('');
  const [docClinic, setDocClinic] = useState('');
  const [appDate, setAppDate] = useState('');
  const [appTime, setAppTime] = useState('');

  // Emergency contact editing
  const [ecName, setEcName] = useState(member?.emergencyContact?.name || 'Rakesh Sharma');
  const [ecPhone, setEcPhone] = useState(member?.emergencyContact?.phone || '+91 98765 43210');
  const [ecSaved, setEcSaved] = useState(false);

  const loadMeds = () => {
    if (member) {
      api.getMedicines(member.id).then(setMedicines).catch(() => {});
    }
  };

  useEffect(() => {
    if (member) {
      api.getAppointments(member.id).then(setAppointments);
      loadMeds();
    }
  }, [member]);

  const bmiData = bmiInfo(73.5, member?.heightCm || 168);

  const handleSaveContact = async () => {
    if (!member) return;
    await api.updateMember(member.id, {
      emergencyContact: {
        name: ecName,
        phone: ecPhone,
        relation: 'Primary Emergency Contact',
      },
    });
    await refreshMembers();
    setEcSaved(true);
    setTimeout(() => setEcSaved(false), 2000);
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !appDate) return;
    await api.addAppointment({
      familyId: 'f1',
      memberId: member.id,
      doctorName: docName.trim(),
      specialty: docSpec.trim() || 'General Physician',
      clinic: docClinic.trim() || 'City Clinic',
      date: appDate,
      time: appTime || '10:00 AM',
    });
    setDocName('');
    setDocSpec('');
    setDocClinic('');
    setShowAddApp(false);
    const updated = await api.getAppointments(member.id);
    setAppointments(updated);
  };

  const handleDeleteApp = async (id: string) => {
    await api.deleteAppointment(id);
    const updated = await api.getAppointments(member.id);
    setAppointments(updated);
  };

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] dark:bg-[#08101A] pb-32 transition-colors">
      <TopHeader />

      <main className="max-w-4xl lg:max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
        <div>
          <h2 className="text-3xl font-black text-[#0E1B2C] dark:text-white font-heading">
            {language === 'hi' ? 'मेरा खाता व सेटिंग्स' : 'My Profile & Settings'}
          </h2>
          <p className="text-xs font-bold text-[#7E90A5] mt-0.5">
            {member?.name} • Personal Health Vault
          </p>
        </div>

        {/* 1. PROFILE CARD */}
        <div className="card-wellness p-5 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0E1B2C] text-white flex items-center justify-center text-3xl font-black shadow-xs shrink-0">
              {member?.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-[#0E1B2C] font-heading">{member?.name}</h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#E6F8F6] text-[#12B5A6]">
                  {member?.hasLogin ? 'Login Active' : 'No Phone'}
                </span>
              </div>
              <p className="text-xs font-bold text-[#7E90A5]">
                {member?.relation} • Born {member?.dob || '1958'} • Height: {member?.heightCm || 168} cm
              </p>
            </div>
          </div>

          {/* Asian BMI card */}
          {bmiData && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#F9FBFC] border border-black/8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-[#7E90A5]">Asian BMI Index</p>
                <p className="text-2xl font-black text-[#0E1B2C] font-heading">{bmiData.bmi} <span className="text-xs font-bold text-[#7E90A5]">kg/m²</span></p>
              </div>
              <StatusChip status={bmiData.status} label={bmiData.statusWord} />
            </div>
          )}

          {/* Conditions */}
          <div className="mt-4 pt-3 border-t border-black/8">
            <p className="text-[11px] font-black uppercase text-[#7E90A5] mb-2">Health Conditions</p>
            <div className="flex flex-wrap gap-1.5">
              {member?.conditions?.map((c) => (
                <span key={c} className="px-3 py-1 rounded-xl bg-[#FFF0E8] text-[#FF6B4A] text-xs font-black">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 2. EMERGENCY CONTACT (With Direct Tel Dialing) */}
        <div className="card-wellness p-5 bg-white border border-[#E5484D]/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#E5484D]">
              <Phone className="w-5 h-5 animate-pulse" />
              <h3 className="text-lg font-black font-heading">Emergency Contact</h3>
            </div>
            {ecSaved && <span className="text-xs font-black text-[#1FA971]">Saved!</span>}
          </div>

          <p className="text-xs text-[#7E90A5]">
            This person is called when you or an elder taps the Emergency SOS button.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-black uppercase text-[#7E90A5] mb-1">Name</label>
              <input
                type="text"
                value={ecName}
                onChange={(e) => setEcName(e.target.value)}
                className="w-full h-11 rounded-xl border border-black/15 px-3 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-[#7E90A5] mb-1">Phone</label>
              <input
                type="tel"
                value={ecPhone}
                onChange={(e) => setEcPhone(e.target.value)}
                className="w-full h-11 rounded-xl border border-black/15 px-3 text-xs font-bold font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveContact}
              className="py-2.5 px-4 rounded-xl bg-[#0E1B2C] text-white text-xs font-bold cursor-pointer"
            >
              Save Contact
            </button>
            <a
              href={`tel:${ecPhone.replace(/\s+/g, '')}`}
              className="py-2.5 px-4 rounded-xl bg-[#FEECEE] text-[#E5484D] text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <span>Test Dial</span>
            </a>
          </div>
        </div>

        {/* 2.5 MEDICINES & PRESCRIPTION CARD */}
        <div className="card-wellness p-5 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/8 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] flex items-center justify-center">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0E1B2C] dark:text-white font-heading">
                  {language === 'hi' ? 'दवाइयां व प्रिस्क्रिप्शन' : 'Medications & Prescriptions'}
                </h3>
                <p className="text-[11px] font-bold text-[#7E90A5]">
                  {medicines.length} {medicines.length === 1 ? 'medicine' : 'medicines'} prescribed for {member?.name}
                </p>
              </div>
            </div>

            {/* Featured Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddMedModal(true)}
                className="py-2 px-3 rounded-xl bg-[#0E1B2C] hover:bg-[#1a2d47] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#0E1B2C] font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Pill className="w-3.5 h-3.5 text-[#12B5A6]" />
                <span>+ Add Medicine</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExportRxModal(true)}
                className="py-2 px-3 rounded-xl bg-[#E6F8F6] hover:bg-[#d5f3f0] dark:bg-[#12B5A6]/20 border border-[#12B5A6]/30 text-[#12B5A6] font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Prescription (Rx)</span>
              </button>
            </div>
          </div>

          {/* List of active meds */}
          <div className="space-y-2">
            {medicines.length === 0 ? (
              <div className="text-center py-5 border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                <Pill className="w-7 h-7 text-[#7E90A5] mx-auto mb-1.5 opacity-50" />
                <p className="text-xs font-bold text-[#7E90A5]">No medications recorded yet.</p>
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(true)}
                  className="mt-2 text-xs font-black text-[#12B5A6] hover:underline"
                >
                  + Add First Medicine Now
                </button>
              </div>
            ) : (
              medicines.map((med) => (
                <div
                  key={med.id}
                  className="p-3 rounded-xl bg-[#F9FBFC] dark:bg-[#142234] border border-black/6 dark:border-white/6 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-[#0E1B2C] dark:text-white">{med.name}</h4>
                      <span className="text-[11px] font-bold text-[#FF6B4A]">({med.dose})</span>
                      {med.condition && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#7E90A5]">
                          {med.condition}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-[#7E90A5] mt-0.5">
                      ⏰ {med.times.join(', ')} • {med.instructions || 'With water'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. DOCTOR APPOINTMENTS LIST */}
        <div className="card-wellness p-5 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#12B5A6]" />
              <h3 className="text-lg font-black text-[#0E1B2C] dark:text-white font-heading">Doctor Appointments</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddApp(true)}
              className="py-1.5 px-3 rounded-xl bg-[#F4F6F9] dark:bg-[#17263A] hover:bg-[#E6F8F6] dark:hover:bg-[#12B5A6]/20 text-[#0E1B2C] dark:text-white border border-black/5 dark:border-white/10 text-xs font-black flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {appointments.length === 0 ? (
              <p className="text-xs text-[#7E90A5] dark:text-[#A0B2C6] py-2">No upcoming visits scheduled.</p>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="p-3.5 rounded-2xl bg-[#F9FBFC] dark:bg-[#142234] border border-black/8 dark:border-white/10 flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-[#0E1B2C] dark:text-white">{app.doctorName}</h4>
                    <p className="text-xs font-bold text-[#FF6B4A]">{app.specialty} • {app.clinic}</p>
                    <p className="text-[11px] font-semibold text-[#7E90A5] dark:text-[#A0B2C6] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#12B5A6]" />
                      <span>{app.date} at {app.time}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteApp(app.id)}
                    className="p-1.5 text-[#E5484D] hover:bg-[#FEECEE] dark:hover:bg-[#E5484D]/20 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Appointment Modal */}
        {showAddApp && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="card-wellness p-6 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 max-w-sm w-full shadow-2xl rounded-3xl">
              <h4 className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading mb-3">Add Appointment</h4>
              <form onSubmit={handleAddAppointment} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Doctor Name (e.g. Dr. Verma)"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white px-3 text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="Specialty (Cardiologist, Physician)"
                  value={docSpec}
                  onChange={(e) => setDocSpec(e.target.value)}
                  className="w-full h-11 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white px-3 text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="Hospital / Clinic"
                  value={docClinic}
                  onChange={(e) => setDocClinic(e.target.value)}
                  className="w-full h-11 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white px-3 text-xs font-bold"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={appDate}
                    onChange={(e) => setAppDate(e.target.value)}
                    className="w-full h-11 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white px-2 text-xs font-bold"
                  />
                  <input
                    type="time"
                    value={appTime}
                    onChange={(e) => setAppTime(e.target.value)}
                    className="w-full h-11 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white px-2 text-xs font-bold"
                  />
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <button type="submit" className="flex-1 py-2.5 bg-[#12B5A6] hover:bg-[#0EA092] text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm">
                    Save Visit
                  </button>
                  <button type="button" onClick={() => setShowAddApp(false)} className="px-4 py-2.5 border border-black/20 dark:border-white/20 rounded-xl text-xs font-bold text-[#0E1B2C] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. PREFERENCES (Text Size & Language) */}
        <div className="card-wellness p-5 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 space-y-4">
          <h3 className="text-lg font-black text-[#0E1B2C] dark:text-white font-heading">Display & Language</h3>

          {/* Text Size A / A+ / A++ */}
          <div>
            <label className="block text-xs font-black uppercase text-[#7E90A5] dark:text-[#A0B2C6] mb-1.5">
              Elder Text Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['A', 'A+', 'A++'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setTextSize(sz)}
                  className={`py-3 rounded-xl font-heading font-black text-center transition-all cursor-pointer ${
                    textSize === sz ? 'bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] shadow-xs' : 'bg-[#F4F6F9] dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/5 dark:border-white/10'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Language Toggle */}
          <div>
            <label className="block text-xs font-black uppercase text-[#7E90A5] dark:text-[#A0B2C6] mb-1.5">
              App Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  language === 'en' ? 'bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] shadow-xs' : 'bg-[#F4F6F9] dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/5 dark:border-white/10'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  language === 'hi' ? 'bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] shadow-xs' : 'bg-[#F4F6F9] dark:bg-[#17263A] text-[#0E1B2C] dark:text-white border border-black/5 dark:border-white/10'
                }`}
              >
                हिंदी (Hindi)
              </button>
            </div>
          </div>
        </div>

        {/* 5. PWA INSTALL */}
        <div className="card-wellness p-5 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10">
          <h4 className="text-base font-black text-[#0E1B2C] dark:text-white font-heading mb-1">Install on Android / iPhone</h4>
          <p className="text-xs text-[#7E90A5] dark:text-[#A0B2C6] mb-3">
            Add HealthNest icon to your home screen for rapid 1-tap elder access.
          </p>
          <PWAInstallButton />
        </div>

        {/* 6. LOG OUT & DELETE ACCOUNT */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full min-h-[54px] rounded-2xl bg-[#FEECEE] hover:bg-[#FCD7DA] text-[#E5484D] font-heading font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out of HealthNest</span>
          </button>
        </div>

        <p className="text-center text-xs text-[#7E90A5] italic pt-2">
          For tracking only. Not medical advice.
        </p>
      </main>

      {/* Add Medicine Modal */}
      <AddMedicineModal
        isOpen={showAddMedModal}
        initialMemberId={member?.id}
        onClose={() => setShowAddMedModal(false)}
        onSuccess={loadMeds}
      />

      {/* Export Prescription Modal */}
      <ExportPrescriptionModal
        isOpen={showExportRxModal}
        memberId={member?.id}
        onClose={() => setShowExportRxModal(false)}
        onOpenAddMedicine={() => {
          setShowExportRxModal(false);
          setShowAddMedModal(true);
        }}
      />
    </div>
  );
};
