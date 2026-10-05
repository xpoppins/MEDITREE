import {
  Clock,
  FileText,
  Heart,
  Pill,
  Plus,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import * as api from '../services/apiClient';
import { Medicine } from '../types';

interface MedicinesScheduleProps {
  medicines: Medicine[];
  onRefresh: () => void;
  memberId?: string;
  onOpenAddMedicine?: (memberId?: string) => void;
  onExportPrescription?: (memberId?: string) => void;
}

export const MedicinesSchedule: React.FC<MedicinesScheduleProps> = ({
  medicines,
  onRefresh,
  memberId,
  onOpenAddMedicine,
  onExportPrescription,
}) => {
  const { language } = usePreferences();
  const { family, user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMedicine(id);
      onRefresh();
    } catch (e) {
      console.error('Failed to delete medicine:', e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddClick = () => {
    if (onOpenAddMedicine) {
      onOpenAddMedicine(memberId);
    }
  };

  return (
    <div className="card-wellness p-5 bg-white dark:bg-[#0E1B2C] border border-black/10 dark:border-white/10 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/8 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-[#0E1B2C] dark:text-black font-heading">
                {language === 'hi' ? 'दवाइयों की सूची' : 'Current Prescriptions'}
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6]">
                {medicines.length} {medicines.length === 1 ? 'active' : 'active'}
              </span>
            </div>
            <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
              {language === 'hi'
                ? 'निर्धारित दवाइयां, खुराक, समय और सावधानियां'
                : 'Prescribed medicines, dosages, schedules & instructions'}
            </p>
          </div>
        </div>

        {/* Featured Actions Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          {onExportPrescription && (
            <button
              type="button"
              onClick={() => onExportPrescription(memberId)}
              className="px-3 py-2 rounded-xl bg-[#E6F8F6] hover:bg-[#d5f3f0] dark:bg-[#12B5A6]/20 dark:hover:bg-[#12B5A6]/30 text-[#12B5A6] border border-[#12B5A6]/30 text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="Export official doctor prescription"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Rx</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddClick}
            className="px-3.5 py-2 rounded-xl bg-[#0E1B2C] hover:bg-[#1a2d47] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#0E1B2C] text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#12B5A6]" />
            <span>{language === 'hi' ? '+ नई दवाई' : '+ Add Medicine'}</span>
          </button>
        </div>
      </div>

      {/* Medicines List: Pure Medical Viewer (No Taken/Untaken toggles) */}
      <div className="space-y-2.5">
        {medicines.length === 0 ? (
          <div className="text-center p-6 sm:p-8 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 text-xs font-bold text-[#7E90A5]">
            <Pill className="w-8 h-8 text-[#12B5A6] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-black text-[#0E1B2C] dark:text-white mb-1">
              No medications added yet.
            </p>
            <p className="max-w-xs mx-auto mb-3">
              Add your daily prescriptions to see complete dosage, usage timing, and export doctor reports.
            </p>
            <button
              type="button"
              onClick={handleAddClick}
              className="px-4 py-2 rounded-xl bg-[#12B5A6] text-white font-black text-xs inline-flex items-center gap-1.5 hover:bg-[#0EA092] active:scale-95 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add First Medicine</span>
            </button>
          </div>
        ) : (
          medicines.map((med) => (
            <div
              key={med.id}
              className="p-4 rounded-2xl border border-black/8 dark:border-white/10 bg-[#F9FBFC] dark:bg-[#142234] hover:border-[#12B5A6]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base sm:text-lg font-black text-[#0E1B2C] dark:text-white">
                    {med.name}
                  </h4>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 text-[#FF6B4A] dark:text-[#FF8A65] font-mono">
                    {med.dose}
                  </span>
                  {med.condition && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E6F8F6] dark:bg-[#12B5A6]/20 text-[#12B5A6] border border-[#12B5A6]/20">
                      🩺 {med.condition}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#7E90A5] mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 text-[#0E1B2C] dark:text-white font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#12B5A6]" />
                    <span>{med.times.join(', ')}</span>
                  </span>
                  <span>•</span>
                  <span>{med.instructions || 'Take with water'}</span>
                </div>
              </div>

              {/* Action Buttons: Remove Medicine */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {deletingId === med.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(med.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#E5484D] text-white text-[11px] font-black cursor-pointer hover:bg-[#c93b40]"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(null)}
                      className="px-2 py-1 rounded-lg bg-black/10 dark:bg-white/10 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeletingId(med.id)}
                    className="p-2 rounded-xl text-[#7E90A5] hover:text-[#E5484D] hover:bg-[#FEECEE] dark:hover:bg-[#E5484D]/15 transition-colors cursor-pointer"
                    title="Remove from current medicines"
                    aria-label={`Remove ${med.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
