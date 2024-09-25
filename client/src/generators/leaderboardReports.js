import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import { loadConfigForYear } from '../config/masterConfig'; // Dynamic config loader

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

export const generateLeaderboardReport = async (year, tournamentName) => {
  const doc = new jsPDF('landscape');
  const currentDate = dayjs().format('MMMM D, YYYY h:mm A [CST]');

  // Load dynamic config for the specific year
  const config = await loadConfigForYear(year);

  let apiUrl = null;
  if (process.env.REACT_APP_NODE_ENV === "staging") {
    apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
  } else if (process.env.REACT_APP_NODE_ENV === "production") {
    apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
  }

  // Fetch and process leaderboard data
  try {
    // Build queries for leaderboard categories dynamically from config
    const queries = config.leaderboardConfig.CONFIG_LEADERBOARD_CATEGORIES.map(item => ({
      title: item.title,
      subtitle: item.subtitle || "",
      numPlaces: item.numPlaces,
      url: item.url,
      body: JSON.stringify({
        catchYear: config.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME, // Dynamic table name
        numPlaces: item.numPlaces,
        isReport: true,  // Fetch all rows for the report
        ...(item.inputs && item.inputs.length > 0
          ? item.inputs.reduce((acc, input) => ({ ...acc, ...input }), {})
          : {})
      }),
      desktopColumns: item.desktopColumns,
      mobileColumns: item.mobileColumns
    }));

    const res = await Promise.all(queries.map(query =>
      fetch(`${apiUrl}/api/${year}/${query.url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: query.body
      }).then(res => res.json())
        .then(result => ({
          title: query.title,
          subtitle: query.subtitle,
          rows: Object.values(result).map((item, i) => ({
            ...item,
            id: i
          })),
          desktopColumns: query.desktopColumns,
        }))
    ));

    // Generate the PDF
    res.forEach((category, index) => {
      if (index > 0) doc.addPage();

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Leaderboard for ${category.title} - ${tournamentName} ${year}`, 10, 10);
      doc.text(`Report generated on ${currentDate}`, 10, 18);

      // Generate table columns based on category desktopColumns
      const tableColumns = category.desktopColumns.map(col => col.headerName);
      const tableRows = category.rows.map(row => category.desktopColumns.map(col => row[col.field] || 'N/A'));

      doc.autoTable({
        startY: 30,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 10, halign: 'center', valign: 'middle', overflow: 'linebreak' },
        headStyles: { fillColor: '#02133E', textColor: '#ffffff', halign: 'center' },
      });
    });

    // Add page numbers
    addPageNumbers(doc);

    doc.save(`${tournamentName} ${year} Leaderboard Report.pdf`);
  } catch (error) {
    console.error("Error generating leaderboard report:", error);
  }
};

