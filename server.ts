import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

import {
  INITIAL_FAMILY,
  INITIAL_MEMBERS,
  INITIAL_USERS,
  INITIAL_MEDICINES,
  INITIAL_APPOINTMENTS,
  INITIAL_ALERTS,
  generateSeedReadings,
} from './src/services/mockData.ts';
import { bpStatus, sugarStatus } from './src/utils/healthRules.ts';
import {
  User,
  Family,
  Member,
  Reading,
  Medicine,
  Appointment,
  FamilyAlert,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ExtendedFamily extends Family {
  premiumUntil?: string;
}

interface StoredUser extends User {
  passwordHash?: string;
}

// In-memory data store with seed health data
const families: ExtendedFamily[] = [
  {
    ...INITIAL_FAMILY,
    premiumUntil: new Date(Date.now() + 180 * 86400000).toISOString(),
  },
];

const users: StoredUser[] = INITIAL_USERS.map((u) => ({
  ...u,
  passwordHash: 'password123',
}));

let members: Member[] = [...INITIAL_MEMBERS];
let readings: Reading[] = generateSeedReadings();
let medicines: Medicine[] = [...INITIAL_MEDICINES];
let appointments: Appointment[] = [...INITIAL_APPOINTMENTS];
let alerts: FamilyAlert[] = [...INITIAL_ALERTS];

const JWT_SECRET = process.env.JWT_SECRET || 'meditree_secure_secret_key_2026';

function signToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ id: userId, exp: Math.floor(Date.now() / 1000) + 30 * 86400 })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string): { id: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expected = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    if (signature !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

function userPayload(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    familyId: user.familyId,
    memberId: user.memberId,
    onboardingCompleted: user.onboardingCompleted ?? true,
    avatarUrl: user.avatarUrl,
  };
}

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Please log in' });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }
  const user = users.find((u) => u.id === decoded.id);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  (req as any).user = user;
  next();
}

