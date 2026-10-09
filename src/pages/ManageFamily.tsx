import {
  AlertOctagon,
  AlertTriangle,
  Check,
  Copy,
  Edit2,
  KeyRound,
  MessageCircle,
  Plus,
  Pill,
  FileText,
  RefreshCw,
  Share2,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TopHeader } from '../components/TopHeader';
import { AddMedicineModal } from '../components/AddMedicineModal';
import { ExportPrescriptionModal } from '../components/ExportPrescriptionModal';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';
import { FamilyAlert, Member } from '../types';

export const ManageFamily: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { family, members, refreshMembers, refreshFamily } = useAuth();
  const { language } = usePreferences();

  const queryParams = new URLSearchParams(location.search);
  const openAddFormInitially = queryParams.get('action') === 'add';

  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(openAddFormInitially);
  const [alerts, setAlerts] = useState<FamilyAlert[]>([]);

  // New member form states
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('male');
  const [newDob, setNewDob] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newConditions, setNewConditions] = useState<string[]>([]);
  const [addingMember, setAddingMember] = useState(false);
  const [formError, setFormError] = useState('');

  // Modals for actions
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [memberToCreateLogin, setMemberToCreateLogin] = useState<Member | null>(null);
  const [memberToResetPass, setMemberToResetPass] = useState<Member | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [newPassword, setNewPassword] = useState('newpassword123');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [medModalMemberId, setMedModalMemberId] = useState<string | null>(null);
  const [rxModalMemberId, setRxModalMemberId] = useState<string | null>(null);

  useEffect(() => {
    api.getAlerts().then(setAlerts);
  }, []);

  const handleCopyCode = () => {
    if (family?.inviteCode) {
      navigator.clipboard.writeText(family.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (!family?.inviteCode) return;
    const text =
      language === 'hi'
        ? `हमारे परिवार के हेल्थनेस्ट (MEDITREE) से जुड़ें! इनवाइट कोड है: ${family.inviteCode}`
        : `Join our family on MEDITREE! Use family invite code: ${family.inviteCode}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleRegenerateCode = async () => {
    await api.regenerateInviteCode();
    await refreshFamily();
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError(language === 'hi' ? 'कृपया नाम दर्ज करें' : 'Please enter member name');
      return;
    }

    setAddingMember(true);
    setFormError('');
    try {
      await api.addMember({
        name: newName.trim(),
        relation: newRelation.trim() || 'Family Member',
        gender: newGender,
        dob: newDob || undefined,
        heightCm: newHeight ? parseInt(newHeight, 10) : undefined,
        conditions: newConditions,
        notes: '',
      });
      await refreshMembers();
      setShowAddModal(false);
      setNewName('');
      setNewRelation('');
      setNewDob('');
      setNewHeight('');
      setNewConditions([]);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      await api.deleteMember(memberToDelete.id);
      await refreshMembers();
      setMemberToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLogin = async () => {
    if (!memberToCreateLogin || !loginEmail.trim()) return;
    try {
      await api.createMemberLogin(memberToCreateLogin.id, loginEmail.trim(), loginPassword);
      await refreshMembers();
      setActionSuccessMsg(`Login created for ${memberToCreateLogin.name}`);
      setMemberToCreateLogin(null);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!memberToResetPass) return;
    try {
      await api.resetPassword(memberToResetPass.id, newPassword);
      setActionSuccessMsg(`Password reset successfully for ${memberToResetPass.name}`);
      setMemberToResetPass(null);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] dark:bg-[#08101A] pb-32 transition-colors">
      <TopHeader />

      <main className="max-w-4xl lg:max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
        <div>
          <h2 className="text-3xl font-black text-[#0E1B2C] dark:text-white font-heading">
            {language === 'hi' ? 'परिवार प्रबंधन' : 'Manage Family'}
          </h2>
          <p className="text-xs font-bold text-[#7E90A5] mt-0.5">
            {family?.name || 'Sharma Family'} • Manager Control Hub
          </p>
        </div>

        {actionSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-[#E8F8F1] border border-[#1FA971] text-[#147A50] font-bold text-sm text-center">
            {actionSuccessMsg}
          </div>
        )}

        {/* ALERTS FEED FOR RED OR AMBER READINGS ACROSS THE FAMILY */}
        {alerts.length > 0 && (
          <div className="card-wellness p-4.5 bg-[#FFF5F5] dark:bg-[#201014] border border-[#E5484D]/30 space-y-2.5">
            <div className="flex items-center gap-2 text-[#E5484D]">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              <h3 className="text-base font-black font-heading">Family Health Alerts Feed</h3>
            </div>
            <div className="space-y-2">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className="p-3 rounded-xl bg-white dark:bg-[#17263A] border border-[#E5484D]/20 dark:border-white/10 text-xs flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-black text-[#B0282C] dark:text-[#FF8A8A]">{al.memberName}:</span>{' '}
                    <span className="font-semibold text-[#0E1B2C] dark:text-white">{al.message}</span>
                    <p className="text-[10px] text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5">
                      {new Date(al.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      api.dismissAlert(al.id);
                      setAlerts(alerts.filter((a) => a.id !== al.id));
                    }}
                    className="p-1 text-[#7E90A5] hover:text-[#E5484D] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BIG CARD WITH INVITE CODE, COPY BUTTON, AND SHARE ON WHATSAPP */}
        <div className="card-hero p-5 md:p-6 text-center relative overflow-hidden shadow-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#FF6B4A]/20 blur-3xl pointer-events-none" />

          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB020] bg-white/10 px-2.5 py-1 rounded-full">
            Family Invite Code
          </span>

          <div className="my-3 py-3 px-6 rounded-2xl bg-white/10 border-2 border-dashed border-white/30 inline-block">
            <span className="text-4xl md:text-5xl font-black tracking-widest text-white font-heading">
              {family?.inviteCode || 'K7P3QX'}
            </span>
          </div>

          <p className="text-xs font-semibold text-white/80 max-w-xs mx-auto">
            Members can join your family account using this code on signup.
          </p>

          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <button
              type="button"
              onClick={handleCopyCode}
              className="min-h-[50px] rounded-xl bg-white text-[#0E1B2C] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-[#1FA971]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="min-h-[50px] rounded-xl bg-[#25D366] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleRegenerateCode}
            className="mt-3 text-[11px] font-bold text-white/60 hover:text-white inline-flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Regenerate code</span>
          </button>
        </div>

        {/* LIST OF MEMBERS WITH "HAS LOGIN" / "NO LOGIN" BADGE & ACTIONS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading">
              Members & Dependents
            </h3>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0E1B2C] hover:bg-[#1a2d47] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#0E1B2C] text-xs font-black flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {members.map((m) => (
              <div
                key={m.id}
                className="card-wellness p-4 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] flex items-center justify-center text-lg font-black shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[#0E1B2C] dark:text-white">{m.name}</h4>
                      <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">{m.relation}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      m.hasLogin
                        ? 'bg-[#E8F8F1] dark:bg-[#10B981]/20 text-[#147A50] dark:text-[#34D399] border-[#1FA971]/30'
                        : 'bg-[#FEF7E6] dark:bg-[#F59E0B]/20 text-[#9A6707] dark:text-[#FBBF24] border-[#E8A317]/30'
                    }`}
                  >
                    {m.hasLogin ? 'Has Login' : 'No Phone'}
                  </span>
                </div>

                {/* Featured Medicine & Prescription Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/8 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setMedModalMemberId(m.id)}
                    className="py-2 px-3 rounded-xl bg-[#0E1B2C] hover:bg-[#1a2d47] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#0E1B2C] font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    title={`Add medicine prescription for ${m.name}`}
                  >
                    <Pill className="w-3.5 h-3.5 text-[#12B5A6]" />
                    <span>+ Add Medicine</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRxModalMemberId(m.id)}
                    className="py-2 px-3 rounded-xl bg-[#E6F8F6] hover:bg-[#d5f3f0] dark:bg-[#12B5A6]/20 border border-[#12B5A6]/30 text-[#12B5A6] font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    title={`Export prescription for ${m.name}`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export Rx</span>
                  </button>
                </div>

                {/* Per-member secondary actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 pt-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => navigate(`/add-reading?memberId=${m.id}`)}
                    className="py-2 px-2 rounded-xl bg-[#FFF0E8] dark:bg-[#FF6B4A]/20 text-[#FF6B4A] dark:text-[#FF8A6A] hover:bg-[#FFE3D4] text-center cursor-pointer"
                  >
                    + Add Reading
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/track?memberId=${m.id}`)}
                    className="py-2 px-2 rounded-xl bg-[#F4F6F9] dark:bg-[#17263A] text-[#0E1B2C] dark:text-white hover:bg-[#E6F8F6] text-center cursor-pointer"
                  >
                    View History
                  </button>

                  {!m.hasLogin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMemberToCreateLogin(m);
                        setLoginEmail(`${m.name.toLowerCase().replace(/\s+/g, '')}@family.com`);
                      }}
                      className="py-2 px-2 rounded-xl bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] dark:text-[#5EEAD4] text-center cursor-pointer font-black"
                    >
                      Create Login
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMemberToResetPass(m)}
                      className="py-2 px-2 rounded-xl bg-[#F4F6F9] dark:bg-[#17263A] text-[#0E1B2C] dark:text-white text-center cursor-pointer"
                    >
                      Reset Password
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setMemberToDelete(m)}
                    className="py-2 px-2 rounded-xl bg-[#FEECEE] dark:bg-[#E5484D]/20 text-[#E5484D] dark:text-[#FF8A8A] text-center cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADD MEMBER MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
            <div className="card-wellness p-6 bg-white max-w-sm w-full relative">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1 text-[#7E90A5]"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-xl font-black text-[#0E1B2C] font-heading mb-1">
                Add Family Member
              </h4>
              <p className="text-xs text-[#7E90A5] mb-4">
                Add elders or kids even if they don't have a phone.
              </p>

              {formError && (
                <div className="p-2.5 mb-3 bg-[#FEECEE] text-[#E5484D] text-xs font-bold rounded-xl">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddMemberSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name (e.g. Papa / Devender)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-black/20 px-3 text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="Relation (Father, Mother, Grandmother)"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full h-11 rounded-xl border border-black/20 px-3 text-xs font-bold"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full h-11 rounded-xl border border-black/20 px-2 text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    className="w-full h-11 rounded-xl border border-black/20 px-2 text-xs font-bold"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-[#0E1B2C] text-white font-bold text-sm cursor-pointer"
                  >
                    Save Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {memberToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
            <div className="card-wellness p-6 bg-white max-w-sm w-full text-center">
              <Trash2 className="w-12 h-12 text-[#E5484D] mx-auto mb-2" />
              <h4 className="text-xl font-black text-[#0E1B2C] font-heading">
                Remove {memberToDelete.name}?
              </h4>
              <p className="text-xs text-[#7E90A5] mt-1">
                All measurements recorded for this member will also be deleted.
              </p>
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleDeleteMember}
                  className="w-full py-3 bg-[#E5484D] text-white rounded-xl font-bold cursor-pointer"
                >
                  Yes, Remove
                </button>
                <button
                  type="button"
                  onClick={() => setMemberToDelete(null)}
                  className="w-full py-2 border border-black/20 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE LOGIN MODAL */}
        {memberToCreateLogin && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
            <div className="card-wellness p-6 bg-white max-w-sm w-full">
              <h4 className="text-xl font-black text-[#0E1B2C] font-heading mb-1">
                Create Login for {memberToCreateLogin.name}
              </h4>
              <p className="text-xs text-[#7E90A5] mb-3">
                They can log in with this email and password.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-11 rounded-xl border border-black/20 px-3 text-xs font-bold"
                />
                <input
                  type="text"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-black/20 px-3 text-xs font-bold"
                />
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleCreateLogin}
                    className="w-full py-2.5 bg-[#0E1B2C] text-white rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Confirm & Create Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberToCreateLogin(null)}
                    className="w-full py-2 border border-black/20 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESET PASSWORD MODAL */}
        {memberToResetPass && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
            <div className="card-wellness p-6 bg-white max-w-sm w-full">
              <h4 className="text-xl font-black text-[#0E1B2C] font-heading mb-2">Reset Password</h4>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-11 rounded-xl border border-black/20 px-3 text-xs font-bold mb-3"
              />
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="w-full py-2.5 bg-[#0E1B2C] text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Save New Password
                </button>
                <button
                  type="button"
                  onClick={() => setMemberToResetPass(null)}
                  className="w-full py-2 border border-black/20 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ADD MEDICINE MODAL */}
        {medModalMemberId && (
          <AddMedicineModal
            isOpen={true}
            initialMemberId={medModalMemberId}
            onClose={() => setMedModalMemberId(null)}
            onSuccess={() => {
              setActionSuccessMsg('Medicine prescribed and recorded successfully!');
              setTimeout(() => setActionSuccessMsg(''), 4000);
            }}
          />
        )}

        {/* EXPORT PRESCRIPTION MODAL */}
        {rxModalMemberId && (
          <ExportPrescriptionModal
            isOpen={true}
            memberId={rxModalMemberId}
            onClose={() => setRxModalMemberId(null)}
            onOpenAddMedicine={(id) => {
              setRxModalMemberId(null);
              setMedModalMemberId(id);
            }}
          />
        )}
      </main>
    </div>
  );
};
