import { SugarContext } from '../types';

export interface ParsedSpeechData {
  type?: 'bp' | 'sugar' | 'weight' | 'pulse';
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  sugar?: number;
  sugarContext?: SugarContext;
  weightKg?: number;
  rawText: string;
}

export function parseHealthSpeech(transcript: string): ParsedSpeechData {
  const text = transcript.toLowerCase();
  const result: ParsedSpeechData = { rawText: transcript };

  // Detect BP
  // e.g., "bp 130 over 85", "120 by 80", "130 slash 85", "130 aur 85"
  const bpMatch = text.match(/(?:bp|blood pressure)?\s*(\d{2,3})\s*(?:over|by|\/|slash|aur|bata)\s*(\d{2,3})/);
  if (bpMatch) {
    result.type = 'bp';
    result.systolic = parseInt(bpMatch[1], 10);
    result.diastolic = parseInt(bpMatch[2], 10);

    const pulseMatch = text.match(/(?:pulse|heart rate|dhadkan)\s*(?:is|hai)?\s*(\d{2,3})/);
    if (pulseMatch) {
      result.pulse = parseInt(pulseMatch[1], 10);
    }
    return result;
  }

  // Detect Sugar
  // e.g., "sugar 140", "blood sugar 110 fasting", "sugar 150 after meal"
  if (text.includes('sugar') || text.includes('glucose') || text.includes('shugar')) {
    result.type = 'sugar';
    const numMatch = text.match(/\d{2,3}/);
    if (numMatch) {
      result.sugar = parseInt(numMatch[0], 10);
    }
    if (text.includes('fasting') || text.includes('khali pet') || text.includes('before')) {
      result.sugarContext = 'fasting';
    } else if (text.includes('after') || text.includes('post') || text.includes('khane ke baad')) {
      result.sugarContext = 'after_meal';
    } else {
      result.sugarContext = 'random';
    }
    return result;
  }

  // Detect Weight
  // e.g., "weight 72", "72 kg", "vajan 65"
  if (text.includes('weight') || text.includes('kg') || text.includes('kilo') || text.includes('vajan')) {
    result.type = 'weight';
    const numMatch = text.match(/(\d{2,3}(?:\.\d)?)/);
    if (numMatch) {
      result.weightKg = parseFloat(numMatch[1]);
    }
    return result;
  }

  // Fallback: look for two numbers (probably BP) or one number
  const numbers = text.match(/\b\d{2,3}\b/g);
  if (numbers && numbers.length >= 2) {
    result.type = 'bp';
    result.systolic = parseInt(numbers[0], 10);
    result.diastolic = parseInt(numbers[1], 10);
    if (numbers.length >= 3) {
      result.pulse = parseInt(numbers[2], 10);
    }
  } else if (numbers && numbers.length === 1) {
    const val = parseInt(numbers[0], 10);
    if (val < 40) {
      result.type = 'weight';
      result.weightKg = val;
    } else if (val >= 40 && val <= 130) {
      result.type = 'weight';
      result.weightKg = val;
    } else {
      result.type = 'sugar';
      result.sugar = val;
      result.sugarContext = 'random';
    }
  }

  return result;
}
