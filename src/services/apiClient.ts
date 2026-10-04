import { POPULAR_FOODS } from '../data/foodData';
import {
  Appointment,
  Family,
  FamilyAlert,
  FoodItem,
  HealthStatus,
  Member,
  Medicine,
  Reading,
  User,
  UserRole,
} from '../types';
import { bpStatus, sugarStatus } from '../utils/healthRules';
import {
  generateSeedReadings,
  INITIAL_ALERTS,
  INITIAL_APPOINTMENTS,
  INITIAL_FAMILY,
  INITIAL_MEDICINES,
  INITIAL_MEMBERS,
  INITIAL_USERS,
} from './mockData';

export const KEYS = {
  USERS: 'hn_users_v5',
  FAMILIES: 'hn_families_v5',
  FAMILY: 'hn_family_v5',
  MEMBERS: 'hn_members_v5',
  READINGS: 'hn_readings_v5',
  MEDICINES: 'hn_medicines_v5',
  APPOINTMENTS: 'hn_appointments_v5',
  ALERTS: 'hn_alerts_v5',
  TOKEN: 'hn_jwt_token_v5',
  CURRENT_UID: 'hn_current_uid_v5',
  CHECKLIST: 'hn_checklist_v5',
};

// Seed Local Storage
export function initStore() {
  if (!localStorage.getItem(KEYS.FAMILIES)) {
    localStorage.setItem(KEYS.FAMILIES, JSON.stringify([INITIAL_FAMILY]));
  }
  if (!localStorage.getItem(KEYS.FAMILY)) {
    localStorage.setItem(KEYS.FAMILY, JSON.stringify(INITIAL_FAMILY));
  }
  if (!localStorage.getItem(KEYS.MEMBERS)) {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.READINGS)) {
    localStorage.setItem(KEYS.READINGS, JSON.stringify(generateSeedReadings()));
  }
  if (!localStorage.getItem(KEYS.MEDICINES)) {
    localStorage.setItem(KEYS.MEDICINES, JSON.stringify(INITIAL_MEDICINES));
  }
  if (!localStorage.getItem(KEYS.APPOINTMENTS)) {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
  }
  if (!localStorage.getItem(KEYS.ALERTS)) {
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
  }
  if (!localStorage.getItem(KEYS.CURRENT_UID)) {
    // Default to Rakesh (Manager) for demo
    localStorage.setItem(KEYS.CURRENT_UID, 'u1');
    localStorage.setItem(KEYS.TOKEN, 'jwt_demo_token_rakesh');
  }
}

initStore();

const delay = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(KEYS.CURRENT_UID);
}

export function getCurrentUser(): User | null {
  const uid = getCurrentUserId();
  if (!uid) return null;
  const users = get<User[]>(KEYS.USERS, INITIAL_USERS);
  return users.find((u) => u.id === uid) || null;
}

// ----------------- AUTH SERVICES -----------------

export async function login(email: string, _password?: string): Promise<{ user: User; token: string }> {
  await delay(90);
  const cleanEmail = email.trim().toLowerCase();
  const users = get<User[]>(KEYS.USERS, INITIAL_USERS);
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    throw new Error(
      `No account found for "${email}". For demo, use rakesh@sharma.in or papa@sharma.in, or create a new family.`
    );
  }

  const families = get<Family[]>(KEYS.FAMILIES, [INITIAL_FAMILY]);
  const userFamily = families.find((f) => f.id === user.familyId) || INITIAL_FAMILY;
  set(KEYS.FAMILY, userFamily);

  const token = `jwt_mock_${user.id}_${Date.now()}`;
  localStorage.setItem(KEYS.CURRENT_UID, user.id);
  localStorage.setItem(KEYS.TOKEN, token);
  return { user, token };
}

