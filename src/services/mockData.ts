import { Appointment, Family, FamilyAlert, Member, Medicine, Reading, User } from '../types';
import { bpStatus, sugarStatus } from '../utils/healthRules';

export const INITIAL_FAMILY: Family = {
  id: 'f1',
  name: 'Sharma Family',
  inviteCode: 'K7P3QX',
  managerUid: 'u1',
};

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    familyId: 'f1',
    userUid: 'u1',
    name: 'Rakesh',
    relation: 'Self / Son',
    gender: 'male',
    dob: '1988-06-15',
    heightCm: 174,
    conditions: [],
    goals: ['Keep BP stable', 'Daily 8000 steps'],
    emergencyContact: {
      name: 'Rakesh Sharma',
      phone: '+91 98765 43210',
      relation: 'Self',
    },
    notes: 'Takes morning runs. Family manager.',
    hasLogin: true,
  },
  {
    id: 'm2',
    familyId: 'f1',
    userUid: 'u2',
    name: 'Papa (Devender)',
    relation: 'Father',
    gender: 'male',
    dob: '1958-04-12',
    heightCm: 168,
    conditions: ['Diabetes', 'High BP'],
    goals: ['Control fasting sugar', 'Lower salt', 'Walk 20 mins'],
    emergencyContact: {
      name: 'Rakesh (Son)',
      phone: '+91 98765 43210',
      relation: 'Son',
    },
    notes: 'Telmisartan 40mg after breakfast. Metformin 500mg with dinner.',
    hasLogin: true,
  },
  {
    id: 'm3',
    familyId: 'f1',
    name: 'Mummy (Shanti)',
    relation: 'Mother',
    gender: 'female',
    dob: '1962-11-20',
    heightCm: 155,
    conditions: ['Thyroid'],
    goals: ['Keep weight stable', 'Morning yoga'],
    emergencyContact: {
      name: 'Rakesh (Son)',
      phone: '+91 98765 43210',
      relation: 'Son',
    },
    notes: 'Thyronorm 50mcg first thing in morning with warm water.',
    hasLogin: false,
  },
  {
    id: 'm4',
    familyId: 'f1',
    userUid: 'u4',
    name: 'Ananya',
    relation: 'Daughter',
    gender: 'female',
    dob: '2004-09-08',
    heightCm: 162,
    conditions: [],
    goals: ['Maintain fitness', 'Hydration'],
    emergencyContact: {
      name: 'Rakesh (Brother/Father)',
      phone: '+91 98765 43210',
      relation: 'Family',
    },
    notes: 'College student. Tracks routine wellness.',
    hasLogin: true,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Rakesh Sharma',
    email: 'rakesh@sharma.in',
    role: 'manager',
    familyId: 'f1',
    memberId: 'm1',
    onboardingCompleted: true,
  },
  {
    id: 'u2',
    name: 'Devender Sharma (Papa)',
    email: 'papa@sharma.in',
    role: 'member',
    familyId: 'f1',
    memberId: 'm2',
    onboardingCompleted: true,
  },
  {
    id: 'u4',
    name: 'Ananya Sharma',
    email: 'ananya@sharma.in',
    role: 'member',
    familyId: 'f1',
    memberId: 'm4',
    onboardingCompleted: true,
  },
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med1',
    familyId: 'f1',
    memberId: 'm2',
    name: 'Telmisartan',
    dose: '40 mg',
    times: ['08:30 AM'],
    days: ['Daily'],
    instructions: 'After breakfast with water',
    condition: 'Hypertension',
  },
  {
    id: 'med2',
    familyId: 'f1',
    memberId: 'm2',
    name: 'Metformin SR',
    dose: '500 mg',
    times: ['08:30 PM'],
    days: ['Daily'],
    instructions: 'With evening dinner',
    condition: 'Type 2 Diabetes',
  },
  {
    id: 'med3',
    familyId: 'f1',
    memberId: 'm3',
    name: 'Thyronorm',
    dose: '50 mcg',
    times: ['07:00 AM'],
    days: ['Daily'],
    instructions: 'Empty stomach with lukewarm water',
    condition: 'Hypothyroidism',
  },
  {
    id: 'med4',
    familyId: 'f1',
    memberId: 'm1',
    name: 'Vitamin D3 & Calcium',
    dose: '60,000 IU',
    times: ['09:00 AM'],
    days: ['Sunday'],
    instructions: 'Once weekly with milk after breakfast',
    condition: 'Bone & Joint Health',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app1',
    familyId: 'f1',
    memberId: 'm2',
    doctorName: 'Dr. Alok Verma',
    specialty: 'Cardiologist',
    clinic: 'Max Super Speciality Hospital, Saket',
    date: '2026-10-18',
    time: '11:30 AM',
    notes: 'Bring last 30 days BP and ECG report.',
  },
  {
    id: 'app2',
    familyId: 'f1',
    memberId: 'm3',
    doctorName: 'Dr. Meena Kapoor',
    specialty: 'Endocrinologist',
    clinic: 'Fortis Health Care',
    date: '2026-10-25',
    time: '04:00 PM',
    notes: 'Thyroid profile blood test report required.',
  },
];

