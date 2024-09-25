import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import { loadConfigForYear } from '../config/masterConfig'; // Import dynamic config loader

const addPageNumbers = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 25, doc.internal.pageSize.getHeight() - 10);
  }
};

export const generateCatchesBySpeciesReport = (data, year, tournamentName, speciesList) => {
  const doc = new jsPDF('landscape');
  const currentDate = dayjs().format('MMMM D, YYYY h:mm A [CST]');

  console.log(data);

  // Group data by species using the dynamic speciesList
  const speciesGroups = speciesList.reduce((acc, species) => {
    acc[species.label] = [];
    return acc;
  }, {});

  const catchesArray = Object.values(data);
  catchesArray.forEach(catchItem => {
    if (speciesGroups[catchItem.species]) {
      speciesGroups[catchItem.species].push(catchItem);
    }
  });

  Object.keys(speciesGroups).forEach((species, index) => {
    let catches = speciesGroups[species];

    // Sort all catches by dateTime in descending order
    catches.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    if (index > 0) doc.addPage();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Catches for ${species} - ${tournamentName} ${year}`, 10, 10);
    doc.text(`Report generated on ${currentDate}`, 10, 18);

    const tableColumn = ["No.", "Species", "Team Name", "Date", "Weight", "Length", "Girth"];
    const tableRows = [];

    catches.forEach((catchItem, idx) => {
      tableRows.push([
        idx + 1, // Row number
        catchItem.species, // Species Type
        catchItem.teamName,
        dayjs(catchItem.dateTime).format('MMMM D, YYYY h:mm A'),
        catchItem.weight || 'N/A',
        catchItem.length || 'N/A',
        catchItem.girth || 'N/A',
      ]);
    });

    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      styles: { fontSize: 10, halign: 'center', valign: 'middle', overflow: 'linebreak' },
      headStyles: { fillColor: '#02133E', textColor: '#ffffff', halign: 'center' },
    });
  });

  addPageNumbers(doc);
  doc.save(`${tournamentName}_${year} Catches (By Species).pdf`);
};

export const generateCatchesByTeamReport = (data, year, tournamentName, teamRows) => {
  const doc = new jsPDF('landscape');
  const currentDate = dayjs().format('MMMM D, YYYY h:mm A [CST]');

  console.log(data);

  // Group data by team
  const teamGroups = teamRows.reduce((acc, teamName) => {
    acc[teamName] = [];
    return acc;
  }, {});

  const catchesArray = Object.values(data);
  catchesArray.forEach(catchItem => {
    if (teamGroups[catchItem.teamName]) {
      teamGroups[catchItem.teamName].push(catchItem);
    }
  });

  Object.keys(teamGroups).forEach((team, index) => {
    let catches = teamGroups[team];

    // Sort all catches by dateTime in descending order
    catches.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    if (index > 0) doc.addPage();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');

    // Add the number of catches to the title
    const totalCatches = catches.length;
    doc.text(`Catches for ${team} - ${tournamentName} ${year} (${totalCatches} total)`, 10, 10);
    doc.text(`Report generated on ${currentDate}`, 10, 18);

    const tableColumn = ["Species", "Date", "Weight", "Length", "Girth"];
    const tableRows = [];

    catches.forEach(catchItem => {
      tableRows.push([
        catchItem.species,
        dayjs(catchItem.dateTime).format('MMMM D, YYYY h:mm A'),
        catchItem.weight || 'N/A',
        catchItem.length || 'N/A',
        catchItem.girth || 'N/A',
      ]);
    });

    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      styles: { fontSize: 10, halign: 'center', valign: 'middle', overflow: 'linebreak' },
      headStyles: { fillColor: '#02133E', textColor: '#ffffff', halign: 'center' },
    });
  });

  addPageNumbers(doc);
  doc.save(`${tournamentName}_${year} Catches (By Team).pdf`);
};

export const fetchAndGenerateCatchesReport = async (year, type, tournamentName) => {
  console.log('Fetching and generating catches report...');
  
  // Load dynamic config for the specific year
  const config = await loadConfigForYear(year);
  
  let apiUrl = null; 
  if (process.env.REACT_APP_NODE_ENV === "staging") {
    apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
  } else if (process.env.REACT_APP_NODE_ENV === "production") {
    apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
  }

  try { 
    const [catchResponse, teamResponse] = await Promise.all([
      fetch(`${apiUrl}/api/${year}/admin_get_database_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: config.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME }), // Use dynamic config
      }),
      fetch(`${apiUrl}/api/${year}/admin_get_database_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: config.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME }), // Use dynamic config
      }),
    ]);

    if (!catchResponse.ok || !teamResponse.ok) {
      throw new Error('Error fetching data');
    }

    const catchData = await catchResponse.json();
    const teamData = await teamResponse.json();

    const teamList = Object.values(teamData).map(team => team.teamName);

    if (type === "Species") {
      generateCatchesBySpeciesReport(catchData, year, tournamentName, config.catchConfig.CONFIG_CATCHES_SPECIES_LIST); // Use dynamic species list
    } else if (type === "Team") {
      generateCatchesByTeamReport(catchData, year, tournamentName, teamList);
    }

  } catch (error) {
    console.error("Error fetching data for catches report:", error);
  }
};