export async function registerManager(
  name: string,
  email: string,
  _password: string,
  familyName: string
): Promise<{ user: User; family: Family; token: string }> {
  await delay(120);
  const cleanEmail = email.trim().toLowerCase();
  const users = get<User[]>(KEYS.USERS, []);
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('Email is already registered. Please log in.');
  }

  const newFamilyId = `f_${Date.now()}`;
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newUserId = `u_${Date.now()}`;
  const newMemberId = `m_${Date.now()}`;

  const newFamily: Family = {
    id: newFamilyId,
    name: familyName.trim() || `${name.trim()}'s Family`,
    inviteCode,
    managerUid: newUserId,
  };

  const newUser: User = {
    id: newUserId,
    name: name.trim(),
    email: cleanEmail,
    role: 'manager',
    familyId: newFamilyId,
    memberId: newMemberId,
    onboardingCompleted: true,
  };

  const newMember: Member = {
    id: newMemberId,
    familyId: newFamilyId,
    userUid: newUserId,
    name: name.trim(),
    relation: 'Self / Manager',
    gender: 'male',
    conditions: [],
    hasLogin: true,
  };

  // Add initial baseline reading for this new family
  const starterReading: Reading = {
    id: `r_${Date.now()}`,
    memberId: newMemberId,
    familyId: newFamilyId,
    type: 'bp',
    systolic: 120,
    diastolic: 80,
    pulse: 72,
    status: 'green',
    statusText: 'Optimal Blood Pressure',
    note: 'Initial baseline reading recorded on setup',
    takenAt: new Date().toISOString(),
    addedByUid: newUserId,
  };

  // Save new family to collection
  const families = get<Family[]>(KEYS.FAMILIES, [INITIAL_FAMILY]);
  set(KEYS.FAMILIES, [...families, newFamily]);
  set(KEYS.FAMILY, newFamily);

  // Save new user
  set(KEYS.USERS, [...users, newUser]);

  // Save new member
  const members = get<Member[]>(KEYS.MEMBERS, INITIAL_MEMBERS);
  set(KEYS.MEMBERS, [...members, newMember]);

  // Save starter reading
  const readings = get<Reading[]>(KEYS.READINGS, []);
  set(KEYS.READINGS, [starterReading, ...readings]);

  // Set active session
  const token = `jwt_mock_${newUserId}`;
  localStorage.setItem(KEYS.CURRENT_UID, newUserId);
  localStorage.setItem(KEYS.TOKEN, token);

  return { user: newUser, family: newFamily, token };
}

export async function joinFamily(
  name: string,
  email: string,
  _password: string,
  inviteCode: string
): Promise<{ user: User; family: Family; token: string }> {
  await delay(120);
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = inviteCode.trim().toUpperCase();

  const families = get<Family[]>(KEYS.FAMILIES, [INITIAL_FAMILY]);
  const matchedFamily = families.find((f) => f.inviteCode.toUpperCase() === cleanCode);

  if (!matchedFamily) {
    throw new Error('Invalid 6-character invite code. Please check with your family manager.');
  }

  const users = get<User[]>(KEYS.USERS, []);
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('Email already registered. Please log in.');
  }

  const newUserId = `u_${Date.now()}`;
  const newMemberId = `m_${Date.now()}`;

  const newUser: User = {
    id: newUserId,
    name: name.trim(),
    email: cleanEmail,
    role: 'member',
    familyId: matchedFamily.id,
    memberId: newMemberId,
    onboardingCompleted: true,
  };

  const newMember: Member = {
    id: newMemberId,
    familyId: matchedFamily.id,
    userUid: newUserId,
    name: name.trim(),
    relation: 'Family Member',
    gender: 'male',
    conditions: [],
    hasLogin: true,
  };

  set(KEYS.USERS, [...users, newUser]);
  const members = get<Member[]>(KEYS.MEMBERS, INITIAL_MEMBERS);
  set(KEYS.MEMBERS, [...members, newMember]);
  set(KEYS.FAMILY, matchedFamily);

  const token = `jwt_mock_${newUserId}`;
  localStorage.setItem(KEYS.CURRENT_UID, newUserId);
  localStorage.setItem(KEYS.TOKEN, token);

  return { user: newUser, family: matchedFamily, token };
}

