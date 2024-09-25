const { getFirestore } = require("firebase-admin/firestore");
const admin = require('firebase-admin');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

exports.getAllPotData = async (req, res) => {
  console.log('Fetching all pot data...');
  const year = req.params.year;
  const db = getFirestore();
  const { potYear } = req.body;  // Receive the potYear from the request body

  try {
    // Reference to the potYear collection
    const potCollectionRef = db.collection(`pots${year}`);
    
    // Fetch all documents in the collection
    const snapshot = await potCollectionRef.get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: 'No pots found for this year.' });
    }

    // Process the snapshot and return the data
    const potData = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      potData.push({
        id: doc.id, // Document ID
        ...data,   // All the document fields
      });
    });

    // Send the data as the response
    res.status(200).json({ data: potData });

  } catch (error) {
    console.error('Error fetching pot data:', error);
    res.status(500).json({ error: 'Failed to fetch pot data. Please try again later.' });
  }
};

exports.getTotalPotSizeData = async (req, res) => {
  console.log('Fetching total pot size data...');
  const year = req.params.year;
  const db = getFirestore();
  const { potYear, boardNames } = req.body;  // Receive the potYear and boardNames from the request body

  try {
    // Reference to the potYear collection
    const potCollectionRef = db.collection(`pots${year}`);
    
    // Fetch all documents in the collection
    const snapshot = await potCollectionRef.get();
    
    // If the collection does not exist or is empty
    if (!snapshot || snapshot.empty) {
      // Initialize totals to 0
      let totalPotSize = 0;
      const boardTotals = {};

      // Set totals for each board name to 0
      boardNames.forEach(board => {
        boardTotals[board] = 0;
      });

      return res.status(200).json({
        totalPotSize,
        boardTotals
      });
    }

    // Initialize totals
    let totalPotSize = 0;
    const boardTotals = {};
    
    // Initialize board totals for each board name
    boardNames.forEach(board => {
      boardTotals[board] = 0;
    });

    // Process the snapshot to calculate the total money in each board
    snapshot.forEach(doc => {
      const data = doc.data();
      totalPotSize += parseFloat(data.totalPotFee || 0);

      // Sum the fees for each board
      boardNames.forEach(board => {
        // Construct the board fee key dynamically
        const boardFeeKey = `total${board.replace(/ /g, '')}Fee`; // Remove spaces and special characters
        console.log('boardFeeKey', boardFeeKey);
        boardTotals[board] += parseFloat(data[boardFeeKey] || 0);
      });
    });

    // Return the total pot size and board totals
    return res.status(200).json({
      totalPotSize,
      boardTotals
    });

  } catch (error) {
    console.error('Error fetching total pot size data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBillfishPachangaTournamentGrandChampionPotStandings = async (req, res) => {
  console.log('Fetching billfish pachanga tournament grand champion...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, potYear, isReport, potName, entryAmount, tournamentCut, payoutStructure, numPlaces} = req.body;

    console.log(year);
    console.log(req.body);

    // Fetch all catches for the given year
    const catchesRef = db.collection(`catches${year}`);
    const snapshot = await catchesRef.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    // Aggregate points by team
    const teamPoints = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const { teamId, teamName, points, speciesType, dateTime } = data;

      if (!teamPoints[teamId]) {
        teamPoints[teamId] = {
          team: teamName,
          points: 0,
          lastCatch: null
        };
      }

      teamPoints[teamId].points += parseInt(points);

      if (speciesType === 'Catch & Release') {
        if (!teamPoints[teamId].lastCatch || new Date(dateTime) > new Date(teamPoints[teamId].lastCatch)) {
          teamPoints[teamId].lastCatch = dateTime;
        }
      }
    });

    // Convert the teamPoints object to an array and sort by points and last catch time
    const sortedTeams = Object.values(teamPoints).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (a.lastCatch && b.lastCatch) {
        return new Date(a.lastCatch) - new Date(b.lastCatch);
      }
      return 0;
    });

    // Fetch all teams that entered the given pot
    const potRef = db.collection(`pots${year}`);
    const potSnapshot = await potRef.get();

    let teamsInPot = [];
    let numTeamsInPot = 0;
    let grossTotal = 0;

    potSnapshot.forEach(doc => {
      const data = doc.data();
      const { teamName, boardSelections } = data;

      // Check if the team entered the specific pot
      const enteredPot = boardSelections.some(selection =>
        selection.potList.includes(potName)
      );

      if (enteredPot) {
        numTeamsInPot++;
        grossTotal += parseFloat(entryAmount);
        teamsInPot.push(teamName);
        console.log(teamName + ' is in the pot!');
      }
    });

    const netTotal = grossTotal * (1 - parseFloat(tournamentCut));

    // Filter out teams that are not in the pot
    const filteredTeams = sortedTeams.filter(team => teamsInPot.includes(team.team));

    // Assign places and calculate payouts
    let result;
    if (isReport) {
      result = filteredTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    } else {
      result = filteredTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    }
    console.log('result', result)

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching billfish pachanga tournament grand champion:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaOverallBillfishChampionPotStandings = async (req, res) => {
  console.log('Fetching billfish pachanga overall billfish champion...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, potYear, isReport, potName, entryAmount, tournamentCut, payoutStructure, numPlaces} = req.body;

    // Fetch all catches for the given year and speciesType "Catch & Release"
    const catchesRef = db.collection(`catches${year}`);
    const snapshot = await catchesRef.where('speciesType', '==', 'Catch & Release').get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    // Aggregate points by team
    const teamPoints = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const { teamId, teamName, points, dateTime } = data;

      if (!teamPoints[teamId]) {
        teamPoints[teamId] = {
          team: teamName,
          points: 0,
          lastCatch: dateTime
        };
      }

      teamPoints[teamId].points += parseInt(points);
      if (new Date(dateTime) > new Date(teamPoints[teamId].lastCatch)) {
        teamPoints[teamId].lastCatch = dateTime;
      }
    });

    // Convert the teamPoints object to an array and sort by points and last catch time
    const sortedTeams = Object.values(teamPoints).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return new Date(a.lastCatch) - new Date(b.lastCatch);
    });

    // Fetch all teams that entered the given pot
    const potRef = db.collection(`pots${year}`);
    const potSnapshot = await potRef.get();

    let teamsInPot = [];
    let numTeamsInPot = 0;
    let grossTotal = 0;

    potSnapshot.forEach(doc => {
      const data = doc.data();
      const { teamName, boardSelections } = data;

      // Check if the team entered the specific pot
      const enteredPot = boardSelections.some(selection =>
        selection.potList.includes(potName)
      );

      if (enteredPot) {
        numTeamsInPot++;
        grossTotal += parseFloat(entryAmount);
        teamsInPot.push(teamName);
        console.log(teamName + ' is in the pot!');
      }
    });

    const netTotal = grossTotal * (1 - parseFloat(tournamentCut));

    // Filter out teams that are not in the pot
    const filteredTeams = sortedTeams.filter(team => teamsInPot.includes(team.team));

    // Assign places 
    let result;
    if (isReport) {
      result = filteredTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    } else {
      result = filteredTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching billfish pachanga overall billfish champion:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaGrandSlamsPotStandings = async (req, res) => {
  console.log('Fetching billfish pachanga grand slams...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, potYear, isReport, potName, entryAmount, tournamentCut, payoutStructure, numPlaces} = req.body;

    // Fetch all catches for the given year
    const catchesRef = db.collection(`catches${year}`);
    const snapshot = await catchesRef.where('speciesType', '==', 'Catch & Release').get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    // Required species for Grand Slam
    const requiredSpecies = ['Blue Marlin', 'White Marlin', 'Sailfish'];

    // Aggregate data by team
    const teamData = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const { teamId, teamName, species, dateTime } = data;

      if (!requiredSpecies.includes(species)) return;

      if (!teamData[teamId]) {
        teamData[teamId] = {
          team: teamName,
          catches: {},
          firstCatchBlueMarlin: null,
          firstCatchWhiteMarlin: null,
          firstCatchSailfish: null
        };
      }

      if (!teamData[teamId].catches[species]) {
        teamData[teamId].catches[species] = dateTime;
      }

      if (species === 'Blue Marlin' && (!teamData[teamId].firstCatchBlueMarlin || new Date(dateTime) < new Date(teamData[teamId].firstCatchBlueMarlin))) {
        teamData[teamId].firstCatchBlueMarlin = dateTime;
      }

      if (species === 'White Marlin' && (!teamData[teamId].firstCatchWhiteMarlin || new Date(dateTime) < new Date(teamData[teamId].firstCatchWhiteMarlin))) {
        teamData[teamId].firstCatchWhiteMarlin = dateTime;
      }

      if (species === 'Sailfish' && (!teamData[teamId].firstCatchSailfish || new Date(dateTime) < new Date(teamData[teamId].firstCatchSailfish))) {
        teamData[teamId].firstCatchSailfish = dateTime;
      }
    });

    // Filter teams that have caught all required species
    const qualifiedTeams = Object.values(teamData).filter(team => {
      return requiredSpecies.every(species => team.catches[species]);
    });

    // Sort teams by the quickest time to complete the Grand Slam
    const sortedTeams = qualifiedTeams.sort((a, b) => {
      const aTimes = [new Date(a.firstCatchBlueMarlin), new Date(a.firstCatchWhiteMarlin), new Date(a.firstCatchSailfish)];
      const bTimes = [new Date(b.firstCatchBlueMarlin), new Date(b.firstCatchWhiteMarlin), new Date(b.firstCatchSailfish)];
      const aMaxTime = new Date(Math.max(...aTimes));
      const bMaxTime = new Date(Math.max(...bTimes));
      return aMaxTime - bMaxTime;
    });

    // Fetch all teams that entered the given pot
    const potRef = db.collection(`pots${year}`);
    const potSnapshot = await potRef.get();

    let teamsInPot = [];
    let numTeamsInPot = 0;
    let grossTotal = 0;

    potSnapshot.forEach(doc => {
      const data = doc.data();
      const { teamName, boardSelections } = data;

      // Check if the team entered the specific pot
      const enteredPot = boardSelections.some(selection =>
        selection.potList.includes(potName)
      );

      if (enteredPot) {
        numTeamsInPot++;
        grossTotal += parseFloat(entryAmount);
        teamsInPot.push(teamName);
        console.log(teamName + ' is in the pot!');
      }
    });

    const netTotal = grossTotal * (1 - parseFloat(tournamentCut));

    // Filter out teams that are not in the pot
    const filteredTeams = sortedTeams.filter(team => teamsInPot.includes(team.team));

    // Assign places 
    let result;
    if (isReport) {
      result = filteredTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        firstCatchBlueMarlin: team.firstCatchBlueMarlin,
        firstCatchWhiteMarlin: team.firstCatchWhiteMarlin,
        firstCatchSailfish: team.firstCatchSailfish,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    } else {
      result = filteredTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        firstCatchBlueMarlin: team.firstCatchBlueMarlin,
        firstCatchWhiteMarlin: team.firstCatchWhiteMarlin,
        firstCatchSailfish: team.firstCatchSailfish,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching Grand Slams:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaBillfishDayChampionPotStandings = async (req, res) => {
  console.log('Fetching billfish pachanga billfish day champion...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, potYear, isReport, day, potName, entryAmount, tournamentCut, payoutStructure, numPlaces} = req.body;

    // Ensure the day is a string in 'YYYY-MM-DD' format
    const dayString = new Date(day).toISOString().split('T')[0];

    // Fetch all catches for the given year and speciesType "Catch & Release" that match the given day
    const catchesRef = db.collection(`catches${year}`);
    const snapshot = await catchesRef.where('speciesType', '==', 'Catch & Release').get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    // Aggregate points by team and store last catch time
    const teamPoints = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const { teamId, teamName, points, dateTime } = data;

      const originalCatchDate = new Date(dateTime).toISOString().split('T')

      const adjustedDateTime = new Date(new Date(dateTime).getTime() - (5 * 60 * 60 * 1000));
      const catchDate = adjustedDateTime.toISOString().split('T')[0];
      if (catchDate !== dayString) return;

      if (!teamPoints[teamId]) {
        teamPoints[teamId] = {
          team: teamName,
          points: 0,
          lastCatch: dateTime
        };
      }

      teamPoints[teamId].points += parseInt(points);
      if (new Date(dateTime) > new Date(teamPoints[teamId].lastCatch)) {
        teamPoints[teamId].lastCatch = dateTime;
      }
    });

    // Convert the teamPoints object to an array and sort by points and last catch time
    const sortedTeams = Object.values(teamPoints).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return new Date(a.lastCatch) - new Date(b.lastCatch);
    });

    // Fetch all teams that entered the given pot
    const potRef = db.collection(`pots${year}`);
    const potSnapshot = await potRef.get();

    let teamsInPot = [];
    let numTeamsInPot = 0;
    let grossTotal = 0;

    potSnapshot.forEach(doc => {
      const data = doc.data();
      const { teamName, boardSelections } = data;

      // Check if the team entered the specific pot
      const enteredPot = boardSelections.some(selection =>
        selection.potList.includes(potName)
      );

      if (enteredPot) {
        numTeamsInPot++;
        grossTotal += parseFloat(entryAmount);
        teamsInPot.push(teamName);
        console.log(teamName + ' is in the pot!');
      }
    });

    const netTotal = grossTotal * (1 - parseFloat(tournamentCut));

    // Filter out teams that are not in the pot
    const filteredTeams = sortedTeams.filter(team => teamsInPot.includes(team.team));

    // Assign places 
    let result;
    if (isReport) {
      result = filteredTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    } else {
      result = filteredTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching billfish pachanga billfish day champion:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaBillfishSpeciesChampionPotStandings = async (req, res) => {
  console.log('Fetching billfish pachanga billfish species champion...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, potYear, isReport, species, potName, entryAmount, tournamentCut, payoutStructure, numPlaces} = req.body;

    // Fetch all catches for the given year and species
    const catchesRef = db.collection(`catches${year}`);
    const snapshot = await catchesRef.where('species', '==', species).get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    // Aggregate points by team
    const teamPoints = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const { teamId, teamName, points, dateTime } = data;

      if (!teamPoints[teamId]) {
        teamPoints[teamId] = {
          team: teamName,
          points: 0,
          lastCatch: dateTime
        };
      }

      teamPoints[teamId].points += parseInt(points);
      if (new Date(dateTime) > new Date(teamPoints[teamId].lastCatch)) {
        teamPoints[teamId].lastCatch = dateTime;
      }
    });

    // Convert the teamPoints object to an array and sort by points and last catch time
    const sortedTeams = Object.values(teamPoints).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return new Date(a.lastCatch) - new Date(b.lastCatch);
    });

    // Fetch all teams that entered the given pot
    const potRef = db.collection(`pots${year}`);
    const potSnapshot = await potRef.get();

    let teamsInPot = [];
    let numTeamsInPot = 0;
    let grossTotal = 0;

    potSnapshot.forEach(doc => {
      const data = doc.data();
      const { teamName, boardSelections } = data;

      // Check if the team entered the specific pot
      const enteredPot = boardSelections.some(selection =>
        selection.potList.includes(potName)
      );

      if (enteredPot) {
        numTeamsInPot++;
        grossTotal += parseFloat(entryAmount);
        teamsInPot.push(teamName);
        console.log(teamName + ' is in the pot!');
      }
    });

    const netTotal = grossTotal * (1 - parseFloat(tournamentCut));

    // Filter out teams that are not in the pot
    const filteredTeams = sortedTeams.filter(team => teamsInPot.includes(team.team));

    // Assign places 
    let result;
    if (isReport) {
      result = filteredTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    } else {
      result = filteredTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching billfish pachanga billfish species champion:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaOverallBillfishNonSonarPotStandings = async (req, res) => {
  console.log('Fetching billfish pachanga overall billfish non sonar champion...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, potYear, isReport, potName, entryAmount, tournamentCut, payoutStructure, numPlaces} = req.body;

    // Fetch all catches for the given year and speciesType "Catch & Release"
    const catchesRef = db.collection(`catches${year}`);
    const snapshot = await catchesRef.where('speciesType', '==', 'Catch & Release').get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    // Aggregate points by team
    const teamPoints = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const { teamId, teamName, points, dateTime } = data;

      if (!teamPoints[teamId]) {
        teamPoints[teamId] = {
          team: teamName,
          points: 0,
          lastCatch: dateTime
        };
      }

      teamPoints[teamId].points += parseInt(points);
      if (new Date(dateTime) > new Date(teamPoints[teamId].lastCatch)) {
        teamPoints[teamId].lastCatch = dateTime;
      }
    });

    // Convert the teamPoints object to an array and sort by points and last catch time
    const sortedTeams = Object.values(teamPoints).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return new Date(a.lastCatch) - new Date(b.lastCatch);
    });

    // Fetch all teams that entered the given pot
    const potRef = db.collection(`pots${year}`);
    const potSnapshot = await potRef.get();

    let teamsInPot = [];
    let numTeamsInPot = 0;
    let grossTotal = 0;

    potSnapshot.forEach(doc => {
      const data = doc.data();
      const { teamName, boardSelections } = data;

      // Check if the team entered the specific pot
      const enteredPot = boardSelections.some(selection =>
        selection.potList.includes(potName)
      );

      if (enteredPot) {
        numTeamsInPot++;
        grossTotal += parseFloat(entryAmount);
        teamsInPot.push(teamName);
        console.log(teamName + ' is in the pot!');
      }
    });

    const netTotal = grossTotal * (1 - parseFloat(tournamentCut));

    // Filter out teams that are not in the pot
    const filteredTeams = sortedTeams.filter(team => teamsInPot.includes(team.team));

    // Assign places 
    let result;
    if (isReport) {
      result = filteredTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    } else {
      result = filteredTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching billfish pachanga overall billfish non sonar champion:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaMeatfishSpeciesChampionPotStandings = async (req, res) => {
  console.log('Fetching billfish pachanga meatfish species champion...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, potYear, isReport, species, potName, entryAmount, tournamentCut, payoutStructure, numPlaces} = req.body;

    // Fetch all catches for the given year and species
    const catchesRef = db.collection(`catches${year}`);
    const snapshot = await catchesRef.where('species', '==', species).get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    // Object to store the heaviest fish for each team
    const teamPoints = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const { teamId, teamName, weight, length, girth } = data;

      // Ensure that weight, length, and girth are treated as numbers
      const parsedWeight = parseFloat(weight);
      const parsedLength = parseFloat(length);
      const parsedGirth = parseFloat(girth);

      // Check if this catch is the heaviest for the team, or breaks a tie
      if (!teamPoints[teamId] || 
          parsedWeight > teamPoints[teamId].weight || 
          (parsedWeight === teamPoints[teamId].weight && parsedLength > teamPoints[teamId].length) ||
          (parsedWeight === teamPoints[teamId].weight && parsedLength === teamPoints[teamId].length && parsedGirth > teamPoints[teamId].girth)) {
        teamPoints[teamId] = {
          team: teamName,
          weight: parsedWeight,
          length: parsedLength,
          girth: parsedGirth
        };
      }
    });

    // Convert the teamPoints object to an array and sort by weight, length, and girth
    const sortedTeams = Object.values(teamPoints).sort((a, b) => {
      if (b.weight !== a.weight) {
        return b.weight - a.weight;
      }
      if (b.length !== a.length) {
        return b.length - a.length;
      }
      return b.girth - a.girth;
    });

    // Fetch all teams that entered the given pot
    const potRef = db.collection(`pots${year}`);
    const potSnapshot = await potRef.get();

    let teamsInPot = [];
    let numTeamsInPot = 0;
    let grossTotal = 0;

    potSnapshot.forEach(doc => {
      const data = doc.data();
      const { teamName, boardSelections } = data;

      // Check if the team entered the specific pot
      const enteredPot = boardSelections.some(selection =>
        selection.potList.includes(potName)
      );

      if (enteredPot) {
        numTeamsInPot++;
        grossTotal += parseFloat(entryAmount);
        teamsInPot.push(teamName);
        console.log(teamName + ' is in the pot!');
      }
    });

    const netTotal = grossTotal * (1 - parseFloat(tournamentCut));

    // Filter out teams that are not in the pot
    const filteredTeams = sortedTeams.filter(team => teamsInPot.includes(team.team));

    // Assign places 
    let result;
    if (isReport) {
      result = filteredTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        weight: team.weight,
        length: team.length,
        girth: team.girth,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    } else {
      result = filteredTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        weight: team.weight,
        length: team.length,
        girth: team.girth,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching Meatfish Species Champion:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaCaptainAndMatePotStandings = async (req, res) => {
  console.log('Fetching billfish pachanga captain and mate pot winners...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, potYear, isReport, potName, entryAmount, tournamentCut, payoutStructure, numPlaces} = req.body;

    // Fetch all catches for the given year
    const catchesRef = db.collection(`catches${year}`);
    const snapshot = await catchesRef.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    // Aggregate points by team
    const teamPoints = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const { teamId, teamName, points, speciesType, dateTime } = data;

      if (!teamPoints[teamId]) {
        teamPoints[teamId] = {
          team: teamName,
          points: 0,
          lastCatch: null
        };
      }

      teamPoints[teamId].points += parseInt(points);

      if (speciesType === 'Catch & Release') {
        if (!teamPoints[teamId].lastCatch || new Date(dateTime) > new Date(teamPoints[teamId].lastCatch)) {
          teamPoints[teamId].lastCatch = dateTime;
        }
      }
    });

    // Convert the teamPoints object to an array and sort by points and last catch time
    const sortedTeams = Object.values(teamPoints).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (a.lastCatch && b.lastCatch) {
        return new Date(a.lastCatch) - new Date(b.lastCatch);
      }
      return 0;
    });

    // Fetch all teams that entered the given pot
    const potRef = db.collection(`pots${year}`);
    const potSnapshot = await potRef.get();

    let teamsInPot = [];
    let numTeamsInPot = 0;
    let grossTotal = 0;

    potSnapshot.forEach(doc => {
      const data = doc.data();
      const { teamName, boardSelections } = data;

      // Check if the team entered the specific pot
      const enteredPot = boardSelections.some(selection =>
        selection.potList.includes(potName)
      );

      if (enteredPot) {
        numTeamsInPot++;
        grossTotal += parseFloat(entryAmount);
        teamsInPot.push(teamName);
        console.log(teamName + ' is in the pot!');
      }
    });

    const netTotal = grossTotal * (1 - parseFloat(tournamentCut));

    // Filter out teams that are not in the pot
    const filteredTeams = sortedTeams.filter(team => teamsInPot.includes(team.team));

    // Assign places and calculate payouts
    let result;
    if (isReport) {
      result = filteredTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    } else {
      result = filteredTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        payout: payoutStructure[index + 1] ? parseFloat(payoutStructure[index + 1]) * netTotal : 0, // Calculate payout based on the place
        totalPayout: netTotal,
      }));
    }
    console.log('result', result)

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching billfish pachanga captain and mate pot winners:', e);
    res.status(500).json({ error: e.message });
  }
};

