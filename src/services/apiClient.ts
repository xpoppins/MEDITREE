const API_URL = import.meta.env.VITE_API_URL || '/api';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('hn_jwt_token_v5');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export async function login(email: string, password: string) {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function registerManager(name: string, email: string, password: string, familyName: string) {
  return apiFetch('/auth/register-manager', { method: 'POST', body: JSON.stringify({ name, email, password, familyName }) });
}

export async function joinFamily(name: string, email: string, password: string, inviteCode: string) {
  return apiFetch('/auth/join', { method: 'POST', body: JSON.stringify({ name, email, password, inviteCode }) });
}

export async function googleLogin(email: string, name: string, googleId: string) {
  return apiFetch('/auth/google-login', { method: 'POST', body: JSON.stringify({ email, name, googleId }) });
}

export async function getMe() {
  return apiFetch('/auth/me');
}

export async function getFamily() {
  return apiFetch('/family');
}

export async function regenerateInviteCode() {
  return apiFetch('/family/regenerate-code', { method: 'POST' });
}

export async function getMembers() {
  return apiFetch('/family/members');
}

export async function addMember(data: any) {
  return apiFetch('/family/members', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateMember(id: string, data: any) {
  return apiFetch(`/family/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteMember(id: string) {
  return apiFetch(`/family/members/${id}`, { method: 'DELETE' });
}

export async function createMemberLogin(memberId: string, email: string, password: string) {
  return apiFetch(`/family/members/${memberId}/create-login`, { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function resetPassword(memberId: string, password: string) {
  return apiFetch(`/family/members/${memberId}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) });
}

export async function getAlerts() {
  return apiFetch('/family/alerts');
}

export async function dismissAlert(id: string) {
  return apiFetch(`/family/alerts/${id}`, { method: 'DELETE' });
}

export async function addReading(data: any) {
  return apiFetch('/readings', { method: 'POST', body: JSON.stringify(data) });
}

export async function getReadings(params?: { memberId?: string; type?: string; days?: number }) {
  const query = new URLSearchParams();
  if (params?.memberId) query.set('memberId', params.memberId);
  if (params?.type) query.set('type', params.type);
  if (params?.days) query.set('days', String(params.days));
  return apiFetch(`/readings?${query.toString()}`);
}

export async function updateReading(id: string, data: any) {
  return apiFetch(`/readings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteReading(id: string) {
  return apiFetch(`/readings/${id}`, { method: 'DELETE' });
}

export async function getMedicines(memberId?: string) {
  const query = memberId ? `?memberId=${memberId}` : '';
  return apiFetch(`/medicines${query}`);
}

export async function addMedicine(data: any) {
  return apiFetch('/medicines', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateMedicine(id: string, data: any) {
  return apiFetch(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteMedicine(id: string) {
  return apiFetch(`/medicines/${id}`, { method: 'DELETE' });
}

export async function toggleMedicineTaken(id: string) {
  return apiFetch(`/medicines/${id}/toggle`, { method: 'PATCH' });
}

export async function getAppointments(memberId?: string) {
  const query = memberId ? `?memberId=${memberId}` : '';
  return apiFetch(`/appointments${query}`);
}

export async function addAppointment(data: any) {
  return apiFetch('/appointments', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteAppointment(id: string) {
  return apiFetch(`/appointments/${id}`, { method: 'DELETE' });
}

export async function updateProfile(data: any) {
  return apiFetch('/auth/me', { method: 'PUT', body: JSON.stringify(data) });
}

export async function switchDemoUser(role: 'manager' | 'member') {
  return apiFetch('/auth/switch-demo', { method: 'POST', body: JSON.stringify({ role }) });
}

export async function getWeeklySummary(memberName: string, readings: any[]) {
  const redCount = readings.filter((r: any) => r.status === 'red').length;
  const amberCount = readings.filter((r: any) => r.status === 'amber' || r.status === 'yellow').length;

  if (redCount > 0) {
    return {
      lines: [`${memberName}'s vitals show ${redCount} elevated reading(s) this past week.`, `Blood pressure and sugar levels have fluctuated outside normal ranges.`, `Please schedule a routine review with their consulting physician.`],
      linesHi: [`इस सप्ताह ${memberName} के कुछ स्वास्थ्य माप सामान्य सीमा से अधिक रहे।`, `रक्तचाप और शुगर में सामान्य से अधिक उतार-चढ़ाव देखा गया है।`, `कृपया अपने डॉक्टर से मिलकर एक बार जांच अवश्य करवाएं।`],
    };
  }
  if (amberCount > 0) {
    return {
      lines: [`${memberName}'s health has been mostly steady with minor borderline readings.`, `Daily 20-minute morning walks and light low-sodium meals will help maintain stability.`, `Continue tracking twice daily after morning routine.`],
      linesHi: [`${memberName} का स्वास्थ्य ज्यादातर स्थिर रहा है, कुछ माप सीमा पर रहे।`, `रोजाना 20 मिनट की सुबह की सैर और हल्का खान-पान स्थिरता बनाए रखने में मदद करेगा।`, `रोजाना सुबह नाश्ते के बाद नियमित जांच जारी रखें।`],
    };
  }
  return {
    lines: [`${memberName} has maintained excellent vital stability throughout the week.`, `Blood pressure and blood sugar readings are consistently within the healthy green zone.`, `Great job keeping up with healthy daily family habits!`],
    linesHi: [`इस पूरे सप्ताह ${memberName} के सभी स्वास्थ्य माप सामान्य और स्थिर रहे हैं।`, `रक्तचाप और ब्लड शुगर दोनों सुरक्षित हरे दायरे में बने हुए हैं।`, `बहुत बढ़िया! इसी तरह अपनी सेहत का ध्यान रखते रहें।`],
  };
}

export async function searchFoods(query: string) {
  const { POPULAR_FOODS } = await import('../data/foodData');
  const q = query.trim().toLowerCase();
  if (!q) return POPULAR_FOODS.slice(0, 10);
  return POPULAR_FOODS.filter(
    (item: any) =>
      item.name.toLowerCase().includes(q) ||
      (item.nameHi && item.nameHi.includes(q)) ||
      item.category.toLowerCase().includes(q) ||
      item.note.toLowerCase().includes(q)
  );
}

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
  const stored = localStorage.getItem('hn_checklist_v5');
  if (stored) return JSON.parse(stored);
  return DEFAULT_CHECKLIST;
}

export function toggleChecklistItem(id: string): ChecklistItem[] {
  const items = getTodayChecklist();
  const updated = items.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it));
  localStorage.setItem('hn_checklist_v5', JSON.stringify(updated));
  return updated;
}

export function logoutUser() {
  localStorage.removeItem('hn_jwt_token_v5');
}

export function getToken() {
  return localStorage.getItem('hn_jwt_token_v5');
}

export function setToken(token: string) {
  localStorage.setItem('hn_jwt_token_v5', token);
}