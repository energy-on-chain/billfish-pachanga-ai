import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { currentCentralTimestamp } from './utils/formatCentralDateTime';

// Admin-adjustable on the Close Calls tab; these are just the initial values.
export const CLOSE_CALLS_DEFAULT_THRESHOLDS = {
  points: 250,   // leaderboard/pot categories scored by summed points
  weight: 2,     // meatfish pots, scored by heaviest qualifying fish (lbs)
  length: 2,     // tiebreak margin when weight is exactly tied (in)
  time: 3,       // hours - Grand Slam completion gap, and tiebreak-by-catch-time gap
};

// A category is only worth flagging if teams are tightly packed - this caps
// how many rows the printed report will hold so it stays to one page. Flags
// are sorted by urgency first, so anything cut is the least urgent.
const MAX_PDF_ROWS = 30;

const formatPlace = (num) => {
  const j = num % 10, k = num % 100;
  if (j === 1 && k !== 11) return `${num}st`;
  if (j === 2 && k !== 12) return `${num}nd`;
  if (j === 3 && k !== 13) return `${num}rd`;
  return `${num}th`;
};

// Pot tiers share a base category name with a "($X,XXX)" buy-in suffix,
// e.g. "Dorado ($500)" / "Dorado ($1,000)" - strip it to group tiers that
// flag the same pair of teams under one report line.
const stripPotTierSuffix = (title) => title.replace(/\s*\(\$[\d,]+\)\s*$/, '').trim();

const round2 = (n) => Math.round(n * 100) / 100;

const hoursBetween = (a, b) => {
  if (!a || !b) return null;
  const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  if (isNaN(diff)) return null;
  return diff / (1000 * 60 * 60);
};

// Grand Slam standings don't carry a single rank value - a team's place is
// determined by the latest of their three qualifying catch times.
const grandSlamCompletionTime = (row) => {
  const times = [row.firstCatchBlueMarlin, row.firstCatchWhiteMarlin, row.firstCatchSailfish]
    .filter(Boolean)
    .map((t) => new Date(t).getTime())
    .filter((t) => !isNaN(t));
  if (times.length === 0) return null;
  return new Date(Math.max(...times)).toISOString();
};

// Infer how a category is scored from the shape of its rows, rather than a
// hardcoded per-category map - stays correct automatically if config changes.
const detectMetricType = (row) => {
  if (!row) return null;
  if (row.weight !== undefined) return 'weight';
  if (row.tagCount !== undefined) return 'count';
  if (row.firstCatchBlueMarlin !== undefined) return 'time';
  if (row.points !== undefined) return 'points';
  return null;
};

const makeFlag = (group, categoryTitle, a, b, critical, kind, detail) => ({
  group,                    // 'leaderboard' | 'pots'
  categoryTitle,
  tiers: [categoryTitle],   // pot tiers get merged into this during consolidation
  placeA: a.place,
  teamA: a.team,
  placeB: b.place,
  teamB: b.team,
  critical,                 // straddles the paying/trophy cutoff
  kind,                     // 'tie' (already resolved by a tiebreak) | 'margin' (still open)
  detail,
  // Sort key - ties always outrank margin calls; smaller gaps sort first.
  urgency: kind === 'tie' ? -1 : (detail.gapValue ?? 0),
});

