import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import { loadConfigForYear } from '../config/masterConfig';
// A truecolor (RGBA) copy of the tournament logo, not the shared dashboard
// asset directly - the original is an indexed/palette PNG, which jsPDF's
// image embedding corrupts (produces a broken PDF image stream). Converting
// once to truecolor here avoids that without touching the dashboard's copy.
import logoImage from './assets/tournamentLogo.png';

// Matches the physical dockside verification form exactly: 20 numbered rows,
// same column set. Angler and Weighmaster Signature are always left blank -
// those are filled in by hand (the angler's name isn't tracked per catch,
// only per team, and Weighmaster Signature is a physical signature).
const MAX_ROWS = 20;

const imageUrlToBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateCatchVerificationLog = async (year, tournamentName) => {
  const config = await loadConfigForYear(year);

  const apiUrl = import.meta.env.VITE_NODE_ENV === "staging"
    ? import.meta.env.VITE_SERVER_URL_STAGING
    : import.meta.env.VITE_SERVER_URL_PRODUCTION;

  const [teamsResponse, catchesResponse, logoBase64] = await Promise.all([
    fetch(`${apiUrl}/api/${year}/admin_get_database_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName: config.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME })
    }),
    fetch(`${apiUrl}/api/${year}/admin_get_database_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName: config.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME })
    }),
    imageUrlToBase64(logoImage),
  ]);

  const teamData = await teamsResponse.json();
  const catchData = await catchesResponse.json();

  const teamNames = Object.values(teamData)
    .map(team => team.teamName)
    .sort((a, b) => a.localeCompare(b));

  // Only billfish (Catch & Release category) - Meatfish is boated/weighed, not released
  const billfishCatches = Object.values(catchData).filter(c => c.speciesType === 'Catch & Release');

  const catchesByTeam = {};
  billfishCatches.forEach(c => {
    if (!catchesByTeam[c.teamName]) catchesByTeam[c.teamName] = [];
    catchesByTeam[c.teamName].push(c);
  });
  Object.values(catchesByTeam).forEach(list =>
    list.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
  );

  const doc = new jsPDF('portrait');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  teamNames.forEach((teamName, index) => {
    if (index > 0) doc.addPage();

    // Logo, top-left
    const logoW = 32;
    const logoH = logoW * (193 / 380);
    doc.addImage(logoBase64, 'PNG', margin, 10, logoW, logoH);

    // Header fields - only Boat Name is filled in; the rest are blank lines
    // (we don't track owner/captain separately, and Captain's needs a wet
    // signature regardless)
    const headerX = margin + logoW + 8;
    let headerY = 16;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Boat Name: ${teamName}`, headerX, headerY);
    doc.setFont(undefined, 'normal');

    headerY += 8;
    doc.text('Owner Cell: ______________________________', headerX, headerY);
    headerY += 8;
    doc.text('Captain (Name/Signature): ______________________________', headerX, headerY);
    headerY += 8;
    doc.text('Captain Cell: ______________________________', headerX, headerY);

    const tableStartY = Math.max(10 + logoH, headerY) + 10;

    const catches = (catchesByTeam[teamName] || []).slice(0, MAX_ROWS);
    const rows = [];
    for (let i = 0; i < MAX_ROWS; i++) {
      const c = catches[i];
      rows.push([
        i + 1,
        '',
        c ? c.species : '',
        c ? dayjs(c.dateTime).format('h:mm A') : '',
        c ? dayjs(c.dateTime).format('MM/DD/YYYY') : '',
        '',
      ]);
    }

    doc.autoTable({
      startY: tableStartY,
      head: [['#', 'Angler', 'Type of Billfish Released', 'Time\nReleased', 'Date of Release', 'Weighmaster Signature']],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 9,
        halign: 'center',
        valign: 'middle',
        minCellHeight: 9,
        lineWidth: 0.3,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.3,
        lineColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 32 },
        2: { cellWidth: 38 },
        3: { cellWidth: 22 },
        4: { cellWidth: 26 },
        5: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });
  });

  doc.save(`Catch_Verification_Log_${tournamentName}_${year}.pdf`);
};
