import axios from 'axios';

// Define team data type
export interface TeamData {
  teamNumber: string;
  name?: string;
  startingPosition: string[];
  leavesStartingLine: string;
  coralScoredAutoL1: string;
  coralScoredAutoReef: string;
  algaeScoredAutoReef: string;
  primaryAutoActivity: string;
  coralScoringLocation: string[];
  algaeHandling: string[];
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

// Helper function to get full position name - support both string and array inputs
export const getPositionName = (position: string | string[]): string => {
  if (Array.isArray(position)) {
    // If it's an array, join the positions with commas
    return position.map(pos => getPositionName(pos)).join(', ');
  }
  
  // For single string values
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

// API URL configuration with environment-aware baseURL
// Determine if we're in production by checking the URL
const isProd = window.location.hostname !== 'localhost';
const API_BASE_URL = isProd
  ? window.location.origin  // In production, use the current domain
  : 'http://localhost:5001'; // In development, use the local server

const API_URL = `${API_BASE_URL}/api/teams`;

// Get all teams
export const getAllTeams = async (): Promise<TeamData[]> => {
  try {
    // First check if API is available with better error handling
    try {
      const statusResponse = await axios.get(`${API_BASE_URL}/api/status`);
      console.log('API Status:', statusResponse.data);
      
      // If MongoDB is not connected, log an error
      if (statusResponse.data.mongodb !== 'connected') {
        console.error('MongoDB is not connected:', statusResponse.data);
      }
    } catch (statusError) {
      console.error('API Status Check Failed:', statusError);
      // We'll still try to get the teams
    }

    const response = await axios.get(API_URL);
    
    // Add better logging for debugging
    console.log(`Successfully fetched ${response.data.length} teams`);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    // Return empty array to avoid app crashing
    return [];
  }
};

// Get team by team number
export const getTeamByNumber = async (teamNumber: string): Promise<TeamData | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/teams/${teamNumber}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching team ${teamNumber}:`, error);
    return null;
  }
};

// Add team data to MongoDB
export const addTeamData = async (teamData: TeamData): Promise<TeamData | null> => {
  try {
    console.log('Saving team data to API:', teamData);
    const response = await axios.post(API_URL, teamData);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving team data:', error);
    return null;
  }
}; 