import PptxGenJS from 'pptxgenjs';
import { loadConfigForYear } from '../config/masterConfig';

// Matches the ceremony template's custom slide size (6967538 x 12192000 EMU)
const SLIDE_WIDTH_IN = 6967538 / 914400;
const SLIDE_HEIGHT_IN = 12192000 / 914400;

// Standard 16:9 widescreen, in case the ceremony display changes again -
// pptxgenjs's built-in LAYOUT_16x9 preset (13.333in x 7.5in)
const WIDE_WIDTH_IN = 13.333;
const WIDE_HEIGHT_IN = 7.5;

// Layout tuned for viewing on a large ceremony screen from a distance -
// bigger type throughout, with table row height flexing to fit whatever
// number of itemized wins a boat has without ever overflowing the slide.
const MARGIN_X = 0.35;
const CONTENT_W = SLIDE_WIDTH_IN - MARGIN_X * 2;
const PHOTO_H = SLIDE_HEIGHT_IN * 0.36;
const IDEAL_ROW_H = 0.46;

// Tournament brand colors, pulled from client/src/index.css (--color-primary
// etc.) and stylingConfig.js rather than invented - TEAL is the turquoise
// used for every banner/table-header on the site (CONFIG_STYLING_BANNER_
// BACKGROUND_COLOR / CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR), NAVY is
// the deep blue used for titles (CONFIG_STYLING_POTS_TITLE_TEXT_COLOR).
const TEAL = '288DAF';
const NAVY = '004B8C';
const WHITE = 'FFFFFF';
const ROW_TEXT = '2C2C2C'; // CONFIG_STYLING_POTS_ROW_TEXT_COLOR
const ROW_FILL_A = 'FFFFFF';
const ROW_FILL_B = 'EAEAEA'; // CONFIG_STYLING_TABLE_ODD_ROW_BACKGROUND_COLOR
const BORDER_COLOR = 'E2E8F0'; // --color-border

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

