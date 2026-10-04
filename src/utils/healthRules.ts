import { HealthScoreDetails, HealthStatus, Reading, SugarContext } from '../types';

export interface StatusResult {
  status: HealthStatus;
  statusWord: string;
  statusWordHi: string;
  text: string;
  textHi: string;
}

export function bpStatus(systolic: number, diastolic: number): StatusResult {
  if (systolic >= 140 || diastolic >= 90) {
    return {
      status: 'red',
      statusWord: 'See doctor',
      statusWordHi: 'डॉक्टर से मिलें',
      text: 'Higher than usual. Please consult your family doctor.',
      textHi: 'सामान्य से अधिक। कृपया अपने डॉक्टर से सलाह लें।',
    };
  }
  if (systolic >= 120 || diastolic >= 80 || systolic < 90 || diastolic < 60) {
    return {
      status: 'amber',
      statusWord: 'Watch',
      statusWordHi: 'ध्यान दें',
      text: systolic < 90 ? 'A bit low. Rest and drink fluids.' : 'A little raised. Watch salt and stay hydrated.',
      textHi: systolic < 90 ? 'थोड़ा कम है। आराम करें और तरल पदार्थ लें।' : 'हल्का बढ़ा हुआ। नमक कम लें और पर्याप्त पानी पिएं।',
    };
  }
  return {
    status: 'green',
    statusWord: 'Good',
    statusWordHi: 'अच्छा',
    text: 'Good. Your blood pressure is normal.',
    textHi: 'अच्छा। आपका रक्तचाप सामान्य है।',
  };
}

export function sugarStatus(mgdl: number, context: SugarContext = 'random'): StatusResult {
  if (mgdl < 70) {
    return {
      status: 'red',
      statusWord: 'See doctor',
      statusWordHi: 'चेतावनी (कम)',
      text: 'Low blood sugar. Eat something sweet and notify family.',
      textHi: 'शुगर कम है। तुरंत कुछ मीठा लें और परिवार को बताएं।',
    };
  }

  if (context === 'fasting') {
    if (mgdl < 100) {
      return {
        status: 'green',
        statusWord: 'Good',
        statusWordHi: 'अच्छा',
        text: 'Good. Your fasting sugar is in normal range.',
        textHi: 'अच्छा। खाली पेट की शुगर सामान्य सीमा में है।',
      };
    }
    if (mgdl <= 125) {
      return {
        status: 'amber',
        statusWord: 'Watch',
        statusWordHi: 'ध्यान दें',
        text: 'Slightly high for fasting. Watch morning sweets.',
        textHi: 'खाली पेट के लिए थोड़ी अधिक है। मीठे से परहेज रखें।',
      };
    }
    return {
      status: 'red',
      statusWord: 'See doctor',
      statusWordHi: 'डॉक्टर से मिलें',
      text: 'High fasting sugar. Please consult your doctor.',
      textHi: 'खाली पेट की शुगर अधिक है। कृपया डॉक्टर से मिलें।',
    };
  }

  if (context === 'after_meal') {
    if (mgdl < 140) {
      return {
        status: 'green',
        statusWord: 'Good',
        statusWordHi: 'अच्छा',
        text: 'Good. Post-meal sugar is healthy.',
        textHi: 'अच्छा। भोजन के बाद की शुगर बिल्कुल ठीक है।',
      };
    }
    if (mgdl <= 179) {
      return {
        status: 'amber',
        statusWord: 'Watch',
        statusWordHi: 'ध्यान दें',
        text: 'A bit elevated after food. A gentle 15-min walk will help.',
        textHi: 'खाने के बाद थोड़ी बढ़ी हुई है। हल्की सैर करें।',
      };
    }
    return {
      status: 'red',
      statusWord: 'See doctor',
      statusWordHi: 'डॉक्टर से मिलें',
      text: 'High sugar after meal. Please discuss with your doctor.',
      textHi: 'खाने के बाद की शुगर अधिक है। डॉक्टर से सलाह लें।',
    };
  }

  // Anytime / Random
  if (mgdl < 140) {
    return {
      status: 'green',
      statusWord: 'Good',
      statusWordHi: 'अच्छा',
      text: 'Good. Sugar reading is normal.',
      textHi: 'अच्छा। आपकी शुगर सामान्य है।',
    };
  }
  if (mgdl <= 199) {
    return {
      status: 'amber',
      statusWord: 'Watch',
      statusWordHi: 'ध्यान दें',
      text: 'Slightly high. Drink water and watch carbohydrates.',
      textHi: 'थोड़ी अधिक है। पानी पिएं और खान-पान का ध्यान रखें।',
    };
  }
  return {
    status: 'red',
    statusWord: 'See doctor',
    statusWordHi: 'डॉक्टर से मिलें',
    text: 'High sugar reading. Please consult your doctor.',
    textHi: 'शुगर काफी अधिक है। डॉक्टर से परामर्श लें।',
  };
}

// Asian BMI cut-offs: green 18.5-22.9, amber below 18.5 or 23-24.9, red 25 and above
export interface BmiResult {
  bmi: number;
  status: HealthStatus;
  statusWord: string;
  statusWordHi: string;
  text: string;
  textHi: string;
}