export function logoutUser(): void {
  localStorage.removeItem(KEYS.CURRENT_UID);
  localStorage.removeItem(KEYS.TOKEN);
}

export async function getMe(): Promise<User | null> {
  await delay(30);
  return getCurrentUser();
}

export async function updateProfile(updates: Partial<User>): Promise<User> {
  await delay(60);
  const uid = localStorage.getItem(KEYS.CURRENT_UID);
  const users = get<User[]>(KEYS.USERS, INITIAL_USERS);
  const index = users.findIndex((u) => u.id === uid);
  if (index === -1) throw new Error('User not found');

  const updated = { ...users[index], ...updates };
  users[index] = updated;
  set(KEYS.USERS, users);
  return updated;
}

export async function switchDemoUser(role: UserRole): Promise<User> {
  const users = get<User[]>(KEYS.USERS, INITIAL_USERS);
  // Default to Sharma family demo users
  const target =
    role === 'manager'
      ? users.find((u) => u.role === 'manager' && u.familyId === 'f1') ||
        users.find((u) => u.role === 'manager') ||
        users[0]
      : users.find((u) => u.role === 'member' && u.familyId === 'f1') ||
        users.find((u) => u.role === 'member') ||
        users[1];

  const families = get<Family[]>(KEYS.FAMILIES, [INITIAL_FAMILY]);
  const family = families.find((f) => f.id === target.familyId) || INITIAL_FAMILY;
  set(KEYS.FAMILY, family);

  localStorage.setItem(KEYS.CURRENT_UID, target.id);
  localStorage.setItem(KEYS.TOKEN, `jwt_demo_${target.id}`);
  return target;
}

// ----------------- FAMILY SERVICES -----------------

export async function getFamily(familyId?: string): Promise<Family> {
  await delay(40);
  const user = getCurrentUser();
  const targetId = familyId || user?.familyId;
  const families = get<Family[]>(KEYS.FAMILIES, [INITIAL_FAMILY]);
  return families.find((f) => f.id === targetId) || families[0] || INITIAL_FAMILY;
}

export async function regenerateInviteCode(): Promise<Family> {
  await delay(80);
  const user = getCurrentUser();
  const families = get<Family[]>(KEYS.FAMILIES, [INITIAL_FAMILY]);
  const targetId = user?.familyId || 'f1';
  const familyIndex = families.findIndex((f) => f.id === targetId);

  const updatedFamily = familyIndex !== -1 ? { ...families[familyIndex] } : { ...INITIAL_FAMILY };
  updatedFamily.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  if (familyIndex !== -1) {
    families[familyIndex] = updatedFamily;
  } else {
    families.push(updatedFamily);
  }

  set(KEYS.FAMILIES, families);
  set(KEYS.FAMILY, updatedFamily);
  return updatedFamily;
}

export async function getAlerts(): Promise<FamilyAlert[]> {
  await delay(40);
  const user = getCurrentUser();
  const alerts = get<FamilyAlert[]>(KEYS.ALERTS, INITIAL_ALERTS);
  if (!user?.familyId) return alerts;
  return alerts.filter((a) => a.familyId === user.familyId);
}

export async function dismissAlert(id: string): Promise<void> {
  const alerts = get<FamilyAlert[]>(KEYS.ALERTS, []);
  set(KEYS.ALERTS, alerts.filter((a) => a.id !== id));
}

// ----------------- MEMBERS SERVICES -----------------

export async function getMembers(familyId?: string): Promise<Member[]> {
  await delay(50);
  const user = getCurrentUser();
  const targetId = familyId || user?.familyId;
  const members = get<Member[]>(KEYS.MEMBERS, INITIAL_MEMBERS);
  if (!targetId) return members;
  return members.filter((m) => m.familyId === targetId);
}

