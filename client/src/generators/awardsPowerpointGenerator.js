import PptxGenJS from 'pptxgenjs';
import { loadConfigForYear } from '../config/masterConfig';

// Matches the ceremony template's custom slide size (6967538 x 12192000 EMU)
const SLIDE_WIDTH_IN = 6967538 / 914400;
const SLIDE_HEIGHT_IN = 12192000 / 914400;

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatPlace = (num) => {
  const j = num % 10, k = num % 100;
  if (j === 1 && k !== 11) return `${num}st`;
  if (j === 2 && k !== 12) return `${num}nd`;
  if (j === 3 && k !== 13) return `${num}rd`;
  return `${num}th`;
};

// Fetch an image and convert it to a base64 data URI - pptxgenjs embeds images
// most reliably via `data`, avoiding any cross-origin fetch issues at render time.
const imageUrlToBase64 = async (url) => {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn(`Could not load boat photo from ${url}:`, e);
    return null;
  }
};

export const generateAwardsPowerpoint = async (year, tournamentName) => {
  const config = await loadConfigForYear(year);

  let apiUrl = import.meta.env.VITE_NODE_ENV === "staging"
    ? import.meta.env.VITE_SERVER_URL_STAGING
    : import.meta.env.VITE_SERVER_URL_PRODUCTION;

  // Pot config overrides (same pattern as the existing PDF awards report)
  let potConfigOverrides = {};
  try {
    const potConfigRes = await fetch(`${apiUrl}/api/${year}/admin_get_pot_config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (potConfigRes.ok) potConfigOverrides = await potConfigRes.json();
  } catch (e) {
    console.warn('Could not fetch pot config overrides:', e);
  }

  // Awards (leaderboard trophy) config overrides
  let awardsConfigOverrides = {};
  try {
    const awardsConfigRes = await fetch(`${apiUrl}/api/${year}/admin_get_awards_config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (awardsConfigRes.ok) awardsConfigOverrides = await awardsConfigRes.json();
  } catch (e) {
    console.warn('Could not fetch awards config overrides:', e);
  }

  // Leaderboard categories (non-monetary trophy placements)
  const leaderboardQueries = config.leaderboardConfig.CONFIG_LEADERBOARD_CATEGORIES.map(item => {
    const numTrophies = awardsConfigOverrides[item.title]?.numAwards ?? item.numTrophies;
    return {
      title: item.title,
      numTrophies,
      url: item.url,
      body: JSON.stringify({
        catchYear: config.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
        numPlaces: item.numPlaces,
        isReport: true,
        ...(item.inputs && item.inputs.length > 0
          ? item.inputs.reduce((acc, input) => ({ ...acc, ...input }), {})
          : {})
      }),
    };
  });

  const leaderboardResults = await Promise.all(leaderboardQueries.map(query => {
    return fetch(`${apiUrl}/api/${year}/${query.url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: query.body
    }).then(r => r.json()).then(result => ({
      title: query.title,
      numTrophies: query.numTrophies,
      rows: Object.values(result).filter(row => row.place <= query.numTrophies)
    }));
  }));

  // Pot categories (monetary payout placements)
  const potQueries = config.potsConfig.CONFIG_POTS_CATEGORIES.map(item => {
    const payoutStructure = potConfigOverrides[item.potName]?.payoutStructure || item.payoutStructure;
    const bodyData = {
      catchYear: config.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
      potYear: config.generalConfig.CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,
      isReport: true,
      title: item.title,
      potName: item.potName,
      entryAmount: item.entryAmount,
      tournamentCut: item.tournamentCut,
      payoutStructure: payoutStructure,
      numPlaces: Object.keys(payoutStructure).length,
    };
    if (item.inputs && item.inputs.length > 0) {
      item.inputs.forEach(input => {
        Object.keys(input).forEach(param => { bodyData[param] = input[param]; });
      });
    }
    return { url: item.url, body: JSON.stringify(bodyData), title: item.title };
  });

  const potResults = await Promise.all(potQueries.map(query => {
    return fetch(`${apiUrl}/api/${year}/${query.url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: query.body
    }).then(r => r.json()).then(result => ({
      title: query.title,
      rows: result.noQualifyingEntrants ? [] : Object.values(result).filter(row => row.payout > 0)
    }));
  }));

  // All registered teams, including boat photo
  const teamsResponse = await fetch(`${apiUrl}/api/${year}/admin_get_database_list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableName: config.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME })
  });
  const teamData = await teamsResponse.json();
  const boatPhotoByTeam = {};
  Object.values(teamData).forEach(team => {
    boatPhotoByTeam[team.teamName] = team['Boat Photo'] || null;
  });

  // Combine leaderboard + pot results per team
  const teamAwards = {};
  const ensureTeam = (teamName) => {
    if (!teamAwards[teamName]) {
      teamAwards[teamName] = { leaderboard: [], pot: [], totalPayout: 0 };
    }
  };

  leaderboardResults.forEach(category => {
    category.rows.forEach(row => {
      ensureTeam(row.team);
      teamAwards[row.team].leaderboard.push({ title: category.title, place: formatPlace(row.place) });
    });
  });

  potResults.forEach(category => {
    category.rows.forEach(row => {
      ensureTeam(row.team);
      teamAwards[row.team].pot.push({ title: category.title, place: formatPlace(row.place), payout: row.payout });
      teamAwards[row.team].totalPayout += row.payout;
    });
  });

  // Only boats that qualified for at least one award (leaderboard or pot)
  const qualifyingTeams = Object.keys(teamAwards).filter(
    teamName => teamAwards[teamName].leaderboard.length > 0 || teamAwards[teamName].pot.length > 0
  );

  // Announcement order: smallest total pot winnings first, grand champion last.
  // Ties broken alphabetically by boat name.
  qualifyingTeams.sort((a, b) => {
    const diff = teamAwards[a].totalPayout - teamAwards[b].totalPayout;
    if (diff !== 0) return diff;
    return a.localeCompare(b);
  });

  // Pre-fetch all boat photos as base64 before building slides
  const photoDataByTeam = {};
  await Promise.all(qualifyingTeams.map(async (teamName) => {
    photoDataByTeam[teamName] = await imageUrlToBase64(boatPhotoByTeam[teamName]);
  }));

  // Build the presentation
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'CEREMONY', width: SLIDE_WIDTH_IN, height: SLIDE_HEIGHT_IN });
  pptx.layout = 'CEREMONY';

  const PHOTO_H = SLIDE_HEIGHT_IN * 0.42;
  const NAVY = '0E2841';
  const WHITE = 'FFFFFF';

  qualifyingTeams.forEach(teamName => {
    const data = teamAwards[teamName];
    const slide = pptx.addSlide();

    // Boat photo (or a placeholder block if none on file)
    const photoData = photoDataByTeam[teamName];
    if (photoData) {
      slide.addImage({
        data: photoData,
        x: 0, y: 0, w: SLIDE_WIDTH_IN, h: PHOTO_H,
        sizing: { type: 'cover', w: SLIDE_WIDTH_IN, h: PHOTO_H },
      });
    } else {
      slide.addShape('rect', { x: 0, y: 0, w: SLIDE_WIDTH_IN, h: PHOTO_H, fill: { color: NAVY } });
      slide.addText('No Boat Photo', {
        x: 0, y: 0, w: SLIDE_WIDTH_IN, h: PHOTO_H,
        align: 'center', valign: 'middle', color: WHITE, fontSize: 24, bold: true,
      });
    }

    let y = PHOTO_H + 0.15;

    // Boat name
    slide.addText(teamName, {
      x: 0.3, y, w: SLIDE_WIDTH_IN - 0.6, h: 0.6,
      fontSize: 32, bold: true, color: NAVY, align: 'center',
    });
    y += 0.65;

    // Total pot winnings
    slide.addText(`Total Pot Winnings: ${formatCurrency(data.totalPayout)}`, {
      x: 0.3, y, w: SLIDE_WIDTH_IN - 0.6, h: 0.4,
      fontSize: 18, bold: true, color: '156082', align: 'center',
    });
    y += 0.55;

    // Itemized Pot Awards
    if (data.pot.length > 0) {
      slide.addText('Pot Awards', {
        x: 0.3, y, w: SLIDE_WIDTH_IN - 0.6, h: 0.35,
        fontSize: 16, bold: true, color: NAVY,
      });
      y += 0.35;

      const potRows = data.pot.map(a => [
        { text: a.title, options: { fontSize: 12 } },
        { text: a.place, options: { fontSize: 12, align: 'center' } },
        { text: formatCurrency(a.payout), options: { fontSize: 12, align: 'right' } },
      ]);
      const potTableH = Math.min(potRows.length * 0.32, 3.0);
      slide.addTable(potRows, {
        x: 0.3, y, w: SLIDE_WIDTH_IN - 0.6, h: potTableH,
        colW: [(SLIDE_WIDTH_IN - 0.6) * 0.55, (SLIDE_WIDTH_IN - 0.6) * 0.2, (SLIDE_WIDTH_IN - 0.6) * 0.25],
        border: { type: 'solid', color: 'DDDDDD', pt: 0.5 },
        autoPage: false,
        valign: 'middle',
      });
      y += potTableH + 0.2;
    }

    // Itemized Leaderboard Awards
    if (data.leaderboard.length > 0) {
      slide.addText('Leaderboard Awards', {
        x: 0.3, y, w: SLIDE_WIDTH_IN - 0.6, h: 0.35,
        fontSize: 16, bold: true, color: NAVY,
      });
      y += 0.35;

      const boardRows = data.leaderboard.map(a => [
        { text: a.title, options: { fontSize: 12 } },
        { text: a.place, options: { fontSize: 12, align: 'center' } },
      ]);
      const boardTableH = Math.min(boardRows.length * 0.32, 3.0);
      slide.addTable(boardRows, {
        x: 0.3, y, w: SLIDE_WIDTH_IN - 0.6, h: boardTableH,
        colW: [(SLIDE_WIDTH_IN - 0.6) * 0.75, (SLIDE_WIDTH_IN - 0.6) * 0.25],
        border: { type: 'solid', color: 'DDDDDD', pt: 0.5 },
        autoPage: false,
        valign: 'middle',
      });
    }
  });

  await pptx.writeFile({ fileName: `Awards_Ceremony_${tournamentName}_${year}.pptx` });
};