// Walks a category's full, sorted standings and flags every adjacent pair
// that's within threshold, or exactly tied and thus already decided by a
// tiebreak. cutoffPlace is the last paying/trophy place, if known.
const analyzeCategory = (group, categoryTitle, rows, thresholds, cutoffPlace) => {
  const flags = [];
  if (!rows || rows.length < 2) return flags;

  const type = detectMetricType(rows[0]);
  if (!type) return flags;

  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i];
    const b = rows[i + 1];
    const critical = cutoffPlace != null && a.place === cutoffPlace && b.place === cutoffPlace + 1;

    if (type === 'points') {
      const gap = a.points - b.points;
      if (gap === 0) {
        const tGap = hoursBetween(a.lastCatch, b.lastCatch);
        const detail = tGap !== null
          ? `Tied at ${a.points} pts - decided by catch time, ${tGap.toFixed(1)}h apart`
          : `Tied at ${a.points} pts - decided by catch time (time not recorded for one team)`;
        flags.push(makeFlag(group, categoryTitle, a, b, critical, 'tie', { text: detail, gapValue: tGap ?? 0 }));
      } else if (gap <= thresholds.points) {
        flags.push(makeFlag(group, categoryTitle, a, b, critical, 'margin', { text: `${gap} pt${gap === 1 ? '' : 's'} apart (${a.points} vs ${b.points})`, gapValue: gap }));
      }
    } else if (type === 'weight') {
      const wGap = round2(a.weight - b.weight);
      if (wGap === 0) {
        const lGap = round2(Math.abs((a.length || 0) - (b.length || 0)));
        if (lGap === 0) {
          flags.push(makeFlag(group, categoryTitle, a, b, critical, 'tie', { text: `Tied at ${a.weight} lbs and ${a.length ?? '-'} in - decided by girth (${a.girth ?? '-'} vs ${b.girth ?? '-'} in)`, gapValue: 0 }));
        } else if (lGap <= thresholds.length) {
          flags.push(makeFlag(group, categoryTitle, a, b, critical, 'tie', { text: `Tied at ${a.weight} lbs - decided by length, ${lGap} in apart`, gapValue: lGap }));
        }
      } else if (wGap <= thresholds.weight) {
        flags.push(makeFlag(group, categoryTitle, a, b, critical, 'margin', { text: `${wGap} lb${wGap === 1 ? '' : 's'} apart (${a.weight} vs ${b.weight})`, gapValue: wGap }));
      }
    } else if (type === 'time') {
      const aTime = grandSlamCompletionTime(a);
      const bTime = grandSlamCompletionTime(b);
      const tGap = hoursBetween(aTime, bTime);
      if (tGap !== null && tGap <= thresholds.time) {
        flags.push(makeFlag(group, categoryTitle, a, b, critical, 'margin', { text: `${tGap.toFixed(1)}h apart completing the Grand Slam`, gapValue: tGap }));
      }
    } else if (type === 'count') {
      const cGap = a.tagCount - b.tagCount;
      if (cGap === 0) {
        const tGap = hoursBetween(a.lastTag, b.lastTag);
        const detail = tGap !== null
          ? `Tied at ${a.tagCount} tags - decided by tag time, ${tGap.toFixed(1)}h apart`
          : `Tied at ${a.tagCount} tags - decided by tag time (time not recorded for one team)`;
        flags.push(makeFlag(group, categoryTitle, a, b, critical, 'tie', { text: detail, gapValue: tGap ?? 0 }));
      } else if (cGap <= 1) {
        // Counts are small whole numbers (tags per team) - a fixed 1-tag
        // margin is the meaningful "close" threshold here, not user-tunable.
        flags.push(makeFlag(group, categoryTitle, a, b, critical, 'margin', { text: `${cGap} tag apart (${a.tagCount} vs ${b.tagCount})`, gapValue: cGap }));
      }
    }
  }
  return flags;
};

// Merges flags from pot tiers that share a base title, same team pair, and
// same finding into one line noting every affected tier, instead of
// repeating the identical pair 2-3 times (Dorado $500/$1,000/$1,500, etc).
const consolidatePotFlags = (flags) => {
  const map = new Map();
  flags.forEach((f) => {
    const baseTitle = stripPotTierSuffix(f.categoryTitle);
    const key = `${baseTitle}|${f.teamA}|${f.teamB}|${f.kind}|${f.detail.text}`;
    if (!map.has(key)) {
      map.set(key, { ...f, categoryTitle: baseTitle, tiers: [f.tiers[0]] });
    } else {
      const existing = map.get(key);
      existing.tiers.push(f.tiers[0]);
      existing.critical = existing.critical || f.critical;
    }
  });
  return Array.from(map.values());
};

const sortFlags = (flags) => {
  return [...flags].sort((a, b) => {
    if (a.critical !== b.critical) return a.critical ? -1 : 1;
    return a.urgency - b.urgency;
  });
};

