import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  Edit2,
  Heart,
  Scale,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StatusChip } from '../components/StatusCard';
import { TopHeader } from '../components/TopHeader';
import { TrendChart } from '../components/TrendChart';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';
import { Reading, ReadingType } from '../types';

export const History: React.FC = () => {
  const location = useLocation();
  const { user, isManager, members } = useAuth();
  const { language } = usePreferences();

  const queryParams = new URLSearchParams(location.search);
  const targetMemberParam = queryParams.get('memberId');
  const initialTab = (queryParams.get('tab') as ReadingType) || 'bp';

  const [selectedMemberId, setSelectedMemberId] = useState<string>(() => {
    if (!isManager && user?.memberId) return user.memberId;
    return targetMemberParam || (members[0]?.id || 'm2');
  });

  const [activeTab, setActiveTab] = useState<ReadingType>(initialTab);
  const [activeRange, setActiveRange] = useState<7 | 30 | 90>(30);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Delete states
  const [itemToDelete, setItemToDelete] = useState<Reading | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Reading | null>(null);
  const [editSys, setEditSys] = useState('');
  const [editDia, setEditDia] = useState('');
  const [editSugar, setEditSugar] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentMember = members.find((m) => m.id === selectedMemberId);

  const fetchReadings = async () => {
    setLoading(true);
    try {
      const data = await api.getReadings({
        memberId: selectedMemberId,
        type: activeTab,
        days: activeRange,
      });
      setReadings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [selectedMemberId, activeTab, activeRange]);

  // Compute Average / Highest / Lowest stat cards
  const stats = React.useMemo(() => {
    if (readings.length === 0) return null;

    if (activeTab === 'bp') {
      const sysList = readings.map((r) => r.systolic || 0).filter((v) => v > 0);
      const diaList = readings.map((r) => r.diastolic || 0).filter((v) => v > 0);
      const avgSys = Math.round(sysList.reduce((a, b) => a + b, 0) / (sysList.length || 1));
      const avgDia = Math.round(diaList.reduce((a, b) => a + b, 0) / (diaList.length || 1));
      const maxSys = Math.max(...sysList);
      const minSys = Math.min(...sysList);

      return {
        avg: `${avgSys}/${avgDia}`,
        unit: 'mmHg',
        max: `${maxSys}`,
        min: `${minSys}`,
      };
    }

    if (activeTab === 'sugar') {
      const list = readings.map((r) => r.sugar || 0).filter((v) => v > 0);
      const avg = Math.round(list.reduce((a, b) => a + b, 0) / (list.length || 1));
      const max = Math.max(...list);
      const min = Math.min(...list);

      return {
        avg: `${avg}`,
        unit: 'mg/dL',
        max: `${max}`,
        min: `${min}`,
      };
    }

    if (activeTab === 'weight') {
      const list = readings.map((r) => r.weightKg || 0).filter((v) => v > 0);
      const avg = (list.reduce((a, b) => a + b, 0) / (list.length || 1)).toFixed(1);
      const max = Math.max(...list).toFixed(1);
      const min = Math.min(...list).toFixed(1);

      return {
        avg: `${avg}`,
        unit: 'kg',
        max: `${max}`,
        min: `${min}`,
      };
    }

    return null;
  }, [readings, activeTab]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteReading(itemToDelete.id);
      setItemToDelete(null);
      await fetchReadings();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditOpen = (r: Reading) => {
    setItemToEdit(r);
    if (r.type === 'bp') {
      setEditSys(r.systolic?.toString() || '');
      setEditDia(r.diastolic?.toString() || '');
    } else if (r.type === 'sugar') {
      setEditSugar(r.sugar?.toString() || '');
    } else if (r.type === 'weight') {
      setEditWeight(r.weightKg?.toString() || '');
    }
  };

  const handleEditSave = async () => {
    if (!itemToEdit) return;
    setIsUpdating(true);
    try {
      const updates: Partial<Reading> = {};
      if (itemToEdit.type === 'bp') {
        updates.systolic = parseInt(editSys, 10);
        updates.diastolic = parseInt(editDia, 10);
      } else if (itemToEdit.type === 'sugar') {
        updates.sugar = parseInt(editSugar, 10);
      } else if (itemToEdit.type === 'weight') {
        updates.weightKg = parseFloat(editWeight);
      }

      await api.updateReading(itemToEdit.id, updates);
      setItemToEdit(null);
      await fetchReadings();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] dark:bg-[#08101A] pb-32 transition-colors">
      <TopHeader />

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
        <div>
          <h2 className="text-3xl font-black text-[#0E1B2C] dark:text-white font-heading">
            {language === 'hi' ? 'स्वास्थ्य रुझान व इतिहास' : 'Track Trends & History'}
          </h2>
          <p className="text-xs font-bold text-[#7E90A5] mt-0.5">
            {currentMember?.name} • Vitality Analytics
          </p>
        </div>

        {/* Member Selector (Manager only) */}
        {isManager && (
          <div className="card-wellness p-3 bg-white">
            <p className="text-[11px] font-black uppercase text-[#7E90A5] mb-2 px-1">
              Select Member:
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                    selectedMemberId === m.id
                      ? 'bg-[#0E1B2C] text-white shadow-xs'
                      : 'bg-[#F4F6F9] text-[#0E1B2C]'
                  }`}
                >
                  {m.name} ({m.relation})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3 TABS FOR BP, SUGAR, WEIGHT */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-white dark:bg-[#0E1B2C] rounded-2xl border border-black/8 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('bp')}
            className={`min-h-[48px] rounded-xl flex items-center justify-center gap-1.5 text-sm font-black transition-all cursor-pointer ${
              activeTab === 'bp'
                ? 'bg-gradient-to-r from-[#FF6B4A] to-[#FF9028] text-white shadow-xs'
                : 'text-[#7E90A5] hover:text-[#0E1B2C]'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>BP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sugar')}
            className={`min-h-[48px] rounded-xl flex items-center justify-center gap-1.5 text-sm font-black transition-all cursor-pointer ${
              activeTab === 'sugar'
                ? 'bg-gradient-to-r from-[#FF6B4A] to-[#FF9028] text-white shadow-xs'
                : 'text-[#7E90A5] hover:text-[#0E1B2C]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Sugar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('weight')}
            className={`min-h-[48px] rounded-xl flex items-center justify-center gap-1.5 text-sm font-black transition-all cursor-pointer ${
              activeTab === 'weight'
                ? 'bg-gradient-to-r from-[#FF6B4A] to-[#FF9028] text-white shadow-xs'
                : 'text-[#7E90A5] hover:text-[#0E1B2C]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Weight</span>
          </button>
        </div>

        {/* RANGE CHIPS (7 / 30 / 90 DAYS) */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#7E90A5]">Window:</span>
          <div className="flex items-center gap-1.5">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setActiveRange(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeRange === d
                    ? 'bg-[#0E1B2C] text-white shadow-2xs'
                    : 'bg-white text-[#7E90A5] border border-black/10'
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        {/* AVERAGE / HIGHEST / LOWEST STAT CARDS */}
        {stats && (
          <div className="grid grid-cols-3 gap-2.5">
            <div className="card-wellness p-3.5 bg-white text-center">
              <span className="text-[10px] font-black uppercase text-[#7E90A5]">Average</span>
              <p className="text-xl font-black text-[#0E1B2C] font-heading mt-0.5">
                {stats.avg}
              </p>
              <span className="text-[10px] font-bold text-[#7E90A5]">{stats.unit}</span>
            </div>

            <div className="card-wellness p-3.5 bg-[#FFF5F2] border border-[#FF6B4A]/25 text-center">
              <span className="text-[10px] font-black uppercase text-[#FF6B4A]">Highest</span>
              <p className="text-xl font-black text-[#E5484D] font-heading mt-0.5 flex items-center justify-center gap-0.5">
                <ArrowUp className="w-3.5 h-3.5" />
                <span>{stats.max}</span>
              </p>
              <span className="text-[10px] font-bold text-[#7E90A5]">{stats.unit}</span>
            </div>

            <div className="card-wellness p-3.5 bg-[#E6F8F6] border border-[#12B5A6]/25 text-center">
              <span className="text-[10px] font-black uppercase text-[#12B5A6]">Lowest</span>
              <p className="text-xl font-black text-[#1FA971] font-heading mt-0.5 flex items-center justify-center gap-0.5">
                <ArrowDown className="w-3.5 h-3.5" />
                <span>{stats.min}</span>
              </p>
              <span className="text-[10px] font-bold text-[#7E90A5]">{stats.unit}</span>
            </div>
          </div>
        )}

        {/* SMOOTH LINE CHART WITH HEALTHY RANGE SHADED */}
        <TrendChart readings={readings} type={activeTab} days={activeRange} />

        {/* LIST OF READINGS WITH EDIT AND DELETE */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black text-[#0E1B2C] dark:text-white font-heading">
              {language === 'hi' ? 'सभी दर्ज माप' : 'Historical Log'}
            </h3>
            <span className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
              {readings.length} records
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
              Loading readings...
            </div>
          ) : readings.length === 0 ? (
            <div className="card-wellness p-6 text-center text-[#7E90A5] dark:text-[#A0B2C6] font-bold bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10">
              No measurements found in this {activeRange}-day range.
            </div>
          ) : (
            <div className="space-y-2.5">
              {readings.map((r) => {
                const dateObj = new Date(r.takenAt);
                const dStr = `${dateObj.getDate()} ${dateObj.toLocaleString('en-US', {
                  month: 'short',
                })}`;
                const tStr = dateObj.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={r.id}
                    className="card-wellness p-4 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] mb-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{dStr}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{tStr}</span>
                        </div>

                        {r.type === 'bp' && (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-[#0E1B2C] dark:text-black font-heading">
                              {r.systolic}/{r.diastolic}
                            </span>
                            <span className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">mmHg</span>
                            {r.pulse && (
                              <span className="text-xs font-bold text-[#E8A317] ml-2">
                                {r.pulse} bpm
                              </span>
                            )}
                          </div>
                        )}

                        {r.type === 'sugar' && (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-[#0E1B2C] dark:text-white font-heading">
                              {r.sugar}
                            </span>
                            <span className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">mg/dL</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] ml-2 capitalize">
                              {r.sugarContext}
                            </span>
                          </div>
                        )}

                        {r.type === 'weight' && (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-[#0E1B2C] dark:text-white font-heading">
                              {r.weightKg}
                            </span>
                            <span className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">kg</span>
                          </div>
                        )}
                      </div>

                      <StatusChip status={r.status} />
                    </div>

                    <p className="text-xs font-semibold text-[#4A5B70] dark:text-[#A0B2C6]">
                      {r.statusText}
                    </p>

                    <div className="pt-2 border-t border-black/6 dark:border-white/10 flex items-center justify-end gap-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => handleEditOpen(r)}
                        className="py-1.5 px-3 rounded-lg bg-[#F4F6F9] dark:bg-[#17263A] hover:bg-[#E6F8F6] dark:hover:bg-[#12B5A6]/20 text-[#0E1B2C] dark:text-white border border-black/5 dark:border-white/10 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(r)}
                        className="py-1.5 px-3 rounded-lg bg-[#FEECEE] dark:bg-[#E5484D]/20 hover:bg-[#FCD7DA] text-[#E5484D] dark:text-[#FF8080] flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DELETE CONFIRMATION */}
        {itemToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="card-wellness p-6 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 max-w-sm w-full text-center shadow-2xl rounded-3xl">
              <Trash2 className="w-12 h-12 text-[#E5484D] mx-auto mb-2" />
              <h4 className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading">Delete reading?</h4>
              <p className="text-xs font-semibold text-[#7E90A5] dark:text-[#A0B2C6] mt-1">
                This item will be removed permanently from your trend charts.
              </p>
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-3 bg-[#E5484D] hover:bg-[#C93B40] text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="w-full py-2.5 border border-black/20 dark:border-white/20 rounded-xl text-xs font-bold text-[#0E1B2C] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {itemToEdit && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="card-wellness p-6 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 max-w-sm w-full shadow-2xl rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading">Edit Reading</h4>
                <button
                  type="button"
                  onClick={() => setItemToEdit(null)}
                  className="p-1 rounded-full text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {itemToEdit.type === 'bp' && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#7E90A5] dark:text-[#A0B2C6] mb-1">
                      Upper
                    </label>
                    <input
                      type="number"
                      value={editSys}
                      onChange={(e) => setEditSys(e.target.value)}
                      className="w-full h-12 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white text-center font-bold text-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#7E90A5] dark:text-[#A0B2C6] mb-1">
                      Lower
                    </label>
                    <input
                      type="number"
                      value={editDia}
                      onChange={(e) => setEditDia(e.target.value)}
                      className="w-full h-12 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white text-center font-bold text-xl"
                    />
                  </div>
                </div>
              )}

              {itemToEdit.type === 'sugar' && (
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-[#7E90A5] dark:text-[#A0B2C6] mb-1">
                    Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={editSugar}
                    onChange={(e) => setEditSugar(e.target.value)}
                    className="w-full h-12 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white text-center font-bold text-xl"
                  />
                </div>
              )}

              {itemToEdit.type === 'weight' && (
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-[#7E90A5] dark:text-[#A0B2C6] mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="w-full h-12 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#17263A] text-[#0E1B2C] dark:text-white text-center font-bold text-xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleEditSave}
                  disabled={isUpdating}
                  className="w-full py-3 bg-[#12B5A6] hover:bg-[#0EA092] text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setItemToEdit(null)}
                  className="w-full py-2.5 border border-black/20 dark:border-white/20 rounded-xl text-xs font-bold text-[#0E1B2C] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
