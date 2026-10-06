function bpStatus(sys, dia) {
  if (sys > 180 || dia > 120)
    return { status: 'red', text: 'Very high. Please contact a doctor now.' };
  if (sys >= 140 || dia >= 90)
    return { status: 'red', text: 'High blood pressure. Please consult your doctor.' };
  if (sys >= 130 || dia >= 80)
    return { status: 'yellow', text: 'Slightly high. Keep watching it.' };
  if (sys >= 120)
    return { status: 'yellow', text: 'A little raised. Watch your salt.' };
  if (sys < 90 || dia < 60)
    return { status: 'yellow', text: 'Low. Sit down, drink water, check again.' };
  return { status: 'green', text: 'Good. Blood pressure is normal.' };
}

function sugarStatus(mgdl, context = 'random') {
  if (mgdl < 70)
    return { status: 'red', text: 'Low sugar. Eat something sweet and tell family.' };

  if (context === 'fasting') {
    if (mgdl < 100) return { status: 'green', text: 'Good. Fasting sugar is normal.' };
    if (mgdl < 126) return { status: 'yellow', text: 'Slightly high for fasting.' };
    return { status: 'red', text: 'High fasting sugar. Please consult your doctor.' };
  }
  if (context === 'after_meal') {
    if (mgdl < 140) return { status: 'green', text: 'Good. Sugar after meal is normal.' };
    if (mgdl < 180) return { status: 'yellow', text: 'Slightly high after meal.' };
    return { status: 'red', text: 'High after meal. Please consult your doctor.' };
  }
  if (mgdl < 140) return { status: 'green', text: 'Good. Sugar is normal.' };
  if (mgdl < 200) return { status: 'yellow', text: 'Slightly high.' };
  return { status: 'red', text: 'High sugar. Please consult your doctor.' };
}

function bmiInfo(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  const bmi = +(weightKg / (m * m)).toFixed(1);
  let status = 'green', text = 'Healthy weight.';
  if (bmi < 18.5) { status = 'yellow'; text = 'Underweight.'; }
  else if (bmi >= 25) { status = 'red'; text = 'Obese range. Consider diet and walking.'; }
  else if (bmi >= 23) { status = 'yellow'; text = 'Slightly overweight.'; }
  return { bmi, status, text };
}

module.exports = { bpStatus, sugarStatus, bmiInfo };