export async function addMember(data: Omit<Member, 'id' | 'familyId' | 'hasLogin'>): Promise<Member> {
  await delay(80);
  const user = getCurrentUser();
  const familyId = user?.familyId || 'f1';
  const members = get<Member[]>(KEYS.MEMBERS, INITIAL_MEMBERS);

  const newMember: Member = {
    ...data,
    id: `m_${Date.now()}`,
    familyId,
    hasLogin: false,
  };

  const updated = [...members, newMember];
  set(KEYS.MEMBERS, updated);
  return newMember;
}

export async function updateMember(id: string, updates: Partial<Member>): Promise<Member> {
  await delay(80);
  const members = get<Member[]>(KEYS.MEMBERS, INITIAL_MEMBERS);
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) throw new Error('Member not found');

  const updated = { ...members[index], ...updates };
  members[index] = updated;
  set(KEYS.MEMBERS, members);
  return updated;
}

export async function deleteMember(id: string): Promise<void> {
  await delay(80);
  const members = get<Member[]>(KEYS.MEMBERS, []);
  set(KEYS.MEMBERS, members.filter((m) => m.id !== id));
}

export async function createMemberLogin(
  memberId: string,
  email: string,
  _password?: string
): Promise<User> {
  await delay(100);
  const cleanEmail = email.trim().toLowerCase();
  const users = get<User[]>(KEYS.USERS, []);
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('This email is already in use by another account');
  }

  const members = get<Member[]>(KEYS.MEMBERS, []);
  const member = members.find((m) => m.id === memberId);
  if (!member) throw new Error('Member not found');

  const newUserId = `u_${Date.now()}`;
  const newUser: User = {
    id: newUserId,
    name: member.name,
    email: cleanEmail,
    role: 'member',
    familyId: member.familyId,
    memberId: member.id,
    onboardingCompleted: true,
  };

  set(KEYS.USERS, [...users, newUser]);
  await updateMember(memberId, { hasLogin: true, userUid: newUserId });
  return newUser;
}

export async function resetMemberPassword(memberId: string, _newPass?: string): Promise<void> {
  await delay(60);
}

// ----------------- READINGS SERVICES -----------------

export async function getReadings(params?: {
  memberId?: string;
  familyId?: string;
  type?: 'bp' | 'sugar' | 'weight' | 'pulse';
  days?: number;
}): Promise<Reading[]> {
  await delay(60);
  const user = getCurrentUser();
  const targetFamilyId = params?.familyId || user?.familyId;
  let readings = get<Reading[]>(KEYS.READINGS, []);

  // Isolate by family
  if (targetFamilyId) {
    readings = readings.filter((r) => r.familyId === targetFamilyId);
  }

  if (params?.memberId) {
    readings = readings.filter((r) => r.memberId === params.memberId);
  }
  if (params?.type) {
    readings = readings.filter((r) => r.type === params.type);
  }
  if (params?.days) {
    const cutoff = Date.now() - params.days * 24 * 60 * 60 * 1000;
    readings = readings.filter((r) => new Date(r.takenAt).getTime() >= cutoff);
  }

  return readings.sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
}

