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
    if (position.length === 0) return 'Unknown';
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
    default: return position || 'Unknown';
  }
};

// API URL configuration with environment-aware baseURL
// Determine if we're in production by checking the URL
const isProd = window.location.hostname !== 'localhost';
const API_BASE_URL = isProd
  ? window.location.origin  // In production, use the current domain
  : 'http://localhost:5001'; // In development, use the local server

const API_URL = `${API_BASE_URL}/api/teams`;

// Utility function for retrying failed API calls
const retryAxios = async (fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.log(`Retrying API call, ${retries} attempts left`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryAxios(fn, retries - 1, delay);
  }
};

// Get all teams with retry logic
export const getAllTeams = async (): Promise<TeamData[]> => {
  try {
    // First check if API is available with better error handling
    try {
      const statusResponse = await retryAxios(() => axios.get(`${API_BASE_URL}/api/status`));
      console.log('API Status:', statusResponse.data);
      
      // If MongoDB is not connected, log an error
      if (statusResponse.data.mongodb !== 'connected') {
        console.error('MongoDB is not connected:', statusResponse.data);
      }
    } catch (statusError) {
      console.error('API Status Check Failed:', statusError);
      // We'll still try to get the teams
    }

    const response = await retryAxios(() => axios.get(API_URL));
    
    // Add better logging for debugging
    console.log(`Successfully fetched ${response.data.length} teams`);
    
    // Ensure all teams have proper array fields
    const teams = response.data.map((team: any) => ({
      ...team,
      startingPosition: Array.isArray(team.startingPosition) ? team.startingPosition : 
                         team.startingPosition ? [team.startingPosition] : [],
      coralScoringLocation: Array.isArray(team.coralScoringLocation) ? team.coralScoringLocation : 
                          team.coralScoringLocation ? [team.coralScoringLocation] : [],
      algaeHandling: Array.isArray(team.algaeHandling) ? team.algaeHandling : 
                    team.algaeHandling ? [team.algaeHandling] : []
    }));
    
    return teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    // Return empty array to avoid app crashing
    return [];
  }
};

// Get team by team number with retry logic
export const getTeamByNumber = async (teamNumber: string): Promise<TeamData | null> => {
  try {
    const response = await retryAxios(() => axios.get(`${API_BASE_URL}/api/teams/${teamNumber}`));
    
    // Ensure proper array fields
    if (response.data) {
      return {
        ...response.data,
        startingPosition: Array.isArray(response.data.startingPosition) ? response.data.startingPosition : 
                           response.data.startingPosition ? [response.data.startingPosition] : [],
        coralScoringLocation: Array.isArray(response.data.coralScoringLocation) ? response.data.coralScoringLocation : 
                            response.data.coralScoringLocation ? [response.data.coralScoringLocation] : [],
        algaeHandling: Array.isArray(response.data.algaeHandling) ? response.data.algaeHandling : 
                      response.data.algaeHandling ? [response.data.algaeHandling] : []
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching team ${teamNumber}:`, error);
    return null;
  }
};

// Add team data to MongoDB with retry logic
export const addTeamData = async (teamData: TeamData): Promise<TeamData | null> => {
  try {
    console.log('Saving team data to API:', teamData);
    
    // Ensure data has proper array fields before sending
    const preparedData = {
      ...teamData,
      startingPosition: Array.isArray(teamData.startingPosition) ? teamData.startingPosition : 
                        teamData.startingPosition ? [teamData.startingPosition] : [],
      coralScoringLocation: Array.isArray(teamData.coralScoringLocation) ? teamData.coralScoringLocation : 
                          teamData.coralScoringLocation ? [teamData.coralScoringLocation] : [],
      algaeHandling: Array.isArray(teamData.algaeHandling) ? teamData.algaeHandling : 
                    teamData.algaeHandling ? [teamData.algaeHandling] : []
    };
    
    const response = await retryAxios(() => axios.post(API_URL, preparedData));
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving team data:', error);
    return null;
  }
}; 