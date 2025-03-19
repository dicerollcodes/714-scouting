import axios from 'axios';

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

// API URL - will work both locally and in production
const API_URL = '/api/teams';

// Get all teams
export const getAllTeams = async (): Promise<TeamData[]> => {
  try {
    // First check if API is available
    await axios.get('/api/status').catch((error) => {
      console.error('API Status Check Failed:', error);
      throw new Error('API server is not responding');
    });

    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};

// Get team by team number
export const getTeamByNumber = async (teamNumber: string): Promise<TeamData | null> => {
  try {
    const teams = await getAllTeams();
    return teams.find(team => team.teamNumber === teamNumber) || null;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
};

// Add team data to MongoDB
export const addTeamData = async (teamData: TeamData): Promise<TeamData | null> => {
  try {
    const response = await axios.post(API_URL, teamData);
    return response.data;
  } catch (error) {
    console.error('Error saving team data:', error);
    return null;
  }
}; 