export async function addReading(data: Omit<Reading, 'id' | 'status' | 'statusText'>): Promise<Reading> {
  await delay(80);
  const user = getCurrentUser();
  const readings = get<Reading[]>(KEYS.READINGS, []);

  let status: HealthStatus = 'green';
  let statusText = 'Normal';

  if (data.type === 'bp' && data.systolic && data.diastolic) {
    const ev = bpStatus(data.systolic, data.diastolic);
    status = ev.status;
    statusText = ev.text;
  } else if (data.type === 'sugar' && data.sugar) {
    const ev = sugarStatus(data.sugar, data.sugarContext);
    status = ev.status;
    statusText = ev.text;
  } else if (data.type === 'weight' && data.weightKg) {
    status = 'green';
    statusText = 'Weight recorded';
  } else if (data.type === 'pulse' && data.pulse) {
    status = data.pulse >= 50 && data.pulse <= 100 ? 'green' : 'amber';
    statusText = status === 'green' ? 'Resting heart rate healthy' : 'Resting pulse irregular';
  }

  const newReading: Reading = {
    ...data,
    familyId: data.familyId || user?.familyId || 'f1',
    id: `r_${Date.now()}`,
    status,
    statusText,
    takenAt: data.takenAt || new Date().toISOString(),
    addedByUid: user?.id,
  };

  const updated = [newReading, ...readings];
  set(KEYS.READINGS, updated);

  // If reading is amber or red, record alert
  if (status === 'amber' || status === 'red') {
    const members = get<Member[]>(KEYS.MEMBERS, INITIAL_MEMBERS);
    const m = members.find((x) => x.id === data.memberId);
    const memberName = m?.name || 'Member';
    const alerts = get<FamilyAlert[]>(KEYS.ALERTS, []);
    const newAlert: FamilyAlert = {
      id: `al_${Date.now()}`,
      familyId: newReading.familyId,
      memberId: data.memberId,
      memberName,
      type: data.type,
      status,
      valueText:
        data.type === 'bp'
          ? `${data.systolic}/${data.diastolic} mmHg`
          : data.type === 'sugar'
          ? `${data.sugar} mg/dL`
          : `${data.weightKg} kg`,
      message: `${memberName}'s ${data.type.toUpperCase()} reading is in ${status.toUpperCase()} range (${statusText})`,
      createdAt: new Date().toISOString(),
    };
    set(KEYS.ALERTS, [newAlert, ...alerts]);
  }

  return newReading;
}

export async function updateReading(id: string, updates: Partial<Reading>): Promise<Reading> {
  await delay(80);
  const readings = get<Reading[]>(KEYS.READINGS, []);
  const index = readings.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Reading not found');

  let status = updates.status || readings[index].status;
  let statusText = updates.statusText || readings[index].statusText;

  if (updates.type === 'bp' && updates.systolic && updates.diastolic) {
    const ev = bpStatus(updates.systolic, updates.diastolic);
    status = ev.status;
    statusText = ev.text;
  } else if (updates.type === 'sugar' && updates.sugar) {
    const ev = sugarStatus(updates.sugar, updates.sugarContext);
    status = ev.status;
    statusText = ev.text;
  }

  const updated: Reading = {
    ...readings[index],
    ...updates,
    status,
    statusText,
  };

  readings[index] = updated;
  set(KEYS.READINGS, readings);
  return updated;
}

export async function deleteReading(id: string): Promise<void> {
  await delay(80);
  const readings = get<Reading[]>(KEYS.READINGS, []);
  set(KEYS.READINGS, readings.filter((r) => r.id !== id));
}

// ----------------- MEDICINES SERVICES -----------------

export async function getMedicines(memberId?: string): Promise<Medicine[]> {
  await delay(40);
  const user = getCurrentUser();
  let meds = get<Medicine[]>(KEYS.MEDICINES, INITIAL_MEDICINES);
  if (user?.familyId) {
    meds = meds.filter((m) => m.familyId === user.familyId);
  }
  if (memberId) {
    meds = meds.filter((m) => m.memberId === memberId);
  }
  return meds;
}

export async function toggleMedicineTaken(id: string, taken?: boolean): Promise<Medicine> {
  const meds = get<Medicine[]>(KEYS.MEDICINES, []);
  const index = meds.findIndex((m) => m.id === id);
  if (index === -1) throw new Error('Medicine not found');

  const current = meds[index].takenToday || false;
  const newTaken = taken !== undefined ? taken : !current;
  const updated = { ...meds[index], takenToday: newTaken };
  meds[index] = updated;
  set(KEYS.MEDICINES, meds);
  return updated;
}

export async function addMedicine(data: Omit<Medicine, 'id'>): Promise<Medicine> {
  await delay(80);
  const user = getCurrentUser();
  const meds = get<Medicine[]>(KEYS.MEDICINES, []);
  const newMed: Medicine = {
    ...data,
    familyId: data.familyId || user?.familyId || 'f1',
    id: `med_${Date.now()}`,
  };
  set(KEYS.MEDICINES, [...meds, newMed]);
  return newMed;
}

