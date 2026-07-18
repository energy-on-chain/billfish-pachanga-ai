import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { loadConfigForYear } from '../config/masterConfig';
import { currentCentralTimestamp } from './utils/formatCentralDateTime';

const addPageNumbers = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 25, doc.internal.pageSize.getHeight() - 10);
  }
};

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

// One page per team summarizing every pot they won (monetary payouts only -
// no leaderboard/trophy categories, unlike the combined Awards Report).
// Every registered team gets a page, including ones with zero pot winnings.
export const generatePotSummaryByTeamReport = async (year, tournamentName) => {
  const doc = new jsPDF('portrait');
  const currentDate = currentCentralTimestamp();

  const config = await loadConfigForYear(year);

  const apiUrl = import.meta.env.VITE_NODE_ENV === "staging"
    ? import.meta.env.VITE_SERVER_URL_STAGING
    : import.meta.env.VITE_SERVER_URL_PRODUCTION;

  try {
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
        payoutStructure,
        numPlaces: Object.keys(payoutStructure).length,
      };
      if (item.inputs && item.inputs.length > 0) {
        item.inputs.forEach(input => Object.keys(input).forEach(p => { bodyData[p] = input[p]; }));
      }
      return { url: item.url, body: JSON.stringify(bodyData), title: item.title };
    });

    const potResults = await Promise.all(potQueries.map(query =>
      fetch(`${apiUrl}/api/${year}/${query.url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: query.body
      }).then(r => r.json()).then(result => ({
        title: query.title,
        rows: result.noQualifyingEntrants ? [] : Object.values(result).filter(row => row.payout > 0)
      }))
    ));

    const teamsResponse = await fetch(`${apiUrl}/api/${year}/admin_get_database_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName: config.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME })
    });
    const teamData = await teamsResponse.json();
    const allTeamNames = Object.values(teamData).map(t => t.teamName).sort((a, b) => a.localeCompare(b));

    const potsByTeam = {};
    const ensureTeam = (teamName) => {
      if (!potsByTeam[teamName]) potsByTeam[teamName] = { pots: [], totalPayout: 0 };
    };
    allTeamNames.forEach(ensureTeam);

    potResults.forEach(category => {
      category.rows.forEach(row => {
        ensureTeam(row.team);
        potsByTeam[row.team].pots.push({ title: category.title, place: formatPlace(row.place), payout: row.payout });
        potsByTeam[row.team].totalPayout += row.payout;
      });
    });

    allTeamNames.forEach((teamName, index) => {
      if (index > 0) doc.addPage();

      const data = potsByTeam[teamName];
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${teamName} - ${tournamentName} ${year}`, 10, 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Report generated on ${currentDate}`, 10, 17);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Pot Winnings: ${formatCurrency(data.totalPayout)}`, 10, 27);
      doc.setFont('helvetica', 'normal');

      if (data.pots.length > 0) {
        const rows = data.pots.map(p => [p.title, p.place, formatCurrency(p.payout)]);
        doc.autoTable({
          startY: 34,
          head: [['Pot', 'Place', 'Payout']],
          body: rows,
          theme: 'striped',
          styles: { fontSize: 10, halign: 'center', valign: 'middle', overflow: 'linebreak' },
          headStyles: { fillColor: '#02133E', textColor: '#ffffff', halign: 'center' },
        });
      } else {
        doc.setFontSize(11);
        doc.text('No pot winnings', 10, 37);
      }
    });

    addPageNumbers(doc);
    doc.save(`Pot_Summary_By_Team_${tournamentName}_${year}.pdf`);
  } catch (error) {
    console.error("Error generating pot summary by team report:", error);
  }
};
