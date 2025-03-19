/**
 * Script to seed initial team data into MongoDB
 * Run with: node seedData.js
 */

const axios = require('axios');

// Sample team data
const sampleTeams = [
  { 
    teamNumber: '1812',
    name: 'Team 1812',
    startingPosition: 'L',
    leavesStartingLine: 'yes',
    coralScoredAutoL1: '2',
    coralScoredAutoReef: '1',
    algaeScoredAutoReef: '0',
    primaryAutoActivity: 'retrievesAndScores',
    coralScoringLocation: ['troughL1', 'L2Branches', 'L3Branches'],
    algaeHandling: 'collectsFromReef',
    defensePlayed: 'occasionally',
    drivingSpeed: 'fast',
    endgameAction: 'climbsCageShallow',
    capabilities: {
      autoScoring: true,
      highScoring: true,
      algaeHandling: true,
      climbing: true,
      fastDriving: true,
    }
  },
  { 
    teamNumber: '254',
    name: 'The Cheesy Poofs',
    startingPosition: 'R',
    leavesStartingLine: 'yes',
    coralScoredAutoL1: '3+',
    coralScoredAutoReef: '2',
    algaeScoredAutoReef: '1',
    primaryAutoActivity: 'retrievesAndScores',
    coralScoringLocation: ['troughL1', 'L2Branches', 'L3Branches', 'L4Branches'],
    algaeHandling: 'bothBandC',
    defensePlayed: 'never',
    drivingSpeed: 'veryFast',
    endgameAction: 'climbsCageDeep',
    capabilities: {
      autoScoring: true,
      highScoring: true,
      algaeHandling: true,
      climbing: true,
      fastDriving: true,
    }
  },
  { 
    teamNumber: '118',
    name: 'The Robonauts',
    startingPosition: 'M',
    leavesStartingLine: 'yes',
    coralScoredAutoL1: '1',
    coralScoredAutoReef: '0',
    algaeScoredAutoReef: '2+',
    primaryAutoActivity: 'algaeRemoval',
    coralScoringLocation: ['troughL1'],
    algaeHandling: 'scoresInProcessor',
    defensePlayed: 'frequently',
    drivingSpeed: 'moderate',
    endgameAction: 'parksInBargeZone',
    capabilities: {
      autoScoring: false,
      highScoring: false,
      algaeHandling: true,
      climbing: false,
      fastDriving: true,
    }
  },
  { 
    teamNumber: '714',
    name: 'TNTH',
    startingPosition: 'L',
    leavesStartingLine: 'yes',
    coralScoredAutoL1: '2',
    coralScoredAutoReef: '1',
    algaeScoredAutoReef: '1',
    primaryAutoActivity: 'retrievesAndScores',
    coralScoringLocation: ['troughL1', 'L2Branches'],
    algaeHandling: 'collectsFromFloor',
    defensePlayed: 'never',
    drivingSpeed: 'fast',
    endgameAction: 'climbsCageShallow',
    capabilities: {
      autoScoring: true,
      highScoring: false,
      algaeHandling: true,
      climbing: true,
      fastDriving: false,
    }
  },
];

// Function to add teams to the database
async function seedTeams() {
  try {
    console.log('Starting to seed team data...');
    
    for (const team of sampleTeams) {
      console.log(`Adding team ${team.teamNumber}...`);
      
      try {
        const response = await axios.post('http://localhost:5001/api/teams', team);
        console.log(`Team ${team.teamNumber} added successfully!`);
      } catch (error) {
        console.error(`Error adding team ${team.teamNumber}:`, error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
      }
    }
    
    console.log('Seeding completed!');
  } catch (error) {
    console.error('Error in seeding process:', error);
  }
}

// Run the seeding function
seedTeams(); 