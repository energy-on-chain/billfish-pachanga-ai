import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import { loadConfigForYear } from '../config/masterConfig';  // Dynamic config loader

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

export const generatePotsReport = async (year, tournamentName) => {
  const doc = new jsPDF('landscape');
  const currentDate = dayjs().format('MMMM D, YYYY h:mm A [CST]');

  try {
    // Load dynamic config for the specific year
    const config = await loadConfigForYear(year);

    let apiUrl = null;
    if (process.env.REACT_APP_NODE_ENV === "staging") {
      apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
    } else if (process.env.REACT_APP_NODE_ENV === "production") {
      apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
    }

    // Build queries for payouts using dynamic config
    const queries = config.potsConfig.CONFIG_POTS_CATEGORIES.map((item) => {
      let bodyData = {
        catchYear: config.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,  // Dynamically loaded config
        potYear: config.generalConfig.CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,  // Dynamically loaded config
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

    // Fetch data for each pot category
    const results = await Promise.all(queries.map((query) => {
      return fetch(`${apiUrl}/api/${year}/${query.url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: query.body
      }).then(r => r.json()).then((result) => {
        let tempRows = [];
        Object.keys(result).forEach((catchKey, i) => {
          tempRows.push({ ...result[catchKey], id: i, catchId: catchKey });
        });
        return {
          title: query.title,
          subtitle: query.subtitle,
          numPlaces: query.numPlaces,
          rows: tempRows,
          desktopColumns: query.desktopColumns,
        };
      });
    }));

    // Generate PDF for each pot category
    results.forEach((result, index) => {
      if (index > 0) doc.addPage();

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${result.title} - ${tournamentName} ${year}`, 10, 10);
      doc.text(`Report generated on ${currentDate}`, 10, 18);

      // Calculate total payout
      const totalPayout = result.rows.reduce((sum, row) => sum + (row.payout || 0), 0);
      doc.text(`Total Payout: ${formatCurrency(totalPayout)}`, 10, 26); // Display total payout

      const tableColumn = result.desktopColumns.map(column => column.headerName);
      const tableRows = result.rows.map(row => {
        return result.desktopColumns.map(column => {
          // Format the payout column as currency
          if (column.field === 'payout') {
            return formatCurrency(row[column.field] || 0);
          }
          return row[column.field] || 'N/A';
        });
      });

      doc.autoTable({
        startY: 36, // Adjusted to make space for the total payout
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 10, halign: 'center', valign: 'middle', overflow: 'linebreak' },
        headStyles: { fillColor: '#02133E', textColor: '#ffffff', halign: 'center' },
      });
    });

    addPageNumbers(doc);
    doc.save(`PotStandings_${tournamentName}_${year}.pdf`);
  } catch (error) {
    console.error("Error generating pot report:", error);
  }
};