export async function deleteMedicine(id: string): Promise<void> {
  await delay(60);
  const meds = get<Medicine[]>(KEYS.MEDICINES, []);
  set(KEYS.MEDICINES, meds.filter((m) => m.id !== id));
}

// ----------------- APPOINTMENTS SERVICES -----------------

export async function getAppointments(memberId?: string): Promise<Appointment[]> {
  await delay(40);
  const user = getCurrentUser();
  let apps = get<Appointment[]>(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  if (user?.familyId) {
    apps = apps.filter((a) => a.familyId === user.familyId);
  }
  if (memberId) {
    apps = apps.filter((a) => a.memberId === memberId);
  }
  return apps;
}

export async function addAppointment(data: Omit<Appointment, 'id'>): Promise<Appointment> {
  await delay(80);
  const user = getCurrentUser();
  const apps = get<Appointment[]>(KEYS.APPOINTMENTS, []);
  const newApp: Appointment = {
    ...data,
    familyId: data.familyId || user?.familyId || 'f1',
    id: `app_${Date.now()}`,
  };
  set(KEYS.APPOINTMENTS, [...apps, newApp]);
  return newApp;
}

export async function deleteAppointment(id: string): Promise<void> {
  await delay(60);
  const apps = get<Appointment[]>(KEYS.APPOINTMENTS, []);
  set(KEYS.APPOINTMENTS, apps.filter((a) => a.id !== id));
}

// ----------------- FOOD SEARCH (Offline Indian DB) -----------------

export async function searchFoods(query: string): Promise<FoodItem[]> {
  await delay(40);
  const q = query.trim().toLowerCase();
  if (!q) return POPULAR_FOODS.slice(0, 10);

  return POPULAR_FOODS.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      (item.nameHi && item.nameHi.includes(q)) ||
      item.category.toLowerCase().includes(q) ||
      item.note.toLowerCase().includes(q)
  );
}

// ----------------- SUMMARY SERVICES -----------------

export async function getWeeklySummary(
  memberName: string,
  readings: Reading[]
): Promise<{ lines: string[]; linesHi: string[]; textEn: string; textHi: string }> {
  await delay(60);
  const redCount = readings.filter((r) => r.status === 'red').length;
  const amberCount = readings.filter((r) => r.status === 'amber').length;

  if (redCount > 0) {
    const lines = [
      `${memberName}'s vitals show ${redCount} elevated reading(s) this past week.`,
      `Blood pressure and sugar levels have fluctuated outside normal ranges.`,
      `Please schedule a routine review with their consulting physician.`,
    ];
    const linesHi = [
      `इस सप्ताह ${memberName} के कुछ स्वास्थ्य माप सामान्य सीमा से अधिक रहे।`,
      `रक्तचाप और शुगर में सामान्य से अधिक उतार-चढ़ाव देखा गया है।`,
      `कृपया अपने डॉक्टर से मिलकर एक बार जांच अवश्य करवाएं।`,
    ];
    return { lines, linesHi, textEn: lines.join(' '), textHi: linesHi.join(' ') };
  }

  if (amberCount > 0) {
    const lines = [
      `${memberName}'s health has been mostly steady with minor borderline readings.`,
      `Daily 20-minute morning walks and light low-sodium meals will help maintain stability.`,
      `Continue tracking twice daily after morning routine.`,
    ];
    const linesHi = [
      `${memberName} का स्वास्थ्य ज्यादातर स्थिर रहा है, कुछ माप सीमा पर रहे।`,
      `रोजाना 20 मिनट की सुबह की सैर और हल्का खान-पान स्थिरता बनाए रखने में मदद करेगा।`,
      `रोजाना सुबह नाश्ते के बाद नियमित जांच जारी रखें।`,
    ];
    return { lines, linesHi, textEn: lines.join(' '), textHi: linesHi.join(' ') };
  }

  const lines = [
    `${memberName} has maintained excellent vital stability throughout the week.`,
    `Blood pressure and blood sugar readings are consistently within the healthy green zone.`,
    `Great job keeping up with healthy daily family habits!`,
  ];
  const linesHi = [
    `इस पूरे सप्ताह ${memberName} के सभी स्वास्थ्य माप सामान्य और स्थिर रहे हैं।`,
    `रक्तचाप और ब्लड शुगर दोनों सुरक्षित हरे दायरे में बने हुए हैं।`,
    `बहुत बढ़िया! इसी तरह अपनी सेहत का ध्यान रखते रहें।`,
  ];
  return { lines, linesHi, textEn: lines.join(' '), textHi: linesHi.join(' ') };
}