// Firebase Storage blocks cross-origin fetch() of the raw image bytes (the
// existing app only ever displays these via <img src>, which isn't subject to
// CORS the same way). Route through a small backend proxy instead, which
// reads the file server-side via the Admin SDK and returns it as base64.
const imageUrlToBase64 = async (apiUrl, year, url) => {
  if (!url) return null;
  try {
    const response = await fetch(`${apiUrl}/api/${year}/admin_get_image_as_base64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: url }),
    });
    if (!response.ok) return null;
    const { dataUri } = await response.json();
    return dataUri || null;
  } catch (e) {
    console.warn(`Could not load boat photo from ${url}:`, e);
    return null;
  }
};

// Splits the vertical space left after the photo/name/total between the Pot
// Awards and Leaderboard Awards tables, proportional to how many rows each
// needs, and picks a row height that fits the larger of the two sections
// (each table gets header + N item rows) within that shared budget. Never
// returns more than what the budget allows - staying on the slide always
// wins over hitting the ideal row height, since a boat with a huge number
// of wins would otherwise force the table to overflow past the slide edge.
const computeRowHeight = (potCount, boardCount, availableH) => {
  const potUnits = potCount > 0 ? potCount + 1 : 0;
  const boardUnits = boardCount > 0 ? boardCount + 1 : 0;
  const totalUnits = potUnits + boardUnits;
  if (totalUnits === 0) return IDEAL_ROW_H;
  return Math.min(IDEAL_ROW_H, availableH / totalUnits);
};

// Table font size follows the row height so text never looks cramped or
// overflows its row - only ever drops below 15pt in the rare case where a
// boat has won a large number of pots/awards and needs more compact rows.
const fontSizeForRowHeight = (rowH) => {
  if (rowH >= 0.4) return 15;
  if (rowH >= 0.32) return 13;
  return 11;
};

const addAwardsTable = (slide, rows, { x, y, w, colW, rowH }) => {
  const fontSize = fontSizeForRowHeight(rowH);
  const tableRows = rows.map((cells, idx) => {
    // Header row matches the site's own table header styling (turquoise
    // fill, white text); data rows use the same zebra-stripe + row text
    // color already established for pot tables elsewhere on the site.
    const fill = idx === 0 ? TEAL : (idx % 2 === 0 ? ROW_FILL_B : ROW_FILL_A);
    const color = idx === 0 ? WHITE : ROW_TEXT;
    const bold = idx === 0;
    return cells.map(cell => ({
      text: cell.text,
      options: { ...cell.options, fill: { color: fill }, color, bold: bold || cell.options?.bold },
    }));
  });
  slide.addTable(tableRows, {
    x, y, w, h: rowH * rows.length,
    colW,
    border: { type: 'solid', color: BORDER_COLOR, pt: 0.5 },
    autoPage: false,
    valign: 'middle',
    fontSize,
  });
  return rowH * rows.length;
};

// Fetches and combines leaderboard + pot standings + boat photos per team.
// Shared by both the portrait (matches the ceremony template) and 16:9
// (standard widescreen) slide builders below, so the underlying data/
// filtering/sort/photo logic can't drift between the two.
const fetchTeamAwardsData = async (year) => {
  const config = await loadConfigForYear(year);

  const apiUrl = import.meta.env.VITE_NODE_ENV === "staging"
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

  // Pre-fetch all boat photos as base64 before building slides. Batched
  // rather than all at once - each fetch is a Storage round-trip + image
  // resize on the backend, and a single dyno bogs down if every qualifying
  // team's photo request lands on it simultaneously.
  const photoDataByTeam = {};
  const PHOTO_FETCH_BATCH_SIZE = 4;
  for (let i = 0; i < qualifyingTeams.length; i += PHOTO_FETCH_BATCH_SIZE) {
    const batch = qualifyingTeams.slice(i, i + PHOTO_FETCH_BATCH_SIZE);
    await Promise.all(batch.map(async (teamName) => {
      photoDataByTeam[teamName] = await imageUrlToBase64(apiUrl, year, boatPhotoByTeam[teamName]);
    }));
  }

  return { qualifyingTeams, teamAwards, photoDataByTeam };
};

// Portrait, matching the ceremony template's exact custom dimensions
// (7.62in x 13.33in): photo on top, name + total winnings banner below,
// then the two award tables stacked underneath.
export const generateAwardsPowerpoint = async (year, tournamentName) => {
  const { qualifyingTeams, teamAwards, photoDataByTeam } = await fetchTeamAwardsData(year);

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'CEREMONY', width: SLIDE_WIDTH_IN, height: SLIDE_HEIGHT_IN });
  pptx.layout = 'CEREMONY';

  qualifyingTeams.forEach(teamName => {
    const data = teamAwards[teamName];
    const slide = pptx.addSlide();
    slide.background = { color: WHITE };

    // Boat photo (or a branded placeholder block if none on file)
    const photoData = photoDataByTeam[teamName];
    if (photoData) {
      slide.addImage({
        data: photoData,
        x: 0, y: 0, w: SLIDE_WIDTH_IN, h: PHOTO_H,
        sizing: { type: 'cover', w: SLIDE_WIDTH_IN, h: PHOTO_H },
      });
    } else {
      slide.addShape('rect', { x: 0, y: 0, w: SLIDE_WIDTH_IN, h: PHOTO_H, fill: { color: NAVY } });
      slide.addText('⚓', {
        x: 0, y: 0, w: SLIDE_WIDTH_IN, h: PHOTO_H - 0.5,
        align: 'center', valign: 'middle', color: TEAL, fontSize: 60,
      });
      slide.addText('No Boat Photo On File', {
        x: 0, y: PHOTO_H - 0.5, w: SLIDE_WIDTH_IN, h: 0.5,
        align: 'center', valign: 'middle', color: WHITE, fontSize: 16, italic: true,
      });
    }

    // Accent divider under the photo
    slide.addShape('rect', { x: 0, y: PHOTO_H, w: SLIDE_WIDTH_IN, h: 0.06, fill: { color: TEAL } });

    let y = PHOTO_H + 0.22;

    // Boat name - the marquee element
    slide.addText(teamName, {
      x: MARGIN_X, y, w: CONTENT_W, h: 0.8,
      fontSize: 40, bold: true, color: NAVY, align: 'center', fontFace: 'Arial',
    });
    y += 0.82;

    // Total pot winnings - the "hero number", set in the site's signature
    // turquoise banner treatment (CONFIG_STYLING_BANNER_BACKGROUND_COLOR)
    const bannerH = 0.75;
    slide.addShape('roundRect', {
      x: MARGIN_X, y, w: CONTENT_W, h: bannerH,
      fill: { color: TEAL }, rectRadius: 0.08,
    });
    slide.addText([
      { text: 'TOTAL POT WINNINGS\n', options: { fontSize: 13, color: WHITE, bold: true, charSpacing: 2 } },
      { text: formatCurrency(data.totalPayout), options: { fontSize: 30, color: WHITE, bold: true } },
    ], {
      x: MARGIN_X, y, w: CONTENT_W, h: bannerH, align: 'center', valign: 'middle', lineSpacing: 28,
    });
    y += bannerH + 0.25;

    // Shared vertical budget for both tables, computed from what's actually left
    const availableH = SLIDE_HEIGHT_IN - y - 0.2;
    const sectionHeaderH = 0.4;
    const numSections = (data.pot.length > 0 ? 1 : 0) + (data.leaderboard.length > 0 ? 1 : 0);
    const tableBudget = availableH - sectionHeaderH * numSections - (numSections > 1 ? 0.2 : 0);
    const rowH = computeRowHeight(data.pot.length, data.leaderboard.length, tableBudget);

    // Itemized Pot Awards
    if (data.pot.length > 0) {
      slide.addText('POT AWARDS', {
        x: MARGIN_X, y, w: CONTENT_W, h: sectionHeaderH,
        fontSize: 20, bold: true, color: NAVY, charSpacing: 1,
      });
      y += sectionHeaderH;

      const potRows = [
        [{ text: 'Pot', options: {} }, { text: 'Place', options: { align: 'center' } }, { text: 'Payout', options: { align: 'right' } }],
        ...data.pot.map(a => [
          { text: a.title, options: {} },
          { text: a.place, options: { align: 'center' } },
          { text: formatCurrency(a.payout), options: { align: 'right', bold: true } },
        ]),
      ];
      const usedH = addAwardsTable(slide, potRows, {
        x: MARGIN_X, y, w: CONTENT_W,
        colW: [CONTENT_W * 0.55, CONTENT_W * 0.2, CONTENT_W * 0.25],
        rowH,
      });
      y += usedH + 0.2;
    }

    // Itemized Leaderboard Awards
    if (data.leaderboard.length > 0) {
      slide.addText('LEADERBOARD AWARDS', {
        x: MARGIN_X, y, w: CONTENT_W, h: sectionHeaderH,
        fontSize: 20, bold: true, color: NAVY, charSpacing: 1,
      });
      y += sectionHeaderH;

      const boardRows = [
        [{ text: 'Category', options: {} }, { text: 'Place', options: { align: 'center' } }],
        ...data.leaderboard.map(a => [
          { text: a.title, options: {} },
          { text: a.place, options: { align: 'center', bold: true } },
        ]),
      ];
      addAwardsTable(slide, boardRows, {
        x: MARGIN_X, y, w: CONTENT_W,
        colW: [CONTENT_W * 0.75, CONTENT_W * 0.25],
        rowH,
      });
    }
  });

  await pptx.writeFile({ fileName: `Awards_Ceremony_${tournamentName}_${year}.pptx` });
};

// Standard 16:9 widescreen: photo fills the left half, name + total winnings
// banner + tables stack in the right half. Same underlying data/order as the
// portrait version - just a different arrangement for a wide screen.
export const generateAwardsPowerpoint16x9 = async (year, tournamentName) => {
  const { qualifyingTeams, teamAwards, photoDataByTeam } = await fetchTeamAwardsData(year);

  const pptx = new PptxGenJS();
  // pptxgenjs's built-in 'LAYOUT_16x9' preset is the legacy 10in x 5.625in
  // size (same 16:9 ratio, smaller absolute size) - define the modern
  // widescreen dimensions explicitly instead, same pattern as the portrait
  // layout above.
  pptx.defineLayout({ name: 'WIDE', width: WIDE_WIDTH_IN, height: WIDE_HEIGHT_IN });
  pptx.layout = 'WIDE';

  const photoW = WIDE_WIDTH_IN * 0.48;
  const dividerW = 0.06;
  const colX = photoW + dividerW + 0.3;
  const colW = WIDE_WIDTH_IN - colX - 0.3;
  const marginTop = 0.3;

  qualifyingTeams.forEach(teamName => {
    const data = teamAwards[teamName];
    const slide = pptx.addSlide();
    slide.background = { color: WHITE };

    // Boat photo (or a branded placeholder block if none on file), left half
    const photoData = photoDataByTeam[teamName];
    if (photoData) {
      slide.addImage({
        data: photoData,
        x: 0, y: 0, w: photoW, h: WIDE_HEIGHT_IN,
        sizing: { type: 'cover', w: photoW, h: WIDE_HEIGHT_IN },
      });
    } else {
      slide.addShape('rect', { x: 0, y: 0, w: photoW, h: WIDE_HEIGHT_IN, fill: { color: NAVY } });
      slide.addText('⚓', {
        x: 0, y: 0, w: photoW, h: WIDE_HEIGHT_IN - 0.5,
        align: 'center', valign: 'middle', color: TEAL, fontSize: 60,
      });
      slide.addText('No Boat Photo On File', {
        x: 0, y: WIDE_HEIGHT_IN - 0.5, w: photoW, h: 0.5,
        align: 'center', valign: 'middle', color: WHITE, fontSize: 14, italic: true,
      });
    }

    // Accent divider between photo and text column
    slide.addShape('rect', { x: photoW, y: 0, w: dividerW, h: WIDE_HEIGHT_IN, fill: { color: TEAL } });

    let y = marginTop;

    // Boat name
    slide.addText(teamName, {
      x: colX, y, w: colW, h: 0.55,
      fontSize: 26, bold: true, color: NAVY, align: 'center', fontFace: 'Arial',
    });
    y += 0.62;

    // Total pot winnings banner
    const bannerH = 0.62;
    slide.addShape('roundRect', {
      x: colX, y, w: colW, h: bannerH,
      fill: { color: TEAL }, rectRadius: 0.07,
    });
    slide.addText([
      { text: 'TOTAL POT WINNINGS\n', options: { fontSize: 11, color: WHITE, bold: true, charSpacing: 2 } },
      { text: formatCurrency(data.totalPayout), options: { fontSize: 22, color: WHITE, bold: true } },
    ], {
      x: colX, y, w: colW, h: bannerH, align: 'center', valign: 'middle', lineSpacing: 22,
    });
    y += bannerH + 0.18;

    const availableH = WIDE_HEIGHT_IN - y - 0.25;
    const sectionHeaderH = 0.3;
    const numSections = (data.pot.length > 0 ? 1 : 0) + (data.leaderboard.length > 0 ? 1 : 0);
    const tableBudget = availableH - sectionHeaderH * numSections - (numSections > 1 ? 0.12 : 0);
    const rowH = computeRowHeight(data.pot.length, data.leaderboard.length, tableBudget);

    if (data.pot.length > 0) {
      slide.addText('POT AWARDS', {
        x: colX, y, w: colW, h: sectionHeaderH,
        fontSize: 15, bold: true, color: NAVY, charSpacing: 1,
      });
      y += sectionHeaderH;

      const potRows = [
        [{ text: 'Pot', options: {} }, { text: 'Place', options: { align: 'center' } }, { text: 'Payout', options: { align: 'right' } }],
        ...data.pot.map(a => [
          { text: a.title, options: {} },
          { text: a.place, options: { align: 'center' } },
          { text: formatCurrency(a.payout), options: { align: 'right', bold: true } },
        ]),
      ];
      const usedH = addAwardsTable(slide, potRows, {
        x: colX, y, w: colW,
        colW: [colW * 0.55, colW * 0.2, colW * 0.25],
        rowH,
      });
      y += usedH + 0.12;
    }

    if (data.leaderboard.length > 0) {
      slide.addText('LEADERBOARD AWARDS', {
        x: colX, y, w: colW, h: sectionHeaderH,
        fontSize: 15, bold: true, color: NAVY, charSpacing: 1,
      });
      y += sectionHeaderH;

      const boardRows = [
        [{ text: 'Category', options: {} }, { text: 'Place', options: { align: 'center' } }],
        ...data.leaderboard.map(a => [
          { text: a.title, options: {} },
          { text: a.place, options: { align: 'center', bold: true } },
        ]),
      ];
      addAwardsTable(slide, boardRows, {
        x: colX, y, w: colW,
        colW: [colW * 0.75, colW * 0.25],
        rowH,
      });
    }
  });

  await pptx.writeFile({ fileName: `Awards_Ceremony_16x9_${tournamentName}_${year}.pptx` });
};
