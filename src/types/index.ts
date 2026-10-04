export type UserRole = 'manager' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  familyId: string;
  memberId: string;
  avatarUrl?: string;
  onboardingCompleted?: boolean;
}

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  managerUid?: string;
}

export interface Member {
  id: string;
  familyId: string;
  userUid?: string;
  userId?: string;
  name: string;
  relation: string;
  gender: 'male' | 'female' | 'other';
  dob?: string;
  heightCm?: number;
  conditions: string[];
  goals?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  hasLogin: boolean;
  notes?: string;
  avatarUrl?: string;
}

export type ReadingType = 'bp' | 'sugar' | 'weight' | 'pulse';
export type SugarContext = 'fasting' | 'after_meal' | 'random';
export type HealthStatus = 'green' | 'amber' | 'yellow' | 'red';

export interface Reading {
  id: string;
  memberId: string;
  familyId: string;
  type: ReadingType;
  // BP
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  // Sugar
  sugar?: number;
  sugarContext?: SugarContext;
  // Weight
  weightKg?: number;
  // Status
  status: HealthStatus;
  statusText: string;
  note?: string;
  takenAt: string; // ISO string
  addedByUid?: string;
  addedBy?: string;
}

export interface MedicineSalt {
  name: string;
  amount: string;
}

export interface MedicineComposition {
  salts: MedicineSalt[];
}

export interface Medicine {
  id: string;
  familyId: string;
  memberId: string;
  name: string;
  dose: string;
  times: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  days: string[]; // e.g. ["Daily"] or ["Mon", "Wed", "Fri"]
  instructions?: string; // e.g. "After breakfast"
  condition?: string; // e.g. "Hypertension (BP)", "Type-2 Diabetes"
  use?: string; // primary clinical use
  usageTiming?: string; // when and how to take
  precautions?: string[]; // warning points
  genericName?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  composition?: MedicineComposition;
  prescriptionRequired?: boolean;
  prescribedBy?: string;
  takenToday?: boolean;
}

export interface MedicineInfo {
  id?: string;
  name: string;
  brandName?: string;
  genericName?: string;
  dosageForm?: string; // e.g. Tablet, Capsule, Syrup, Inhaler
  strength?: string; // e.g. 650mg, 500mg + 125mg
  manufacturer?: string;
  composition?: MedicineComposition;
  aliases?: string[]; // Brand names & synonyms (e.g. Telma, Glycomet, Pan-D, Dolo)
  category?: string;
  conditions: string[]; // which conditions it is used for
  primaryUses?: string[]; // specific clinical uses
  use: string; // primary use and how it works
  standardDosage: string; // dosage guidance
  usageTiming: string; // when and how to take
  precautions: string[]; // warnings and precautions
  sideEffects?: string[]; // common side effects
  storageConditions?: string;
  prescriptionRequired?: boolean;
  searchKeywords?: string[];
  source?: 'database' | 'ai' | 'fda';
}

export interface Appointment {
  id: string;
  familyId: string;
  memberId: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string;
  time: string;
  notes?: string;
}

export interface FamilyAlert {
  id: string;
  familyId: string;
  memberId: string;
  memberName: string;
  type: ReadingType;
  status: 'red' | 'amber';
  valueText: string;
  message: string;
  createdAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  nameHi?: string;
  category: string;
  status: HealthStatus;
  portionAdvice: string;
  portionAdviceHi: string;
  note: string;
  noteHi: string;
  gi?: 'low' | 'medium' | 'high';
}

export interface HealthScoreDetails {
  score: number;
  category: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  explanation: string;
  streakDays: number;
  redCount: number;
  amberCount: number;
  greenCount: number;
}
