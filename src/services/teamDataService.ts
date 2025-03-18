// Define team data type
export interface TeamData {
  teamNumber: string;
  name?: string;
  startingPosition: 'L' | 'M' | 'R' | 'N';
  leavesStartingLine: string;
  coralScoredAutoL1: string;
  coralScoredAutoReef: string;
  algaeScoredAutoReef: string;
  primaryAutoActivity: string;
  coralScoringLocation: string[];
  algaeHandling: string;
  defensePlayed: string;
  drivingSpeed: string;
  endgameAction: string;
  capabilities?: {
    autoScoring: boolean;
    highScoring: boolean;
    algaeHandling: boolean;
    climbing: boolean;
    fastDriving: boolean;
  };
}

// Helper function to get full position name
export const getPositionName = (position: string): string => {
  switch (position) {
    case 'L': return 'Left';
    case 'M': return 'Middle';
    case 'R': return 'Right';
    case 'N': return 'Does Not Move';
    // Handle old format values for backward compatibility
    case 'leftCoralStation': return 'Left';
    case 'middle': return 'Middle';
    case 'rightCoralStation': return 'Right';
    default: return position;
  }
};

// Mock team data for now, will be replaced with Firebase data
export const mockTeams: TeamData[] = [
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
    name: 'Team 254',
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
    name: 'Team 118',
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
    name: 'Team 714',
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

// Get all teams
export const getAllTeams = (): TeamData[] => {
  return mockTeams;
};

// Get team by team number
export const getTeamByNumber = (teamNumber: string): TeamData | undefined => {
  return mockTeams.find(team => team.teamNumber === teamNumber);
};

// This will be implemented with Firebase later
export const addTeamData = (teamData: TeamData): Promise<void> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Add team to mock data (in a real app, this would add to Firebase)
      mockTeams.push(teamData);
      resolve();
    }, 500);
  });
}; 