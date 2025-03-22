import axios from 'axios';

// Alliance interfaces
export interface Alliance {
  allianceNumber: number;
  captain: number;
  firstPick: number;
  secondPick: number;
}

export interface AllianceData {
  eventKey: string;
  alliances: Alliance[];
  timestamp?: Date;
}

// API URL configuration with environment-aware baseURL
// Determine if we're in production by checking the URL
const isProd = window.location.hostname !== 'localhost';
const API_BASE_URL = isProd
  ? window.location.origin  // In production, use the current domain
  : 'http://localhost:5001'; // In development, use the local server

// Get alliances for a specific event
export const getAlliances = async (eventKey: string): Promise<Alliance[]> => {
  try {
    console.log(`Getting alliances for event: ${eventKey} from ${API_BASE_URL}/api/alliances/${eventKey}`);
    const response = await axios.get(`${API_BASE_URL}/api/alliances/${eventKey}`);
    console.log('Alliance data response:', response.data);
    return response.data?.alliances || [];
  } catch (error) {
    console.error('Error fetching alliances:', error);
    return [];
  }
};

// Save alliances for an event
export const saveAlliances = async (allianceData: AllianceData): Promise<AllianceData | null> => {
  try {
    console.log('Saving alliance data:', allianceData);
    const response = await axios.post(`${API_BASE_URL}/api/alliances`, allianceData);
    console.log('Alliance save response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving alliances:', error);
    return null;
  }
}; 