// Fetches full standings (isReport: true) for every leaderboard and pot
// category, using the exact same endpoints and query-building the
// Leaderboard/Pots pages already use, then flags close calls in each.
// Nothing about how standings are computed is duplicated here.
export const computeCloseCalls = async (year, config, thresholds) => {
  const apiUrl = import.meta.env.VITE_NODE_ENV === 'production'
    ? import.meta.env.VITE_SERVER_URL_PRODUCTION
    : import.meta.env.VITE_SERVER_URL_STAGING;

  const {
    generalConfig: { CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME, CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME },
    leaderboardConfig: { CONFIG_LEADERBOARD_CATEGORIES },
    potsConfig: { CONFIG_POTS_CATEGORIES },
  } = config;

  // Trophy-count and pot-split admin overrides, same as the Awards/Pot
  // Splits tabs, so the cutoff line used here matches what's actually live.
  let awardsOverrides = {};
  let potConfigOverrides = {};
  try {
    const [awardsRes, potConfigRes] = await Promise.all([
      fetch(`${apiUrl}/api/${year}/admin_get_awards_config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }),
      fetch(`${apiUrl}/api/${year}/admin_get_pot_config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }),
    ]);
    if (awardsRes.ok) awardsOverrides = await awardsRes.json();
    if (potConfigRes.ok) potConfigOverrides = await potConfigRes.json();
  } catch (e) {
    console.warn('Could not fetch awards/pot config overrides for close calls report:', e);
  }

  // Leaderboard categories
  const leaderboardQueries = CONFIG_LEADERBOARD_CATEGORIES.map((item) => {
    const bodyData = { catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME, isReport: true };
    (item.inputs || []).forEach((input) => Object.keys(input).forEach((p) => { bodyData[p] = input[p]; }));
    const cutoff = awardsOverrides[item.title]?.numAwards ?? item.numTrophies;
    return { url: item.url, title: item.title, body: JSON.stringify(bodyData), cutoff };
  });

  // Pot categories
  const potQueries = CONFIG_POTS_CATEGORIES.map((item) => {
    const payoutStructure = potConfigOverrides[item.potName]?.payoutStructure || item.payoutStructure;
    const bodyData = {
      catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
      potYear: CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,
      isReport: true,
      potName: item.potName,
      entryAmount: item.entryAmount,
      tournamentCut: item.tournamentCut,
      payoutStructure,
    };
    (item.inputs || []).forEach((input) => Object.keys(input).forEach((p) => { bodyData[p] = input[p]; }));
    const cutoff = Object.values(payoutStructure).filter((v) => parseFloat(v) > 0).length;
    return { url: item.url, title: item.title, body: JSON.stringify(bodyData), cutoff };
  });

  const [leaderboardResults, potResults] = await Promise.all([
    Promise.all(leaderboardQueries.map((q) =>
      fetch(`${apiUrl}/api/${year}/${q.url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: q.body })
        .then((r) => r.json())
        .then((result) => ({ title: q.title, cutoff: q.cutoff, rows: Array.isArray(result) ? result : [] }))
        .catch(() => ({ title: q.title, cutoff: q.cutoff, rows: [] }))
    )),
    Promise.all(potQueries.map((q) =>
      fetch(`${apiUrl}/api/${year}/${q.url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: q.body })
        .then((r) => r.json())
        .then((result) => ({ title: q.title, cutoff: q.cutoff, rows: (result.noQualifyingEntrants || !Array.isArray(result)) ? [] : result }))
        .catch(() => ({ title: q.title, cutoff: q.cutoff, rows: [] }))
    )),
  ]);

  const leaderboardFlags = leaderboardResults.flatMap((r) => analyzeCategory('leaderboard', r.title, r.rows, thresholds, r.cutoff));
  const potFlagsRaw = potResults.flatMap((r) => analyzeCategory('pots', r.title, r.rows, thresholds, r.cutoff));
  const potFlags = consolidatePotFlags(potFlagsRaw);

  const allFlags = sortFlags([...leaderboardFlags, ...potFlags]);

  return {
    year,
    generatedAt: new Date().toISOString(),
    thresholds,
    leaderboardFlags: sortFlags(leaderboardFlags),
    potFlags: sortFlags(potFlags),
    totalFlagged: allFlags.length,
    pdfFlags: allFlags.slice(0, MAX_PDF_ROWS),
    truncated: allFlags.length > MAX_PDF_ROWS,
  };
};

export const generateCloseCallsPDF = (data, tournamentName) => {
  const doc = new jsPDF('portrait');
  const generatedAt = currentCentralTimestamp();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${tournamentName} ${data.year} - Close Calls & Tiebreaker Report`, 10, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedAt}`, 10, 18);
  doc.text(
    `Thresholds: points ≤ ${data.thresholds.points} | weight ≤ ${data.thresholds.weight} lbs | length ≤ ${data.thresholds.length} in | time ≤ ${data.thresholds.time}h`,
    10, 23
  );

  const rows = data.pdfFlags.map((f) => [
    f.group === 'leaderboard' ? 'Leaderboard' : 'Pot',
    f.critical ? 'Yes' : '',
    f.tiers.length > 1 ? `${f.categoryTitle} (${f.tiers.length} tiers)` : f.categoryTitle,
    `${formatPlace(f.placeA)} ${f.teamA}`,
    `${formatPlace(f.placeB)} ${f.teamB}`,
    f.kind === 'tie' ? 'TIE' : 'Margin',
    f.detail.text,
  ]);

  doc.autoTable({
    startY: 28,
    head: [['Type', 'Cutoff?', 'Category', 'Team A', 'Team B', 'Status', 'Detail']],
    body: rows,
    theme: 'striped',
    styles: { fontSize: 7.5, halign: 'left', valign: 'middle', overflow: 'linebreak' },
    headStyles: { fillColor: '#02133E', textColor: '#ffffff', halign: 'center', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 32 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 14, halign: 'center' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.raw[1] === 'Yes') {
        hookData.cell.styles.fillColor = '#FFE9B3';
      }
    },
  });

  if (rows.length === 0) {
    doc.setFontSize(12);
    doc.text('No close calls found at the current thresholds.', 10, 34);
  }

  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 30;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  if (data.truncated) {
    doc.text(
      `Showing the ${data.pdfFlags.length} highest-priority close calls of ${data.totalFlagged} found. Highlighted rows straddle the paying/trophy cutoff.`,
      10, finalY + 6
    );
  } else {
    doc.text('Highlighted rows straddle the paying/trophy cutoff (changes who gets paid or awarded).', 10, finalY + 6);
  }

  doc.save(`Close_Calls_Report_${tournamentName}_${data.year}.pdf`);
};
