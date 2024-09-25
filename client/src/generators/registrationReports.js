import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import { loadConfigForYear } from '../config/masterConfig'; // Dynamic config loader

const addPageNumbers = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 15, doc.internal.pageSize.getHeight() - 10);
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

export const generateRegistrationReport = (teams, year, tableProperties, tournamentName) => {
  const doc = new jsPDF('landscape');
  const currentDate = dayjs().format('MMMM D, YYYY h:mm A [CST]');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Teams registered for ${tournamentName} as of ${currentDate}`, 10, 10);

  // Columns to display in the desired order
  const selectedColumns = ['teamName', 'teamEmail', 'teamPhone', 'totalFeePaidAtCheckout', 'hasCheckedIn'];

  // Get headers for the selected columns in the desired order
  const visibleColumns = tableProperties.filter(col => selectedColumns.includes(col.field));
  const tableColumn = visibleColumns.map(col => col.headerName);

  const tableRows = [];

  // Sort teams by team name
  const sortedTeams = Object.values(teams).sort((a, b) => a.teamName.localeCompare(b.teamName));

  sortedTeams.forEach((team, index) => {
    const teamData = visibleColumns.map(col => {
      if (col.field === 'totalFeePaidAtCheckout') {
        return formatCurrency(team[col.field] || 0);  // Format as currency
      }
      return team[col.field] || '';  // Populate data based on visible columns
    });
    tableRows.push([index + 1, ...teamData]);  // Add the numbering column at the start
  });

  // Insert a numbering column at the beginning of the column headers
  doc.autoTable({
    startY: 20,  // Adjust to avoid overlapping with the new header text
    head: [['#', ...tableColumn]],  // Prepend '#' for the numbering column
    body: tableRows,
    theme: 'striped',
    styles: { fontSize: 10, halign: 'center', valign: 'middle', overflow: 'linebreak' },  // Center align headers and cells, handle overflow
    headStyles: { fillColor: '#02133E', textColor: '#ffffff', halign: 'center' },  // Center align headers
    columnStyles: {
      0: { cellWidth: 10 },   // #
      1: { cellWidth: 30 },   // Team Name
      2: { cellWidth: 80 },  // Email (twice as wide)
      3: { cellWidth: 30 },   // Phone
      4: { cellWidth: 30 },   // Total Fee Paid (Currency)
      5: { cellWidth: 30 },   // Checked-In (last column, smaller width)
    },
    didDrawPage: function (data) {
      // Add header to each page
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Teams registered for ${tournamentName} as of ${currentDate}`, 10, 10);
    }
  });

  addPageNumbers(doc);

  // Save the PDF
  doc.save(`${tournamentName} ${year} Team Check-In Form.pdf`);
};

export const fetchAndGenerateRegistrationReport = async (year, tournamentName, tableProperties) => {
  console.log('Fetching and generating registration report...');

  // Load dynamic config for the specific year
  const config = await loadConfigForYear(year);

  // Define environment
  let apiUrl = null; 
  if (process.env.REACT_APP_NODE_ENV === "staging") {
    apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
  } else if (process.env.REACT_APP_NODE_ENV === "production") {
    apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
  }

  try { 
    const response = await fetch(`${apiUrl}/api/${year}/admin_get_registered_team_data_for_report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamYear: config.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME }), // Use dynamic table name
    });
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const teamData = await response.json();
    generateRegistrationReport(teamData, year, tableProperties, tournamentName);
  } catch (error) {
    console.error("Error fetching team data or generating PDF:", error);
  }
};