export function bmiInfo(weightKg?: number, heightCm?: number): BmiResult | null {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) return null;
  const meters = heightCm / 100;
  const bmi = Number((weightKg / (meters * meters)).toFixed(1));

  if (bmi < 18.5) {
    return {
      bmi,
      status: 'amber',
      statusWord: 'Watch',
      statusWordHi: 'कम वज़न',
      text: 'Underweight. Wholesome protein meals recommended.',
      textHi: 'वज़न कम है। पौष्टिक आहार लें।',
    };
  }
  if (bmi <= 22.9) {
    return {
      bmi,
      status: 'green',
      statusWord: 'Good',
      statusWordHi: 'संतुलित',
      text: 'Healthy weight according to Asian standards.',
      textHi: 'संतुलित वज़न। स्वास्थ्य बहुत अच्छा है।',
    };
  }
  if (bmi <= 24.9) {
    return {
      bmi,
      status: 'amber',
      statusWord: 'Watch',
      statusWordHi: 'हल्का अधिक',
      text: 'Slightly overweight. Daily 30-minute walks help.',
      textHi: 'हल्का सा अधिक वज़न। रोज़ाना टहलना फ़ायदेमंद है।',
    };
  }
  return {
    bmi,
    status: 'red',
    statusWord: 'See doctor',
    statusWordHi: 'अधिक वज़न',
    text: 'Above recommended range. Discuss diet and exercise with your doctor.',
    textHi: 'वज़न अधिक सीमा में है। डॉक्टर से आहार संबंधी सलाह लें।',
  };
}

export function pulseStatus(pulse?: number): StatusResult {
  if (!pulse) {
    return {
      status: 'green',
      statusWord: 'Normal',
      statusWordHi: 'सामान्य',
      text: 'Resting pulse recorded.',
      textHi: 'धड़कन दर्ज की गई।',
    };
  }
  if (pulse < 50 || pulse > 100) {
    return {
      status: 'amber',
      statusWord: 'Watch',
      statusWordHi: 'ध्यान दें',
      text: pulse < 50 ? 'Resting heart rate is quite slow.' : 'Pulse is elevated. Rest quietly.',
      textHi: pulse < 50 ? 'नाड़ी की गति धीमी है।' : 'धड़कन तेज़ है। आराम से बैठें।',
    };
  }
  return {
    status: 'green',
    statusWord: 'Good',
    statusWordHi: 'अच्छा',
    text: 'Heart rate is steady and healthy.',
    textHi: 'धड़कन बिल्कुल सामान्य और स्वस्थ है।',
  };
}

// Health Score: start at 100, subtract points for red and amber readings in the last 7 days, add a small bonus for streaks.
export function calculateHealthScore(readings: Reading[], streakDays = 5): HealthScoreDetails {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = readings.filter((r) => new Date(r.takenAt).getTime() >= sevenDaysAgo);

  let redCount = 0;
  let amberCount = 0;
  let greenCount = 0;

  recent.forEach((r) => {
    if (r.status === 'red') redCount++;
    else if (r.status === 'amber') amberCount++;
    else greenCount++;
  });

  // Score starts at 100
  let score = 100;
  score -= redCount * 12;
  score -= amberCount * 4;

  // Streak bonus (+1 per day up to +5)
  const bonus = Math.min(streakDays, 5);
  score += bonus;

  // Clamp 0 to 100
  score = Math.max(20, Math.min(100, score));

  let category: HealthScoreDetails['category'] = 'Good';
  let explanation = 'Based on your last 7 days of readings.';

  if (score >= 90) {
    category = 'Excellent';
    explanation = 'Excellent vital stability and consistent routine over the past 7 days!';
  } else if (score >= 75) {
    category = 'Good';
    explanation = 'Good overall control. Keep monitoring your daily habits.';
  } else if (score >= 60) {
    category = 'Fair';
    explanation = 'Some elevated readings noted this week. Follow routine walks and diet.';
  } else {
    category = 'Needs Attention';
    explanation = 'Multiple readings outside healthy range. Please consult your family physician.';
  }

  return {
    score,
    category,
    explanation,
    streakDays,
    redCount,
    amberCount,
    greenCount,
  };
}

export function validateInputRange(type: 'bp' | 'sugar' | 'weight' | 'pulse', data: { systolic?: number; diastolic?: number; pulse?: number; sugar?: number; weightKg?: number }): { isUnusual: boolean; warningMsg?: string; warningMsgHi?: string } {
  if (type === 'bp') {
    const sys = data.systolic || 0;
    const dia = data.diastolic || 0;
    if (sys < 70 || sys > 250 || dia < 40 || dia > 150) {
      return {
        isUnusual: true,
        warningMsg: `That looks unusual (${sys}/${dia} mmHg). Please verify your monitor.`,
        warningMsgHi: `यह संख्या असामान्य लग रही है (${sys}/${dia})। कृपया अपनी मशीन में नंबर दोबारा जांचें।`,
      };
    }
  }

  if (type === 'sugar') {
    const s = data.sugar || 0;
    if (s < 20 || s > 600) {
      return {
        isUnusual: true,
        warningMsg: `Sugar value (${s} mg/dL) is unusual. Please re-check the strip.`,
        warningMsgHi: `शुगर की संख्या (${s}) असामान्य है। कृपया अपनी मशीन की पर्ची देखें।`,
      };
    }
  }

  if (type === 'weight') {
    const w = data.weightKg || 0;
    if (w < 10 || w > 250) {
      return {
        isUnusual: true,
        warningMsg: `Weight (${w} kg) looks unusual. Please confirm the number.`,
        warningMsgHi: `वज़न (${w} किलो) असामान्य लग रहा है। कृपया संख्या जांचें।`,
      };
    }
  }

  if (type === 'pulse') {
    const p = data.pulse || 0;
    if (p < 30 || p > 220) {
      return {
        isUnusual: true,
        warningMsg: `Pulse (${p} bpm) looks unusual. Please double check.`,
        warningMsgHi: `धड़कन (${p}) असामान्य लग रही है। कृपया पुनः जांचें।`,
      };
    }
  }

  return { isUnusual: false };
}