// ----------------- CHECKLIST SERVICES -----------------

export interface ChecklistItem {
  id: string;
  title: string;
  titleHi: string;
  text?: string;
  textHi?: string;
  time: string;
  completed: boolean;
  category: 'sugar' | 'bp' | 'walk' | 'water';
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', title: 'Morning Blood Pressure check', titleHi: 'सुबह का रक्तचाप माप', text: 'Morning Blood Pressure check', textHi: 'सुबह का रक्तचाप माप', time: '08:00 AM', completed: true, category: 'bp' },
  { id: 'c2', title: 'Fasting Blood Sugar test', titleHi: 'खाली पेट ब्लड शुगर जांच', text: 'Fasting Blood Sugar test', textHi: 'खाली पेट ब्लड शुगर जांच', time: '08:30 AM', completed: true, category: 'sugar' },
  { id: 'c3', title: 'Drink 8 glasses of clean water', titleHi: 'दिनभर में 8 गिलास पानी पिएं', text: 'Drink 8 glasses of clean water', textHi: 'दिनभर में 8 गिलास पानी पिएं', time: 'All day', completed: false, category: 'water' },
  { id: 'c4', title: 'Evening 20-min gentle walk', titleHi: 'शाम की 20 मिनट की सैर', text: 'Evening 20-min gentle walk', textHi: 'शाम की 20 मिनट की सैर', time: '06:00 PM', completed: false, category: 'walk' },
];

export function getTodayChecklist(): ChecklistItem[] {
  return get<ChecklistItem[]>(KEYS.CHECKLIST, DEFAULT_CHECKLIST);
}

export function toggleChecklistItem(id: string): ChecklistItem[] {
  const items = getTodayChecklist();
  const updated = items.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it));
  set(KEYS.CHECKLIST, updated);
  return updated;
}

// ----------------- CHECKLIST SERVICES -----------------

export interface DailyChecklistState {
  bpTaken: boolean;
  sugarTaken: boolean;
  walkDone: boolean;
  waterDone: boolean;
  medsDone: boolean;
}

export async function getDailyChecklist(memberId: string): Promise<DailyChecklistState> {
  const all = get<Record<string, DailyChecklistState>>(KEYS.CHECKLIST, {});
  const todayKey = `${memberId}_${new Date().toISOString().slice(0, 10)}`;
  return (
    all[todayKey] || {
      bpTaken: false,
      sugarTaken: false,
      walkDone: false,
      waterDone: false,
      medsDone: false,
    }
  );
}

export async function updateDailyChecklist(
  memberId: string,
  state: Partial<DailyChecklistState>
): Promise<DailyChecklistState> {
  const all = get<Record<string, DailyChecklistState>>(KEYS.CHECKLIST, {});
  const todayKey = `${memberId}_${new Date().toISOString().slice(0, 10)}`;
  const current = all[todayKey] || {
    bpTaken: false,
    sugarTaken: false,
    walkDone: false,
    waterDone: false,
    medsDone: false,
  };

  const updated = { ...current, ...state };
  all[todayKey] = updated;
  set(KEYS.CHECKLIST, all);
  return updated;
}