export const INITIAL_ALERTS: FamilyAlert[] = [
  {
    id: 'alt1',
    familyId: 'f1',
    memberId: 'm2',
    memberName: 'Papa',
    type: 'sugar',
    status: 'amber',
    valueText: '168 mg/dL',
    message: "Papa's sugar was 168 mg/dL after festival dinner.",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Generate 30 days of realistic history for all family members
export function generateSeedReadings(): Reading[] {
  const readings: Reading[] = [];
  const now = new Date();

  // Helper for dates
  const getDate = (daysAgo: number, hours = 8, mins = 0) => {
    const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    d.setHours(hours, mins, 0, 0);
    return d.toISOString();
  };

  // 1. Rakesh (m1 - Self / Manager)
  for (let i = 0; i < 14; i++) {
    const sys = 118 + Math.floor(Math.sin(i * 0.8) * 6);
    const dia = 76 + Math.floor(Math.cos(i * 0.8) * 4);
    const pulse = 70 + (i % 3) * 2;
    const bpEval = bpStatus(sys, dia);
    readings.push({
      id: `r_bp_r_${i}`,
      memberId: 'm1',
      familyId: 'f1',
      type: 'bp',
      systolic: sys,
      diastolic: dia,
      pulse,
      status: bpEval.status,
      statusText: bpEval.text,
      takenAt: getDate(i, 7, 15),
      addedByUid: 'u1',
    });

    if (i % 2 === 0) {
      const sugarVal = 92 + (i % 4) * 3;
      const sugarEval = sugarStatus(sugarVal, 'fasting');
      readings.push({
        id: `r_s_r_${i}`,
        memberId: 'm1',
        familyId: 'f1',
        type: 'sugar',
        sugar: sugarVal,
        sugarContext: 'fasting',
        status: sugarEval.status,
        statusText: sugarEval.text,
        takenAt: getDate(i, 8, 0),
        addedByUid: 'u1',
      });
    }

    if (i % 3 === 0) {
      readings.push({
        id: `r_w_r_${i}`,
        memberId: 'm1',
        familyId: 'f1',
        type: 'weight',
        weightKg: +(72.2 - i * 0.05).toFixed(1),
        status: 'green',
        statusText: 'Healthy body mass index',
        takenAt: getDate(i, 7, 0),
        addedByUid: 'u1',
      });
    }
  }

  // 2. Papa (m2 - Father)
  for (let i = 0; i <= 30; i++) {
    const sys = 126 + Math.floor(Math.sin(i * 0.7) * 11) + (i === 1 ? 16 : 0);
    const dia = 82 + Math.floor(Math.cos(i * 0.7) * 6) + (i === 1 ? 9 : 0);
    const pulseVal = 72 + (i % 4) * 2;
    const bpEval = bpStatus(sys, dia);

    readings.push({
      id: `r_bp_p_${i}`,
      memberId: 'm2',
      familyId: 'f1',
      type: 'bp',
      systolic: sys,
      diastolic: dia,
      pulse: pulseVal,
      status: bpEval.status,
      statusText: bpEval.text,
      note: i === 0 ? 'Felt energetic after morning walk' : '',
      takenAt: getDate(i, 7, 30),
      addedByUid: 'u2',
    });

    // Fasting Sugar
    if (i % 2 === 0) {
      const sugarVal = 108 + Math.floor(Math.sin(i * 0.5) * 16) + (i === 2 ? 22 : 0);
      const sugarEval = sugarStatus(sugarVal, 'fasting');
      readings.push({
        id: `r_s_p_${i}`,
        memberId: 'm2',
        familyId: 'f1',
        type: 'sugar',
        sugar: sugarVal,
        sugarContext: 'fasting',
        status: sugarEval.status,
        statusText: sugarEval.text,
        note: 'Fasting 10 hours',
        takenAt: getDate(i, 8, 15),
        addedByUid: 'u2',
      });
    }

    // Weekly weight
    if (i % 5 === 0) {
      readings.push({
        id: `r_w_p_${i}`,
        memberId: 'm2',
        familyId: 'f1',
        type: 'weight',
        weightKg: +(73.8 - (i * 0.08)).toFixed(1),
        status: 'amber',
        statusText: 'Slightly overweight. Keep up regular walks.',
        takenAt: getDate(i, 7, 45),
        addedByUid: 'u1',
      });
    }
  }

  // 3. Mummy (m3 - Mother)
  for (let i = 0; i <= 20; i++) {
    if (i % 2 === 0) {
      const mSys = 118 + Math.floor(Math.sin(i * 0.6) * 6);
      const mDia = 76 + Math.floor(Math.cos(i * 0.6) * 4);
      const mEval = bpStatus(mSys, mDia);
      readings.push({
        id: `r_bp_m_${i}`,
        memberId: 'm3',
        familyId: 'f1',
        type: 'bp',
        systolic: mSys,
        diastolic: mDia,
        pulse: 74,
        status: mEval.status,
        statusText: mEval.text,
        takenAt: getDate(i, 9, 0),
        addedByUid: 'u1',
      });
    }

    if (i % 4 === 0) {
      const sugarVal = 102 + (i % 3) * 4;
      const sugarEval = sugarStatus(sugarVal, 'fasting');
      readings.push({
        id: `r_s_m_${i}`,
        memberId: 'm3',
        familyId: 'f1',
        type: 'sugar',
        sugar: sugarVal,
        sugarContext: 'fasting',
        status: sugarEval.status,
        statusText: sugarEval.text,
        takenAt: getDate(i, 8, 30),
        addedByUid: 'u1',
      });
    }
  }

  return readings.sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
}