function managerOnly(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user as StoredUser | undefined;
  if (!user || user.role !== 'manager') {
    return res.status(403).json({ message: 'Only the family manager can do this' });
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Auth Routes
  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ message: 'Wrong email or password' });
    }
    res.json({ token: signToken(user.id), user: userPayload(user) });
  });

  app.post('/api/auth/register-manager', (req, res) => {
    const { name, email, familyName } = req.body;
    if (!email || !name) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'Email already used' });
    }
    const familyId = 'f_' + Date.now();
    const userId = 'u_' + Date.now();
    const memberId = 'm_' + Date.now();
    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const newFamily: ExtendedFamily = {
      id: familyId,
      name: familyName || `${name}'s Family`,
      inviteCode,
      managerUid: userId,
      premiumUntil: new Date(Date.now() + 180 * 86400000).toISOString(),
    };
    families.push(newFamily);

    const newMember: Member = {
      id: memberId,
      familyId,
      userUid: userId,
      userId,
      name,
      relation: 'Self / Manager',
      gender: 'other',
      conditions: [],
      hasLogin: true,
    };
    members.push(newMember);

    const newUser: StoredUser = {
      id: userId,
      name,
      email,
      role: 'manager',
      familyId,
      memberId,
      onboardingCompleted: true,
    };
    users.push(newUser);

    res.status(201).json({
      token: signToken(userId),
      user: userPayload(newUser),
      family: newFamily,
    });
  });

  app.post('/api/auth/join', (req, res) => {
    const { name, email, inviteCode } = req.body;
    const fam = families.find(
      (f) => f.inviteCode.toUpperCase() === (inviteCode || '').trim().toUpperCase()
    );
    if (!fam) {
      return res.status(400).json({ message: 'Invalid invite code' });
    }
    if (users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase())) {
      return res.status(400).json({ message: 'Email already used' });
    }
    const userId = 'u_' + Date.now();
    const memberId = 'm_' + Date.now();

    const newMember: Member = {
      id: memberId,
      familyId: fam.id,
      userUid: userId,
      userId,
      name: name || 'Family Member',
      relation: 'Family Member',
      gender: 'other',
      conditions: [],
      hasLogin: true,
    };
    members.push(newMember);

    const newUser: StoredUser = {
      id: userId,
      name: name || 'Family Member',
      email: email || `member_${Date.now()}@sharma.in`,
      role: 'member',
      familyId: fam.id,
      memberId,
      onboardingCompleted: true,
    };
    users.push(newUser);

    res.status(201).json({
      token: signToken(userId),
      user: userPayload(newUser),
    });
  });

  app.post('/api/auth/google-login', (req, res) => {
    const { email, name } = req.body;
    let user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user) {
      const familyId = families[0]?.id || 'f1';
      const userId = 'u_' + Date.now();
      const memberId = 'm_' + Date.now();

      const newMember: Member = {
        id: memberId,
        familyId,
        userUid: userId,
        userId,
        name: name || 'Google User',
        relation: 'Self',
        gender: 'other',
        conditions: [],
        hasLogin: true,
      };
      members.push(newMember);

      user = {
        id: userId,
        name: name || 'Google User',
        email: email || 'user@gmail.com',
        role: 'manager',
        familyId,
        memberId,
        onboardingCompleted: true,
      };
      users.push(user);
    }
    res.json({ token: signToken(user.id), user: userPayload(user) });
  });

  app.post('/api/auth/switch-demo', (req, res) => {
    const { role } = req.body;
    const targetUser = users.find((u) => u.role === (role || 'manager')) || users[0];
    res.json({ token: signToken(targetUser.id), user: userPayload(targetUser) });
  });

  app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    res.json({ user: userPayload(user) });
  });

  app.put('/api/auth/me', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.avatarUrl) user.avatarUrl = req.body.avatarUrl;
    res.json({ user: userPayload(user) });
  });

  // Family Routes
  app.get('/api/family', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    const fam = families.find((f) => f.id === user.familyId) || families[0];
    res.json(fam);
  });

  app.post('/api/family/regenerate-code', authMiddleware, managerOnly, (req, res) => {
    const user = (req as any).user as StoredUser;
    const fam = families.find((f) => f.id === user.familyId);
    if (!fam) return res.status(404).json({ message: 'Family not found' });
    fam.inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    res.json(fam);
  });

  app.get('/api/family/members', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    const famMembers = members.filter((m) => m.familyId === user.familyId);
    res.json(famMembers);
  });

  app.post('/api/family/members', authMiddleware, managerOnly, (req, res) => {
    const user = (req as any).user as StoredUser;
    const newMember: Member = {
      ...req.body,
      id: 'm_' + Date.now(),
      familyId: user.familyId,
      hasLogin: false,
      conditions: req.body.conditions || [],
      goals: req.body.goals || [],
    };
    members.push(newMember);
    res.status(201).json(newMember);
  });

  app.put('/api/family/members/:id', authMiddleware, (req, res) => {
    const idx = members.findIndex((m) => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Member not found' });
    members[idx] = { ...members[idx], ...req.body };
    res.json(members[idx]);
  });

  app.delete('/api/family/members/:id', authMiddleware, managerOnly, (req, res) => {
    const id = req.params.id;
    members = members.filter((m) => m.id !== id);
    readings = readings.filter((r) => r.memberId !== id);
    medicines = medicines.filter((m) => m.memberId !== id);
    appointments = appointments.filter((a) => a.memberId !== id);
    res.json({ message: 'Deleted' });
  });

  app.post('/api/family/members/:id/create-login', authMiddleware, managerOnly, (req, res) => {
    const member = members.find((m) => m.id === req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    const { email } = req.body;
    const userId = 'u_' + Date.now();
    const newUser: StoredUser = {
      id: userId,
      name: member.name,
      email: email || `${member.name.toLowerCase().replace(/\s+/g, '')}@sharma.in`,
      role: 'member',
      familyId: member.familyId,
      memberId: member.id,
      onboardingCompleted: true,
    };
    users.push(newUser);
    member.userId = userId;
    member.userUid = userId;
    member.hasLogin = true;
    res.status(201).json(userPayload(newUser));
  });

  app.post('/api/family/members/:id/reset-password', authMiddleware, managerOnly, (req, res) => {
    res.json({ message: 'Password reset' });
  });

  app.get('/api/family/alerts', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    const famAlerts = alerts
      .filter((a) => a.familyId === user.familyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(famAlerts);
  });

  app.delete('/api/family/alerts/:id', authMiddleware, (req, res) => {
    alerts = alerts.filter((a) => a.id !== req.params.id);
    res.json({ message: 'Dismissed' });
  });

  // Health Readings Routes
  app.get('/api/readings', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    const { memberId, type, days } = req.query;
    let list = readings.filter((r) => r.familyId === user.familyId);
    if (memberId && typeof memberId === 'string') {
      list = list.filter((r) => r.memberId === memberId);
    }
    if (type && typeof type === 'string') {
      list = list.filter((r) => r.type === type);
    }
    if (days && typeof days === 'string') {
      const numDays = Number(days);
      if (!isNaN(numDays)) {
        const cutoff = Date.now() - numDays * 86400000;
        list = list.filter((r) => new Date(r.takenAt).getTime() >= cutoff);
      }
    }
    list.sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
    res.json(list);
  });

  app.post('/api/readings', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    const {
      memberId,
      type,
      takenAt,
      note,
      systolic,
      diastolic,
      pulse,
      sugar,
      sugarContext,
      weightKg,
    } = req.body;

    if (!memberId || !type) {
      return res.status(400).json({ message: 'Missing memberId or type' });
    }

    let status: 'green' | 'amber' | 'red' = 'green';
    let statusText = 'Normal';

    if (type === 'bp') {
      if (!systolic || !diastolic) {
        return res.status(400).json({ message: 'Enter both BP numbers' });
      }
      const ev = bpStatus(Number(systolic), Number(diastolic));
      status = ev.status === 'yellow' ? 'amber' : ev.status;
      statusText = ev.text;
    } else if (type === 'sugar') {
      if (!sugar) {
        return res.status(400).json({ message: 'Enter sugar value' });
      }
      const ev = sugarStatus(Number(sugar), sugarContext);
      status = ev.status === 'yellow' ? 'amber' : ev.status;
      statusText = ev.text;
    } else if (type === 'weight') {
      if (!weightKg) {
        return res.status(400).json({ message: 'Enter weight' });
      }
      status = 'green';
      statusText = 'Weight recorded';
    } else if (type === 'pulse') {
      if (!pulse) {
        return res.status(400).json({ message: 'Enter pulse' });
      }
      const p = Number(pulse);
      status = p >= 50 && p <= 100 ? 'green' : 'amber';
      statusText = status === 'green' ? 'Resting heart rate healthy' : 'Resting pulse irregular';
    }

    const newReading: Reading = {
      id: 'r_' + Date.now(),
      memberId,
      familyId: user.familyId,
      type,
      systolic: systolic ? Number(systolic) : undefined,
      diastolic: diastolic ? Number(diastolic) : undefined,
      pulse: pulse ? Number(pulse) : undefined,
      sugar: sugar ? Number(sugar) : undefined,
      sugarContext,
      weightKg: weightKg ? Number(weightKg) : undefined,
      status,
      statusText,
      note,
      takenAt: takenAt ? new Date(takenAt).toISOString() : new Date().toISOString(),
      addedByUid: user.id,
      addedBy: user.name,
    };
    readings.unshift(newReading);

    if (status === 'amber' || status === 'red') {
      const mem = members.find((m) => m.id === memberId);
      const mName = mem ? mem.name : 'Family Member';
      const valText =
        type === 'bp'
          ? `${systolic}/${diastolic} mmHg`
          : type === 'sugar'
            ? `${sugar} mg/dL`
            : `${pulse} bpm`;
      alerts.unshift({
        id: 'alt_' + Date.now(),
        familyId: user.familyId,
        memberId,
        memberName: mName,
        type,
        status,
        valueText: valText,
        message: `${mName}'s ${type.toUpperCase()} reading was recorded as ${
          status === 'red' ? 'high/alert' : 'elevated'
        } (${valText}).`,
        createdAt: new Date().toISOString(),
      });
    }

    res.status(201).json(newReading);
  });

  app.put('/api/readings/:id', authMiddleware, (req, res) => {
    const idx = readings.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Reading not found' });
    readings[idx] = { ...readings[idx], ...req.body };
    res.json(readings[idx]);
  });

  app.delete('/api/readings/:id', authMiddleware, (req, res) => {
    readings = readings.filter((r) => r.id !== req.params.id);
    res.json({ message: 'Deleted' });
  });

  // Medicines Routes
  app.get('/api/medicines', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    let list = medicines.filter((m) => m.familyId === user.familyId);
    if (req.query.memberId && typeof req.query.memberId === 'string') {
      list = list.filter((m) => m.memberId === req.query.memberId);
    }
    res.json(list);
  });

  app.post('/api/medicines', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    const newMed: Medicine = {
      ...req.body,
      id: 'med_' + Date.now(),
      familyId: user.familyId,
      times: req.body.times || ['08:00 AM'],
      days: req.body.days || ['Daily'],
    };
    medicines.push(newMed);
    res.status(201).json(newMed);
  });

  app.put('/api/medicines/:id', authMiddleware, (req, res) => {
    const idx = medicines.findIndex((m) => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Medicine not found' });
    medicines[idx] = { ...medicines[idx], ...req.body };
    res.json(medicines[idx]);
  });

  app.delete('/api/medicines/:id', authMiddleware, (req, res) => {
    medicines = medicines.filter((m) => m.id !== req.params.id);
    res.json({ message: 'Deleted' });
  });

  app.patch('/api/medicines/:id/toggle', authMiddleware, (req, res) => {
    const med = medicines.find((m) => m.id === req.params.id);
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    med.takenToday = !med.takenToday;
    res.json(med);
  });

  // Appointments Routes
  app.get('/api/appointments', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    let list = appointments.filter((a) => a.familyId === user.familyId);
    if (req.query.memberId && typeof req.query.memberId === 'string') {
      list = list.filter((a) => a.memberId === req.query.memberId);
    }
    res.json(list);
  });

  app.post('/api/appointments', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    const newApp: Appointment = {
      ...req.body,
      id: 'app_' + Date.now(),
      familyId: user.familyId,
    };
    appointments.push(newApp);
    res.status(201).json(newApp);
  });

  app.delete('/api/appointments/:id', authMiddleware, (req, res) => {
    appointments = appointments.filter((a) => a.id !== req.params.id);
    res.json({ message: 'Deleted' });
  });

  // Payments Routes
  app.get('/api/payments/status', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    const used = readings.filter((r) => r.familyId === user.familyId).length;
    res.json({
      isPremium: true,
      premiumUntil: new Date(Date.now() + 180 * 86400000).toISOString(),
      used,
      freeLimit: 30,
      price: {
        amount: 49900,
        currency: 'INR',
        display: '₹499',
        period: '6 months',
        offer: 'Special Family Discount',
      },
      lastPayment: null,
      memberSince: new Date().toISOString(),
    });
  });

  app.post('/api/payments/create-order', authMiddleware, managerOnly, (_req, res) => {
    res.json({
      orderId: 'order_' + Date.now(),
      amount: 49900,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      offer: 'Special Family Discount',
    });
  });

  app.post('/api/payments/verify', authMiddleware, (_req, res) => {
    res.json({ ok: true });
  });

  // Initialize server-side Gemini client with telemetric header
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API endpoint for comprehensive medicine clinical lookup
  app.post('/api/medicine-lookup', async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const cleanQuery = query.trim();

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Falling back to local clinical engine.',
      });
    }

    try {
      const prompt = `You are a clinical pharmacologist and medical information specialist.
Provide authoritative, accurate, and elder-friendly clinical data for the medication or chemical drug: "${cleanQuery}".
You MUST return ONLY a clean JSON object conforming exactly to this structure with no markdown backticks or commentary:
{
  "name": "${cleanQuery}",
  "brandName": "Common commercial brand name or ${cleanQuery}",
  "genericName": "Generic active salt or chemical molecule name",
  "dosageForm": "Tablet / Capsule / Syrup / Inhaler / Injection / Sachet / Drops",
  "strength": "Standard strength (e.g. 650mg, 500mg + 125mg, 40mg)",
  "manufacturer": "Leading pharmaceutical manufacturer",
  "composition": {
    "salts": [
      { "name": "Active Salt Molecule Name", "amount": "Strength in mg/mcg" }
    ]
  },
  "category": "Therapeutic class (e.g. Antihypertensive / ARB, Antidiabetic, Statin, Antibiotic)",
  "conditions": ["Condition 1", "Condition 2", "Condition 3"],
  "primaryUses": ["Primary clinical use 1", "Use 2"],
  "use": "Concise 1-2 sentence explanation of why this medicine is used and how it works in the body.",
  "standardDosage": "Typical adult maintenance dosage (e.g. 40 mg once daily, 500 mg twice daily with meals)",
  "usageTiming": "Clear timing instructions (e.g. Take in the morning before breakfast with a full glass of water)",
  "precautions": [
    "Crucial elder safety warning or contraindication 1",
    "Food or interaction warning 2",
    "Monitoring instruction 3"
  ],
  "sideEffects": ["Common mild side effect 1", "Side effect 2", "Side effect 3"],
  "storageConditions": "Store below 25°C in a dry place protected from direct sunlight",
  "prescriptionRequired": true
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return res.json({
        ...parsed,
        source: 'ai',
      });
    } catch (err: any) {
      console.warn('Server Gemini medicine lookup temporary error, using clinical rule fallback:', err?.message || err);

      // Resilient pharmacological rule fallback
      const q = cleanQuery.toLowerCase();
      let category = 'Prescription Medication';
      let conditions = ['Routine Health Maintenance', 'Prescribed Therapy'];
      let use = `Clinical medicine for managing ${cleanQuery} indications under medical supervision.`;
      let standardDosage = '1 tablet once daily, or as specified on your doctor prescription.';
      let usageTiming = 'Take with a glass of water after food at the same time each day.';
      let precautions = [
        'Take strictly according to physician instructions',
        'Do not alter the dosage without consulting your doctor',
        'Store below 25°C in a dry place',
      ];
      let sideEffects = ['Mild stomach discomfort', 'Drowsiness or dizziness in rare cases'];

      if (q.includes('sartan')) {
        category = 'Blood Pressure (ARB)';
        conditions = ['Hypertension (High Blood Pressure)', 'Cardiovascular Protection', 'Diabetic Kidney Disease'];
        use = 'Angiotensin receptor blocker that relaxes blood vessels to lower blood pressure and prevent strokes.';
        standardDosage = '20 mg to 80 mg once daily in the morning';
        usageTiming = 'Take once daily in the morning with water, with or without meals.';
        precautions = ['Avoid potassium supplements unless advised', 'Do not take during pregnancy', 'Monitor BP regularly'];
        sideEffects = ['Dizziness', 'Fatigue', 'Low blood pressure'];
      } else if (q.includes('statin')) {
        category = 'Cholesterol / Lipid Lowering';
        conditions = ['High LDL Cholesterol', 'Atherosclerosis', 'Heart Attack & Stroke Prevention'];
        use = 'Reduces liver production of bad LDL cholesterol and helps clear arterial plaque.';
        standardDosage = '10 mg to 40 mg once daily at bedtime';
        usageTiming = 'Take at night / bedtime with water for optimal cholesterol-lowering efficacy.';
        precautions = ['Report unexplained muscle aches or weakness', 'Avoid excessive alcohol and grapefruit juice'];
        sideEffects = ['Mild muscle aches', 'Joint stiffness', 'Mild digestive upset'];
      } else if (q.includes('formin') || q.includes('glyco')) {
        category = 'Diabetes / Blood Sugar';
        conditions = ['Type 2 Diabetes Mellitus', 'Insulin Resistance', 'Prediabetes'];
        use = 'Decreases glucose production in the liver and improves body response to insulin.';
        standardDosage = '500 mg to 1000 mg once or twice daily with meals';
        usageTiming = 'Take with or immediately after major meals to avoid stomach upset.';
        precautions = ['Always take with food; never on empty stomach', 'Avoid heavy alcohol consumption'];
        sideEffects = ['Nausea', 'Loose stools or diarrhea', 'Metallic taste in mouth'];
      } else if (q.includes('prazole')) {
        category = 'Acidity / Antacid (PPI)';
        conditions = ['Acid Reflux (GERD)', 'Gastritis', 'Stomach Ulcers', 'Heartburn'];
        use = 'Proton pump inhibitor that significantly reduces excess acid production in the stomach.';
        standardDosage = '20 mg to 40 mg once daily in the morning';
        usageTiming = 'Take on an empty stomach 30 to 45 minutes before breakfast with a glass of water.';
        precautions = ['Must be taken before meals for best effect', 'Swallow whole; do not crush or chew'];
        sideEffects = ['Mild headache', 'Diarrhea', 'Dry mouth'];
      } else if (q.includes('dipine')) {
        category = 'Blood Pressure (Calcium Channel Blocker)';
        conditions = ['Hypertension (High Blood Pressure)', 'Angina (Chest Pain)'];
        use = 'Relaxes arterial muscle walls, allowing smoother blood flow and reducing heart strain.';
        standardDosage = '5 mg to 10 mg once daily';
        usageTiming = 'Take once daily in the morning, before or after breakfast.';
        precautions = ['Watch for foot/ankle swelling', 'Avoid grapefruit juice', 'Stand up slowly from seated position'];
        sideEffects = ['Ankle swelling', 'Flushing', 'Headache'];
      } else if (q.includes('sacubitril') || q.includes('entresto') || q.includes('vymada')) {
        category = 'Heart Failure (ARNI)';
        conditions = ['Chronic Heart Failure (Reduced Ejection Fraction)', 'Cardiovascular Mortality Reduction'];
        use = 'Neprilysin inhibitor combined with ARB that relaxes blood vessels and reduces fluid strain on failing heart muscle.';
        standardDosage = '24/26 mg to 97/103 mg twice daily as titrated by cardiologist';
        usageTiming = 'Take twice daily with water, morning and evening, with or without food.';
        precautions = ['Do not take within 36 hours of an ACE inhibitor', 'Monitor serum potassium and blood pressure regularly'];
        sideEffects = ['Low blood pressure (hypotension)', 'Dizziness', 'Mild hyperkalemia'];
      }

      return res.json({
        name: cleanQuery,
        genericName: cleanQuery,
        category,
        conditions,
        use,
        standardDosage,
        usageTiming,
        precautions,
        sideEffects,
        source: 'database',
      });
    }
  });

  // Mount Vite middleware in development
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (dev: ${isDev})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
