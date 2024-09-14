import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';

import {
  CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,  
  CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,
  CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME,
} from '../config/generalConfig';

import { 
  CONFIG_LEADERBOARD_CATEGORIES 
} from '../config/leaderboardConfig';

import { 
  CONFIG_POTS_CATEGORIES,
} from '../config/potsConfig';

const addPageNumbers = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 25, doc.internal.pageSize.getHeight() - 10);
  }
};

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatPlace = (num) => {
  const j = num % 10,
        k = num % 100;
  if (j === 1 && k !== 11) {
    return `${num}st`;
  }
  if (j === 2 && k !== 12) {
    return `${num}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${num}rd`;
  }
  return `${num}th`;
};

export const generateAwardsReport = async (year, tournamentName) => {
  const doc = new jsPDF('portrait'); // Changed to portrait
  const currentDate = dayjs().format('MMMM D, YYYY h:mm A [CST]');

  try {
    // Define environment
    let apiUrl = null;
    if (process.env.REACT_APP_NODE_ENV === "staging") {
      apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
    } else if (process.env.REACT_APP_NODE_ENV === "production") {
      apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
    }

    // Fetch leaderboard data
    const leaderboardQueries = CONFIG_LEADERBOARD_CATEGORIES.map(item => ({
      title: item.title,
      subtitle: item.subtitle || "",
      numPlaces: item.numPlaces,
      numTrophies: item.numTrophies,
      url: item.url,
      body: JSON.stringify({
        catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
        numPlaces: item.numPlaces,
        isReport: true,  // Fetch all rows for the report
        ...(item.inputs && item.inputs.length > 0
          ? item.inputs.reduce((acc, input) => ({ ...acc, ...input }), {})
          : {})
      }),
      desktopColumns: item.desktopColumns,
      mobileColumns: item.mobileColumns
    }));

    const leaderboardResults = await Promise.all(leaderboardQueries.map((query) => {
      return fetch(`${apiUrl}/api/${query.url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: query.body
      }).then(r => r.json()).then((result) => {
        return {
          title: query.title,
          subtitle: query.subtitle,
          numTrophies: query.numTrophies,
          rows: Object.values(result).filter(row => row.place <= query.numTrophies)
        };
      });
    }));

    // Fetch pot data
    const potQueries = CONFIG_POTS_CATEGORIES.map((item) => {
      let bodyData = {
        catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
        potYear: CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,
        isReport: true,
        title: item.title,
        subtitle: item.subtitle || "",
        potName: item.potName,
        entryAmount: item.entryAmount,
        tournamentCut: item.tournamentCut,
        payoutStructure: item.payoutStructure,
        numPlaces: Object.keys(item.payoutStructure).length,
      };

      if (item.inputs && item.inputs.length > 0) {
        item.inputs.forEach(input => {
          Object.keys(input).forEach(param => {
            bodyData[param] = input[param];
          });
        });
      }

      return {
        url: item.url,
        body: JSON.stringify(bodyData),
        title: item.title,
        subtitle: item.subtitle || "",
        numPlaces: Object.keys(item.payoutStructure).length,
        desktopColumns: item.desktopColumns,
        mobileColumns: item.mobileColumns,
      };
    });
    
    const potResults = await Promise.all(potQueries.map((query) => {
      return fetch(`${apiUrl}/api/${query.url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: query.body
      }).then(r => r.json()).then((result) => {
        return {
          title: query.title,
          subtitle: query.subtitle,
          rows: Object.values(result).filter(row => row.payout > 0)
        };
      });
    }));

    // Fetch all registered teams (Assuming there's an endpoint to fetch all teams)
    const teamsResponse = await fetch(`${apiUrl}/api/admin_get_database_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME }),
    })
    const teamData = await teamsResponse.json(); // Assuming this returns an array of team names
    const allTeams = Object.values(teamData).map(team => team.teamName);

    // Combine leaderboard and pot data by team
    const teamAwards = {};
    leaderboardResults.forEach(category => {
      category.rows.forEach(row => {
        const teamName = row.team;
        if (!teamAwards[teamName]) {
          teamAwards[teamName] = {
            leaderboard: [],
            pot: [],
            totalPayout: 0,
          };
        }
        teamAwards[teamName].leaderboard.push({
          title: category.title,
          place: formatPlace(row.place), // Format place
        });
      });
    });

    potResults.forEach(category => {
      category.rows.forEach(row => {
        const teamName = row.team;
        if (!teamAwards[teamName]) {
          teamAwards[teamName] = {
            leaderboard: [],
            pot: [],
            totalPayout: 0,
          };
        }
        teamAwards[teamName].pot.push({
          title: category.title,
          place: formatPlace(row.place), // Format place
          payout: row.payout
        });
        teamAwards[teamName].totalPayout += row.payout;
      });
    });

    // Add any teams that didn't win any awards
    allTeams.forEach(team => {
      if (!teamAwards[team]) {
        teamAwards[team] = {
          leaderboard: [],
          pot: [],
          totalPayout: 0,
        };
      }
    });

    // Sort teams by total payout in descending order
    const sortedTeams = Object.keys(teamAwards).sort((a, b) => teamAwards[b].totalPayout - teamAwards[a].totalPayout);

    // Generate PDF for each team
    sortedTeams.forEach((team, index) => {
      if (index > 0) doc.addPage();

      const teamData = teamAwards[team];
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');

      // Ensure proper formatting for text, make sure to pass strings only
      doc.text(`${team} - ${tournamentName} ${year}`, 10, 10, { maxWidth: doc.internal.pageSize.getWidth() - 20 });
      doc.text(`Total Payout: ${formatCurrency(teamData.totalPayout)}`, 10, 18);
      doc.text(`Report generated on ${currentDate}`, 10, 26);

      // Leaderboard
      if (teamData.leaderboard.length > 0) {
        doc.setFontSize(14);
        doc.text('Leaderboard Awards', 10, 34);

        const leaderboardRows = teamData.leaderboard.map((achievement) => [
          achievement.title,
          achievement.place
        ]);

        doc.autoTable({
          startY: 40,
          head: [['Category', 'Place']],
          body: leaderboardRows,
          theme: 'striped',
          styles: { fontSize: 10, halign: 'center', valign: 'middle', overflow: 'linebreak' },
          headStyles: { fillColor: '#02133E', textColor: '#ffffff', halign: 'center' },
        });
      } else {
        doc.setFontSize(14);
        doc.text('No leaderboard finishes', 10, 40);
      }

      // Pot
      if (teamData.pot.length > 0) {
        // Sort pot data by payout in descending order
        teamData.pot.sort((a, b) => b.payout - a.payout);

        const startY = teamData.leaderboard.length > 0 ? doc.lastAutoTable.finalY + 10 : 50;
        doc.setFontSize(14);
        doc.text('Pot Awards', 10, startY);

        const potRows = teamData.pot.map((achievement) => [
          achievement.title,
          achievement.place,
          formatCurrency(achievement.payout)
        ]);

        doc.autoTable({
          startY: startY + 6,
          head: [['Category', 'Place', 'Payout']],
          body: potRows,
          theme: 'striped',
          styles: { fontSize: 10, halign: 'center', valign: 'middle', overflow: 'linebreak' },
          headStyles: { fillColor: '#02133E', textColor: '#ffffff', halign: 'center' },
        });
      } else {
        const noPotY = teamData.leaderboard.length > 0 ? doc.lastAutoTable.finalY + 10 : 50;
        doc.text('No pot winnings', 10, noPotY);
      }
    });

    addPageNumbers(doc);
    doc.save(`Awards_${tournamentName}_${year}.pdf`);
  } catch (error) {
    console.error("Error generating awards report:", error);
  }
};

