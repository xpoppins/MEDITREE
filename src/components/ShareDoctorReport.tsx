import { Activity, Calendar, Heart, Loader2, Printer, Scale, Share2, Shield, X } from 'lucide-react';
import React, { useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { usePreferences } from '../context/PreferencesContext';
import { Member, Medicine, Reading } from '../types';

interface ShareDoctorReportProps {
  member: Member;
  readings: Reading[];
  medicines: Medicine[];
  onClose: () => void;
}

export const ShareDoctorReport: React.FC<ShareDoctorReportProps> = ({
  member,
  readings,
  medicines,
  onClose,
}) => {
  const { language } = usePreferences();
  const [daysRange, setDaysRange] = useState<string>('30');
  const [sharing, setSharing] = useState(false);

  // Filter readings by selected days range
  const filteredReadings = readings.filter((r) => {
    if (daysRange === 'all') return true;
    const daysNum = Number(daysRange);
    const diffTime = Date.now() - new Date(r.takenAt).getTime();
    return diffTime <= daysNum * 86400000;
  });

  const bpReadings = filteredReadings.filter((r) => r.type === 'bp');
  const sugarReadings = filteredReadings.filter((r) => r.type === 'sugar');
  const weightReadings = filteredReadings.filter((r) => r.type === 'weight');

  const avgSys = bpReadings.length
    ? Math.round(bpReadings.reduce((s, r) => s + (r.systolic || 0), 0) / bpReadings.length)
    : null;
  const avgDia = bpReadings.length
    ? Math.round(bpReadings.reduce((s, r) => s + (r.diastolic || 0), 0) / bpReadings.length)
    : null;

  const fastingSugars = sugarReadings.filter((r) => r.sugarContext === 'fasting');
  const avgFasting = fastingSugars.length
    ? Math.round(fastingSugars.reduce((s, r) => s + (r.sugar || 0), 0) / fastingSugars.length)
    : null;

  const postMealSugars = sugarReadings.filter((r) => r.sugarContext === 'after_meal');
  const avgPostMeal = postMealSugars.length
    ? Math.round(postMealSugars.reduce((s, r) => s + (r.sugar || 0), 0) / postMealSugars.length)
    : null;

  const randomSugars = sugarReadings.filter((r) => r.sugarContext === 'random' || !r.sugarContext);
  const avgRandom = randomSugars.length
    ? Math.round(randomSugars.reduce((s, r) => s + (r.sugar || 0), 0) / randomSugars.length)
    : null;

  const latestWeight = weightReadings.length ? weightReadings[0].weightKg : null;

  const windowLabel = daysRange === 'all' ? 'All Time' : `Past ${daysRange} Days`;
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Generates dedicated, clean A4 printable document without UI chrome or clipping
  const generatePrintableHtml = () => {
    const bpTableRows = bpReadings.length > 0
      ? bpReadings
          .map((r, i) => `
            <tr style="background: ${i % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
              <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; font-weight: 600; white-space: nowrap;">
                ${new Date(r.takenAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; font-weight: 800; color: #0E1B2C;">
                ${r.systolic || '--'} / ${r.diastolic || '--'} <span style="font-size: 10px; font-weight: normal; color: #64748B;">mmHg</span>
              </td>
              <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; font-weight: 600;">
                ${r.pulse ? `${r.pulse} bpm` : '--'}
              </td>
              <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0;">
                <span style="display: inline-block; padding: 2px 7px; border-radius: 9999px; font-size: 9px; font-weight: 800; text-transform: uppercase; ${
                  r.status === 'green'
                    ? 'background: #E6F8F6; color: #0F766E;'
                    : r.status === 'amber'
                    ? 'background: #FEF3C7; color: #B45309;'
                    : 'background: #FEE2E2; color: #B91C1C;'
                }">
                  ${r.statusText || (r.status === 'green' ? 'Normal' : r.status === 'amber' ? 'Elevated' : 'High Alert')}
                </span>
              </td>
              <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; font-size: 10.5px; color: #64748B; font-style: italic;">
                ${r.note || '--'}
              </td>
            </tr>
          `)
          .join('')
      : `<tr><td colspan="5" style="padding: 14px; text-align: center; color: #94A3B8;">No blood pressure readings recorded in this time range.</td></tr>`;

    const sugarTableRows = sugarReadings.length > 0
      ? sugarReadings
          .map((r, i) => `
            <tr style="background: ${i % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
              <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; font-weight: 600; white-space: nowrap;">
                ${new Date(r.takenAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; font-weight: 800; color: #0E1B2C;">
                ${r.sugar || '--'} <span style="font-size: 10px; font-weight: normal; color: #64748B;">mg/dL</span>
              </td>
              <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; font-weight: 600; text-transform: capitalize;">
                ${r.sugarContext ? r.sugarContext.replace('_', ' ') : 'General / Random'}
              </td>
              <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0;">
                <span style="display: inline-block; padding: 2px 7px; border-radius: 9999px; font-size: 9px; font-weight: 800; text-transform: uppercase; ${
                  r.status === 'green'
                    ? 'background: #E6F8F6; color: #0F766E;'
                    : r.status === 'amber'
                    ? 'background: #FEF3C7; color: #B45309;'
                    : 'background: #FEE2E2; color: #B91C1C;'
                }">
                  ${r.statusText || (r.status === 'green' ? 'Normal' : r.status === 'amber' ? 'Watch' : 'High Alert')}
                </span>
              </td>
              <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; font-size: 10.5px; color: #64748B; font-style: italic;">
                ${r.note || '--'}
              </td>
            </tr>
          `)
          .join('')
      : `<tr><td colspan="5" style="padding: 14px; text-align: center; color: #94A3B8;">No blood sugar readings recorded in this time range.</td></tr>`;

    const medsList = medicines.length > 0
      ? medicines
          .map(
            (m) => `
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 6px 10px; border-radius: 6px; font-size: 11px;">
              <strong style="color: #0E1B2C;">${m.name}</strong> (${m.dose}) — 
              <span style="color: #64748B;">${m.times.join(', ')}</span> 
              ${m.instructions ? `<span style="color: #94A3B8; font-style: italic;">— ${m.instructions}</span>` : ''}
            </div>
          `
          )
          .join('')
      : '<p style="color: #94A3B8; font-size: 11px; margin: 4px 0;">No active medications documented.</p>';

    const conditionsBadges = member.conditions && member.conditions.length > 0
      ? member.conditions
          .map(
            (c) => `
            <span style="display: inline-block; background: #EEF2F6; color: #0E1B2C; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; border: 1px solid #CBD5E1;">
              ${c}
            </span>
          `
          )
          .join(' ')
      : '<span style="color: #94A3B8; font-size: 11px;">Routine Monitoring (None recorded)</span>';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Clinical Report - ${member.name} (${windowLabel})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #0E1B2C;
      background: #FFFFFF;
      font-size: 11.5px;
      line-height: 1.35;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0E1B2C;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #0E1B2C;
      margin: 0;
      letter-spacing: -0.3px;
    }
    .brand-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #FF6B4A;
      background: #FFF0E8;
      padding: 2px 6px;
      border-radius: 4px;
      margin-bottom: 3px;
    }
    .patient-card {
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .grid-5 {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-bottom: 12px;
    }
    .summary-card {
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid #CBD5E1;
    }
    .card-val {
      font-size: 17px;
      font-weight: 900;
      margin: 2px 0;
    }
    .card-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 12px 0 6px 0;
      color: #0E1B2C;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1.5px solid #E2E8F0;
      padding-bottom: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-bottom: 12px;
      page-break-inside: auto;
    }
    thead {
      display: table-header-group;
    }
    tr {
      page-break-inside: avoid;
    }
    th {
      background: #F1F5F9;
      color: #334155;
      font-weight: 800;
      text-align: left;
      padding: 6px 10px;
      border-bottom: 1.5px solid #CBD5E1;
      font-size: 9.5px;
      text-transform: uppercase;
    }
    .signature-area {
      border-top: 1.5px dashed #CBD5E1;
      padding-top: 10px;
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 10.5px;
      color: #64748B;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header-bar">
    <div>
      <span class="brand-badge">MEDITREE Clinical Health Record</span>
      <h1 class="brand-title">Doctor Consultation Summary</h1>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #475569;">
        Digital Family Health Log & Vitals Record
      </p>
    </div>
    <div style="text-align: right; font-size: 10.5px; color: #475569;">
      <p style="margin: 0;"><strong>Date:</strong> ${formattedDate}</p>
      <p style="margin: 2px 0 0 0; color: #FF6B4A; font-weight: 800;"><strong>Window:</strong> ${windowLabel}</p>
    </div>
  </div>

  <!-- PATIENT INFO CARD -->
  <div class="patient-card">
    <div>
      <div style="font-size: 15px; font-weight: 900; color: #0E1B2C;">${member.name}</div>
      <div style="font-size: 11px; color: #64748B; font-weight: 600; margin-top: 2px;">
        ${member.relation} &bull; ${member.gender} &bull; DOB: ${member.dob || '1958'} &bull; Height: ${member.heightCm || '168'} cm
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748B;">Documented Conditions</div>
      <div style="margin-top: 3px;">${conditionsBadges}</div>
    </div>
  </div>

  <!-- VITALS CLINICAL AVERAGES (Page 1 Top) -->
  <div class="grid-5">
    <!-- BP Avg -->
    <div class="summary-card" style="background: #FFF5F2; border-color: #FFD2C7;">
      <div class="card-label" style="color: #FF6B4A;">Blood Pressure Avg</div>
      <div class="card-val" style="color: #0E1B2C;">
        ${avgSys ? `${avgSys} / ${avgDia}` : '--'}
        <span style="font-size: 10px; font-weight: normal; color: #64748B;">mmHg</span>
      </div>
      <div style="font-size: 9.5px; color: #64748B; font-weight: 600;">
        From ${bpReadings.length} logs &bull; Target &lt; 120/80
      </div>
    </div>

    <!-- Fasting Sugar Avg -->
    <div class="summary-card" style="background: #E6F8F6; border-color: #A7F3D0;">
      <div class="card-label" style="color: #0F766E;">Fasting Sugar Avg</div>
      <div class="card-val" style="color: #0E1B2C;">
        ${avgFasting ? `${avgFasting}` : '--'}
        <span style="font-size: 10px; font-weight: normal; color: #64748B;">mg/dL</span>
      </div>
      <div style="font-size: 9.5px; color: #64748B; font-weight: 600;">
        Target: &lt; 100 mg/dL
      </div>
    </div>

    <!-- Post-Meal Sugar Avg -->
    <div class="summary-card" style="background: #F0FDF4; border-color: #BBF7D0;">
      <div class="card-label" style="color: #15803D;">Post-Meal Sugar Avg</div>
      <div class="card-val" style="color: #0E1B2C;">
        ${avgPostMeal ? `${avgPostMeal}` : '--'}
        <span style="font-size: 10px; font-weight: normal; color: #64748B;">mg/dL</span>
      </div>
      <div style="font-size: 9.5px; color: #64748B; font-weight: 600;">
        Target: &lt; 140 mg/dL
      </div>
    </div>

    <!-- Random Sugar Avg -->
    <div class="summary-card" style="background: #FAF5FF; border-color: #DDD6FE;">
      <div class="card-label" style="color: #7C3AED;">Random Sugar Avg</div>
      <div class="card-val" style="color: #0E1B2C;">
        ${avgRandom ? `${avgRandom}` : '--'}
        <span style="font-size: 10px; font-weight: normal; color: #64748B;">mg/dL</span>
      </div>
      <div style="font-size: 9.5px; color: #64748B; font-weight: 600;">
        Target: &lt; 140 mg/dL
      </div>
    </div>

    <!-- Weight -->
    <div class="summary-card" style="background: #EFF6FF; border-color: #BFDBFE;">
      <div class="card-label" style="color: #1D4ED8;">Latest Body Weight</div>
      <div class="card-val" style="color: #0E1B2C;">
        ${latestWeight ? `${latestWeight}` : '--'}
        <span style="font-size: 10px; font-weight: normal; color: #64748B;">kg</span>
      </div>
      <div style="font-size: 9.5px; color: #64748B; font-weight: 600;">
        Total Window Logs: ${filteredReadings.length}
      </div>
    </div>
  </div>

  <!-- CURRENT MEDICATIONS -->
  <div style="margin-bottom: 12px;">
    <div class="section-title">
      <span>Current Prescriptions & Active Medications</span>
      <span style="font-size: 10px; color: #64748B; font-weight: normal;">${medicines.length} listed</span>
    </div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
      ${medsList}
    </div>
  </div>

  <!-- SEPARATE TABLE 1: BLOOD PRESSURE & PULSE READINGS -->
  <div style="margin-top: 14px;">
    <div class="section-title">
      <span style="color: #FF6B4A;">1. Blood Pressure & Heart Rate (Pulse) Log</span>
      <span style="font-size: 10px; color: #64748B; font-weight: 700;">${bpReadings.length} records</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 22%;">Date & Time</th>
          <th style="width: 24%;">Blood Pressure</th>
          <th style="width: 15%;">Pulse</th>
          <th style="width: 18%;">Clinical Status</th>
          <th style="width: 21%;">Notes</th>
        </tr>
      </thead>
      <tbody>
        ${bpTableRows}
      </tbody>
    </table>
  </div>

  <!-- SEPARATE TABLE 2: BLOOD SUGAR (DIABETES) READINGS -->
  <div style="margin-top: 14px;">
    <div class="section-title">
      <span style="color: #0F766E;">2. Blood Sugar (Diabetes) Monitoring Log</span>
      <span style="font-size: 10px; color: #64748B; font-weight: 700;">${sugarReadings.length} records</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 22%;">Date & Time</th>
          <th style="width: 24%;">Blood Sugar</th>
          <th style="width: 18%;">Timing Context</th>
          <th style="width: 16%;">Status</th>
          <th style="width: 20%;">Notes</th>
        </tr>
      </thead>
      <tbody>
        ${sugarTableRows}
      </tbody>
    </table>
  </div>

  <!-- SIGNATURE & DISCLAIMER FOOTER -->
  <div class="signature-area">
    <div>
      <p style="margin: 0; font-size: 10px;">Recorded via MEDITREE Family Wellness Hub.</p>
      <p style="margin: 2px 0 0 0; font-size: 9.5px; color: #94A3B8;">
        Patient self-tracking record for physician review. Please confirm diagnostic targets with consulting doctor.
      </p>
    </div>
    <div style="text-align: right; min-width: 220px;">
      <p style="margin: 0 0 24px 0; font-size: 10px; color: #64748B;">Attending Physician Review:</p>
      <div style="border-top: 1px solid #475569; width: 100%; padding-top: 3px; font-weight: 800; font-size: 10px; color: #0E1B2C;">
        Doctor's Signature & Date
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  // Robust isolated iframe printing that never prints blank pages
  const handlePrint = () => {
    const printFrame = document.createElement('iframe');
    printFrame.setAttribute(
      'style',
      'position:fixed;visibility:hidden;width:0;height:0;border:0;right:0;bottom:0;'
    );
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!frameDoc) {
      window.print();
      return;
    }

    frameDoc.open();
    frameDoc.write(generatePrintableHtml());
    frameDoc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (err) {
        console.warn('Fallback to window.print', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 1500);
      }
    }, 250);
  };

  // Generates unclipped, high-resolution report card image with generous margins
  const handleShare = async () => {
    const exportNode = document.getElementById('doctor-share-card-export');
    if (!exportNode) return;

    setSharing(true);
    try {
      const isDark = document.documentElement.classList.contains('dark');
      
      // Allow DOM layout to stabilize
      await new Promise((r) => setTimeout(r, 60));

      const blob = await htmlToImage.toBlob(exportNode, {
        quality: 0.98,
        pixelRatio: 2,
        width: 800,
        height: exportNode.offsetHeight,
        backgroundColor: isDark ? '#0E1B2C' : '#FFFFFF',
        style: {
          transform: 'none',
          left: '0',
          top: '0',
          opacity: '1',
          visibility: 'visible',
        },
      });

      if (!blob) throw new Error('Could not generate card image');

      const fileName = `MEDITREE_Report_${member.name.replace(/\s+/g, '_')}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const summaryText = `📋 MEDITREE Clinical Summary: ${member.name} (${member.relation})
🗓️ Period: ${windowLabel}
❤️ BP Average: ${avgSys ? `${avgSys}/${avgDia} mmHg` : 'N/A'} (${bpReadings.length} logs)
🩸 Fasting Sugar Avg: ${avgFasting ? `${avgFasting} mg/dL` : 'N/A'}
🍽️ Post-Meal Sugar Avg: ${avgPostMeal ? `${avgPostMeal} mg/dL` : 'N/A'}
⚡ Random Sugar Avg: ${avgRandom ? `${avgRandom} mg/dL` : 'N/A'}
⚖️ Weight: ${latestWeight ? `${latestWeight} kg` : 'N/A'}
💊 Active Medications: ${medicines.map((m) => m.name).join(', ') || 'None'}
Generated via MEDITREE Family Wellness.`;

      // If browser supports sharing files (e.g. mobile WhatsApp, Telegram, etc.)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `MEDITREE Doctor Report - ${member.name}`,
          text: summaryText,
        });
      } else if (navigator.share) {
        // Fallback for browsers supporting Web Share API text only
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        await navigator.share({
          title: `MEDITREE Doctor Report - ${member.name}`,
          text: summaryText,
        });
      } else {
        // Fallback for desktop: download unclipped image and copy summary text
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        navigator.clipboard.writeText(summaryText);
        alert(
          language === 'hi'
            ? 'रिपोर्ट कार्ड की इमेज डाउनलोड हो गई है और सारांश कॉपी हो गया है! आप इसे व्हाट्सएप या किसी भी ऐप पर शेयर कर सकते हैं।'
            : 'Report card image downloaded & summary text copied! You can share it to WhatsApp or any external app.'
        );
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing report card image:', err);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0E1B2C] rounded-[28px] border-2 border-[#0E1B2C]/20 dark:border-white/10 shadow-2xl p-5 md:p-7 relative my-auto max-h-[90vh] overflow-y-auto">
        {/* Actions bar */}
        <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-black/10 dark:border-white/10 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-[#0E1B2C] dark:bg-white text-white dark:text-[#0E1B2C] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'hi' ? 'प्रिंट / पीडीएफ (Print / PDF)' : 'Print / Export PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="py-2.5 px-4 rounded-xl bg-[#12B5A6] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-60"
            >
              {sharing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>
                {sharing
                  ? language === 'hi'
                    ? 'इमेज तैयार हो रही है...'
                    : 'Generating Card...'
                  : language === 'hi'
                  ? 'रिपोर्ट कार्ड शेयर करें'
                  : 'Share Report Card'}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F4F6F9] dark:bg-[#17263A] flex items-center justify-center text-[#0E1B2C] dark:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TIME RANGE SELECTOR */}
        <div className="mb-5 p-3 rounded-2xl bg-[#F4F6F9] dark:bg-[#17263A] border border-black/8 dark:border-white/10 flex items-center justify-between gap-2 flex-wrap no-print">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF6B4A]" />
            <span className="text-xs font-black text-[#0E1B2C] dark:text-white">
              {language === 'hi' ? 'समय अवधि चुनें:' : 'Select Time Range:'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: '7', label: '7 Days' },
              { id: '15', label: '15 Days' },
              { id: '30', label: '30 Days' },
              { id: '90', label: '90 Days' },
              { id: 'all', label: 'All Time' },
            ].map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => setDaysRange(range.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  daysRange === range.id
                    ? 'bg-[#FF6B4A] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0E1B2C] text-[#7E90A5] hover:text-[#0E1B2C] dark:hover:text-white border border-black/10 dark:border-white/10'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* CLINICAL DOCTOR REPORT BODY (ON-SCREEN PREVIEW) */}
        <div className="space-y-5 text-left" id="doctor-printable-area">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B4A] bg-[#FFF0E8] dark:bg-[#FF6B4A]/20 px-2 py-0.5 rounded-md">
                MEDITREE Clinical Summary
              </span>
              <h2 className="text-2xl font-black text-[#0E1B2C] dark:text-white font-heading mt-1">
                {member.name}
              </h2>
              <p className="text-xs font-bold text-[#7E90A5] dark:text-[#A0B2C6]">
                {member.relation} • {member.gender} • Born {member.dob || '1958'} • Height: {member.heightCm || '168'} cm
              </p>
            </div>
            <div className="text-right text-[11px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] shrink-0 whitespace-nowrap">
              <p>Generated: {formattedDate}</p>
              <p className="text-[#FF6B4A] font-black">Window: {windowLabel}</p>
            </div>
          </div>

          {/* Vitals Averages Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {/* BP Average */}
            <div className="p-3.5 rounded-2xl bg-[#FFF5F2] dark:bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 dark:border-[#FF6B4A]/30">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#FF6B4A]">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>BP Average</span>
              </div>
              <p className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading mt-1">
                {avgSys ? `${avgSys}/${avgDia}` : 'N/A'}
                <span className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] ml-0.5">mmHg</span>
              </p>
              <p className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5">
                {bpReadings.length} readings logged
              </p>
            </div>

            {/* Fasting Sugar Average */}
            <div className="p-3.5 rounded-2xl bg-[#E6F8F6] dark:bg-[#12B5A6]/10 border border-[#12B5A6]/20 dark:border-[#12B5A6]/30">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#12B5A6]">
                <Activity className="w-3.5 h-3.5" />
                <span>Fasting Sugar</span>
              </div>
              <p className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading mt-1">
                {avgFasting ? `${avgFasting}` : 'N/A'}
                <span className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] ml-0.5">mg/dL</span>
              </p>
              <p className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5">
                Target: &lt; 100 mg/dL
              </p>
            </div>

            {/* Post Meal Sugar */}
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#1FA971]/10 border border-[#1FA971]/20 dark:border-[#1FA971]/30">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1FA971]">
                <Activity className="w-3.5 h-3.5" />
                <span>Post-Meal Avg</span>
              </div>
              <p className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading mt-1">
                {avgPostMeal ? `${avgPostMeal}` : 'N/A'}
                <span className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] ml-0.5">mg/dL</span>
              </p>
              <p className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5">
                Target: &lt; 140 mg/dL
              </p>
            </div>

            {/* Random Sugar Average */}
            <div className="p-3.5 rounded-2xl bg-[#FAF5FF] dark:bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 dark:border-[#8B5CF6]/30">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#7C3AED] dark:text-[#A78BFA]">
                <Activity className="w-3.5 h-3.5" />
                <span>Random Sugar</span>
              </div>
              <p className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading mt-1">
                {avgRandom ? `${avgRandom}` : 'N/A'}
                <span className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] ml-0.5">mg/dL</span>
              </p>
              <p className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5">
                Target: &lt; 140 mg/dL
              </p>
            </div>

            {/* Weight */}
            <div className="p-3.5 rounded-2xl bg-[#EFF6FF] dark:bg-[#3B82F6]/10 border border-[#3B82F6]/20 dark:border-[#3B82F6]/30">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#3B82F6]">
                <Scale className="w-3.5 h-3.5" />
                <span>Latest Weight</span>
              </div>
              <p className="text-xl font-black text-[#0E1B2C] dark:text-white font-heading mt-1">
                {latestWeight ? `${latestWeight}` : 'N/A'}
                <span className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] ml-0.5">kg</span>
              </p>
              <p className="text-[10px] font-bold text-[#7E90A5] dark:text-[#A0B2C6] mt-0.5">
                Total Logs: {filteredReadings.length}
              </p>
            </div>
          </div>

          {/* Documented Chronic Conditions */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#7E90A5] dark:text-[#A0B2C6] mb-1.5">
              Documented Health Conditions
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {member.conditions.length ? (
                member.conditions.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-lg bg-[#F4F6F9] dark:bg-[#17263A] border border-black/10 dark:border-white/10 text-xs font-black text-[#0E1B2C] dark:text-white"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#7E90A5] dark:text-[#A0B2C6]">Routine Monitoring (None recorded)</span>
              )}
            </div>
          </div>

          {/* Current Prescriptions & Medications */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#7E90A5] dark:text-[#A0B2C6] mb-1.5">
              Current Medications & Prescriptions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {medicines.length === 0 ? (
                <p className="text-xs text-[#7E90A5] dark:text-[#A0B2C6] italic">No active medications added.</p>
              ) : (
                medicines.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-[#F9FBFC] dark:bg-[#17263A] border border-black/8 dark:border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-black text-[#0E1B2C] dark:text-white">{m.name}</span>{' '}
                      <span className="font-bold text-[#FF6B4A]">({m.dose})</span>
                      <p className="text-[10px] text-[#7E90A5] dark:text-[#A0B2C6]">{m.instructions}</p>
                    </div>
                    <span className="font-bold text-[#0E1B2C] dark:text-white">{m.times.join(', ')}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SEPARATE TABLE 1: BLOOD PRESSURE READINGS */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B4A] font-heading flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>1. Blood Pressure & Heart Rate (Pulse) Log</span>
              </h4>
              <span className="text-[11px] font-bold text-[#7E90A5]">
                {bpReadings.length} readings
              </span>
            </div>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-x-auto text-xs">
              <table className="w-full min-w-[500px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#FFF5F2] dark:bg-[#FF6B4A]/10 text-[#FF6B4A] font-black text-[10.5px]">
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">Blood Pressure</th>
                    <th className="p-2.5">Pulse</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/8 dark:divide-white/8 font-medium">
                  {bpReadings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-[#7E90A5]">
                        No blood pressure readings recorded in this window.
                      </td>
                    </tr>
                  ) : (
                    bpReadings.map((r) => (
                      <tr key={r.id} className="hover:bg-black/2 dark:hover:bg-white/5">
                        <td className="p-2.5 text-[#0E1B2C] dark:text-white font-bold whitespace-nowrap">
                          {new Date(r.takenAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-2.5 font-black text-[#0E1B2C] dark:text-white whitespace-nowrap">
                          {r.systolic}/{r.diastolic} <span className="text-[10px] text-[#7E90A5]">mmHg</span>
                        </td>
                        <td className="p-2.5 text-[#0E1B2C] dark:text-white font-semibold">
                          {r.pulse ? `${r.pulse} bpm` : '--'}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              r.status === 'green'
                                ? 'bg-[#E6F8F6] text-[#12B5A6]'
                                : r.status === 'amber'
                                ? 'bg-[#FFF0E8] text-[#FFB020]'
                                : 'bg-[#FEECEE] text-[#E5484D]'
                            }`}
                          >
                            {r.statusText || (r.status === 'green' ? 'Normal' : r.status === 'amber' ? 'Elevated' : 'High Alert')}
                          </span>
                        </td>
                        <td className="p-2.5 text-[#7E90A5] dark:text-[#A0B2C6] italic">
                          {r.note || '---'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SEPARATE TABLE 2: BLOOD SUGAR (DIABETES) READINGS */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#12B5A6] font-heading flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>2. Blood Sugar (Diabetes) Monitoring Log</span>
              </h4>
              <span className="text-[11px] font-bold text-[#7E90A5]">
                {sugarReadings.length} readings
              </span>
            </div>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-x-auto text-xs">
              <table className="w-full min-w-[500px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#E6F8F6] dark:bg-[#12B5A6]/10 text-[#12B5A6] font-black text-[10.5px]">
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">Sugar Value</th>
                    <th className="p-2.5">Timing Context</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/8 dark:divide-white/8 font-medium">
                  {sugarReadings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-[#7E90A5]">
                        No blood sugar readings recorded in this window.
                      </td>
                    </tr>
                  ) : (
                    sugarReadings.map((r) => (
                      <tr key={r.id} className="hover:bg-black/2 dark:hover:bg-white/5">
                        <td className="p-2.5 text-[#0E1B2C] dark:text-white font-bold whitespace-nowrap">
                          {new Date(r.takenAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-2.5 font-black text-[#0E1B2C] dark:text-white whitespace-nowrap">
                          {r.sugar} <span className="text-[10px] text-[#7E90A5]">mg/dL</span>
                        </td>
                        <td className="p-2.5 font-semibold text-[#0E1B2C] dark:text-white capitalize">
                          {r.sugarContext ? r.sugarContext.replace('_', ' ') : 'General / Random'}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              r.status === 'green'
                                ? 'bg-[#E6F8F6] text-[#12B5A6]'
                                : r.status === 'amber'
                                ? 'bg-[#FFF0E8] text-[#FFB020]'
                                : 'bg-[#FEECEE] text-[#E5484D]'
                            }`}
                          >
                            {r.statusText || (r.status === 'green' ? 'Normal' : r.status === 'amber' ? 'Watch' : 'High Alert')}
                          </span>
                        </td>
                        <td className="p-2.5 text-[#7E90A5] dark:text-[#A0B2C6] italic">
                          {r.note || '---'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Signature Area */}
          <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] text-[#7E90A5] dark:text-[#A0B2C6]">
            <div>
              <p className="font-semibold">Recorded via MEDITREE Health Management.</p>
              <p className="text-[10px]">For self-tracking & doctor consultation.</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#0E1B2C] dark:text-white">Doctor's Sign & Date:</p>
              <p className="font-mono mt-1 text-[#7E90A5]">_________________________</p>
            </div>
          </div>
        </div>

        {/* 
          DEDICATED OFF-SCREEN CARD FOR IMAGE EXPORT / SHARING:
          - Width: exactly 800px with 32px padding on all sides (effective content width = 736px)
          - Explicit table-layout: fixed with column percentage widths totaling exactly 100%
          - Explicit CSS Grid column definitions (never depends on mobile media queries)
          - Generous right margins so NO text or table borders ever get cut off!
        */}
        <div
          id="doctor-share-card-export"
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: '800px',
            minWidth: '800px',
            maxWidth: '800px',
            boxSizing: 'border-box',
            padding: '32px',
            borderRadius: '24px',
            margin: 0,
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            color: '#0E1B2C',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            zIndex: -9999,
            pointerEvents: 'none',
          }}
          className="dark:bg-[#0E1B2C] dark:text-white"
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: '#FF6B4A',
                  background: '#FFF0E8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                MEDITREE Clinical Summary
              </span>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  margin: '4px 0 2px 0',
                  color: 'inherit',
                  letterSpacing: '-0.3px',
                }}
              >
                {member.name}
              </h2>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                {member.relation} &bull; {member.gender} &bull; Born {member.dob || '1958'} &bull; Height: {member.heightCm || '168'} cm
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <p style={{ margin: 0 }}>Generated: {formattedDate}</p>
              <p style={{ margin: '3px 0 0 0', color: '#FF6B4A', fontWeight: 900 }}>Window: {windowLabel}</p>
            </div>
          </div>

          {/* Vitals Summary 5-Column Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            {/* BP Average */}
            <div
              style={{
                padding: '12px 10px',
                borderRadius: '16px',
                background: '#FFF5F2',
                border: '1px solid #FFD2C7',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: 800, color: '#FF6B4A' }}>
                <Heart style={{ width: '13px', height: '13px', fill: 'currentColor' }} />
                <span>BP Average</span>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#0E1B2C', margin: '4px 0 2px 0' }}>
                {avgSys ? `${avgSys}/${avgDia}` : 'N/A'}
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', marginLeft: '3px' }}>mmHg</span>
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>
                {bpReadings.length} readings logged
              </div>
            </div>

            {/* Fasting Sugar Average */}
            <div
              style={{
                padding: '12px 10px',
                borderRadius: '16px',
                background: '#E6F8F6',
                border: '1px solid #A7F3D0',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: 800, color: '#0F766E' }}>
                <Activity style={{ width: '13px', height: '13px' }} />
                <span>Fasting Sugar</span>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#0E1B2C', margin: '4px 0 2px 0' }}>
                {avgFasting ? `${avgFasting}` : 'N/A'}
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', marginLeft: '3px' }}>mg/dL</span>
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>
                Target: &lt; 100 mg/dL
              </div>
            </div>

            {/* Post Meal Sugar */}
            <div
              style={{
                padding: '12px 10px',
                borderRadius: '16px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: 800, color: '#15803D' }}>
                <Activity style={{ width: '13px', height: '13px' }} />
                <span>Post-Meal Avg</span>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#0E1B2C', margin: '4px 0 2px 0' }}>
                {avgPostMeal ? `${avgPostMeal}` : 'N/A'}
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', marginLeft: '3px' }}>mg/dL</span>
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>
                Target: &lt; 140 mg/dL
              </div>
            </div>

            {/* Random Sugar */}
            <div
              style={{
                padding: '12px 10px',
                borderRadius: '16px',
                background: '#FAF5FF',
                border: '1px solid #DDD6FE',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: 800, color: '#7C3AED' }}>
                <Activity style={{ width: '13px', height: '13px' }} />
                <span>Random Sugar</span>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#0E1B2C', margin: '4px 0 2px 0' }}>
                {avgRandom ? `${avgRandom}` : 'N/A'}
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', marginLeft: '3px' }}>mg/dL</span>
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>
                Target: &lt; 140 mg/dL
              </div>
            </div>

            {/* Weight */}
            <div
              style={{
                padding: '12px 10px',
                borderRadius: '16px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: 800, color: '#1D4ED8' }}>
                <Scale style={{ width: '13px', height: '13px' }} />
                <span>Latest Weight</span>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#0E1B2C', margin: '4px 0 2px 0' }}>
                {latestWeight ? `${latestWeight}` : 'N/A'}
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', marginLeft: '3px' }}>kg</span>
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>
                Total Logs: {filteredReadings.length}
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', marginBottom: '6px' }}>
              Documented Health Conditions
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {member.conditions.length ? (
                member.conditions.map((c) => (
                  <span
                    key={c}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '8px',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#0E1B2C',
                    }}
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '11px', color: '#64748B' }}>Routine Monitoring (None recorded)</span>
              )}
            </div>
          </div>

          {/* Medications */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', marginBottom: '6px' }}>
              Current Medications & Prescriptions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {medicines.length === 0 ? (
                <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>No active medications added.</p>
              ) : (
                medicines.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 900, color: '#0E1B2C' }}>{m.name}</span>{' '}
                      <span style={{ fontWeight: 800, color: '#FF6B4A' }}>({m.dose})</span>
                      {m.instructions && (
                        <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: '#64748B' }}>{m.instructions}</p>
                      )}
                    </div>
                    <span style={{ fontWeight: 800, color: '#0E1B2C', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {m.times.join(', ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TABLE 1: BLOOD PRESSURE LOG */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#FF6B4A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Heart style={{ width: '14px', height: '14px', fill: 'currentColor' }} />
                <span>1. Blood Pressure & Heart Rate (Pulse) Log</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>
                {bpReadings.length} readings
              </span>
            </div>

            <div style={{ borderRadius: '14px', border: '1px solid #CBD5E1', overflow: 'hidden' }}>
              <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#FFF5F2', color: '#FF6B4A', fontWeight: 900, fontSize: '10.5px', borderBottom: '1px solid #FFD2C7' }}>
                    <th style={{ padding: '8px 10px' }}>Date & Time</th>
                    <th style={{ padding: '8px 10px' }}>Blood Pressure</th>
                    <th style={{ padding: '8px 10px' }}>Pulse</th>
                    <th style={{ padding: '8px 10px' }}>Status</th>
                    <th style={{ padding: '8px 10px' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {bpReadings.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontStyle: 'italic' }}>
                        No blood pressure readings recorded in this window.
                      </td>
                    </tr>
                  ) : (
                    bpReadings.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '7px 10px', fontWeight: 700, color: '#0E1B2C', whiteSpace: 'nowrap' }}>
                          {new Date(r.takenAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 900, color: '#0E1B2C', whiteSpace: 'nowrap' }}>
                          {r.systolic}/{r.diastolic} <span style={{ fontSize: '9.5px', fontWeight: 'normal', color: '#64748B' }}>mmHg</span>
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 700, color: '#0E1B2C' }}>
                          {r.pulse ? `${r.pulse} bpm` : '--'}
                        </td>
                        <td style={{ padding: '7px 10px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '9.5px',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              background: r.status === 'green' ? '#E6F8F6' : r.status === 'amber' ? '#FFF0E8' : '#FEECEE',
                              color: r.status === 'green' ? '#0F766E' : r.status === 'amber' ? '#B45309' : '#B91C1C',
                            }}
                          >
                            {r.statusText || (r.status === 'green' ? 'Normal' : r.status === 'amber' ? 'Elevated' : 'High Alert')}
                          </span>
                        </td>
                        <td style={{ padding: '7px 10px', color: '#64748B', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.note || '--'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 2: BLOOD SUGAR (DIABETES) LOG */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0F766E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity style={{ width: '14px', height: '14px' }} />
                <span>2. Blood Sugar (Diabetes) Monitoring Log</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>
                {sugarReadings.length} readings
              </span>
            </div>

            <div style={{ borderRadius: '14px', border: '1px solid #CBD5E1', overflow: 'hidden' }}>
              <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#E6F8F6', color: '#0F766E', fontWeight: 900, fontSize: '10.5px', borderBottom: '1px solid #A7F3D0' }}>
                    <th style={{ padding: '8px 10px' }}>Date & Time</th>
                    <th style={{ padding: '8px 10px' }}>Sugar Value</th>
                    <th style={{ padding: '8px 10px' }}>Timing Context</th>
                    <th style={{ padding: '8px 10px' }}>Status</th>
                    <th style={{ padding: '8px 10px' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sugarReadings.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontStyle: 'italic' }}>
                        No blood sugar readings recorded in this window.
                      </td>
                    </tr>
                  ) : (
                    sugarReadings.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '7px 10px', fontWeight: 700, color: '#0E1B2C', whiteSpace: 'nowrap' }}>
                          {new Date(r.takenAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 900, color: '#0E1B2C', whiteSpace: 'nowrap' }}>
                          {r.sugar} <span style={{ fontSize: '9.5px', fontWeight: 'normal', color: '#64748B' }}>mg/dL</span>
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 700, color: '#0E1B2C', textTransform: 'capitalize' }}>
                          {r.sugarContext ? r.sugarContext.replace('_', ' ') : 'General / Random'}
                        </td>
                        <td style={{ padding: '7px 10px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '9.5px',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              background: r.status === 'green' ? '#E6F8F6' : r.status === 'amber' ? '#FFF0E8' : '#FEECEE',
                              color: r.status === 'green' ? '#0F766E' : r.status === 'amber' ? '#B45309' : '#B91C1C',
                            }}
                          >
                            {r.statusText || (r.status === 'green' ? 'Normal' : r.status === 'amber' ? 'Watch' : 'High Alert')}
                          </span>
                        </td>
                        <td style={{ padding: '7px 10px', color: '#64748B', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.note || '--'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Signature & Disclaimer Footer */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid #CBD5E1',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#64748B',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#0E1B2C' }}>Recorded via MEDITREE Health Management.</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#94A3B8' }}>Patient self-tracking record for physician review & consultation.</p>
            </div>
            <div style={{ textAlign: 'right', minWidth: '220px' }}>
              <p style={{ margin: '0 0 16px 0', fontWeight: 800, color: '#0E1B2C' }}>Doctor's Sign & Date:</p>
              <div style={{ borderTop: '1.5px solid #475569', width: '100%', paddingTop: '3px' }}>
                <span style={{ fontSize: '9.5px', color: '#94A3B8', fontStyle: 'italic' }}>Signature & Clinic Stamp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
