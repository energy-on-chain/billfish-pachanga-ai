const { getFirestore } = require("firebase-admin/firestore");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// CALCULATIONS
exports.getBillfishPachangaTournamentGrandChampion = async (req, res) => {
  console.log('Fetching billfish pachanga tournament grand champion...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, numPlaces, isReport } = req.body;

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

    // Assign places 
    let result;
    if (isReport) {
      result = sortedTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points
      }));
    } else {
      result = sortedTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching billfish pachanga tournament grand champion:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaOverallBillfishChampion = async (req, res) => {
  console.log('Fetching billfish pachanga overall billfish champion...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, numPlaces, isReport } = req.body;

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

    // Assign places 
    let result;
    if (isReport) {
      result = sortedTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch
      }));
    } else {
      result = sortedTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching billfish pachanga overall billfish champion:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaGrandSlams = async (req, res) => {
  console.log('Fetching billfish pachanga grand slams...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, numPlaces, isReport } = req.body;

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

    // Assign places 
    let result;
    if (isReport) {
      result = sortedTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        firstCatchBlueMarlin: team.firstCatchBlueMarlin,
        firstCatchWhiteMarlin: team.firstCatchWhiteMarlin,
        firstCatchSailfish: team.firstCatchSailfish
      }));
    } else {
      result = sortedTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        firstCatchBlueMarlin: team.firstCatchBlueMarlin,
        firstCatchWhiteMarlin: team.firstCatchWhiteMarlin,
        firstCatchSailfish: team.firstCatchSailfish
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching Grand Slams:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaBillfishDayChampion = async (req, res) => {
  console.log('Fetching billfish pachanga billfish day champion...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, numPlaces, isReport, day } = req.body;

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

    // Assign places 
    let result;
    if (isReport) {
      result = sortedTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch
      }));
    } else {
      result = sortedTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching billfish pachanga billfish day champion:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaBillfishSpeciesChampion = async (req, res) => {
  console.log('Fetching billfish pachanga billfish species champion...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, numPlaces, isReport, species } = req.body;

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

    // Assign places 
    let result;
    if (isReport) {
      result = sortedTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch
      }));
    } else {
      result = sortedTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        points: team.points,
        lastCatch: team.lastCatch
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching billfish pachanga billfish species champion:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.getBillfishPachangaMeatfishSpeciesChampion = async (req, res) => {
  console.log('Fetching billfish pachanga meatfish species champion...');
  try {
    const year = req.params.year;
    const db = getFirestore();
    const { catchYear, numPlaces, isReport, species } = req.body;

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

    // Assign places 
    let result;
    if (isReport) {
      result = sortedTeams.map((team, index) => ({
        place: index + 1,
        team: team.team,
        weight: team.weight,
        length: team.length,
        girth: team.girth
      }));
    } else {
      result = sortedTeams.slice(0, numPlaces).map((team, index) => ({
        place: index + 1,
        team: team.team,
        weight: team.weight,
        length: team.length,
        girth: team.girth
      }));
    }

    // Return result
    res.status(200).json(result);

  } catch (e) {
    console.log('Error fetching Meatfish Species Champion:', e);
    res.status(500).json({ error: e.message });
  }
};

