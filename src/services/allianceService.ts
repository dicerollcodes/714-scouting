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

// Get alliances for a specific event with retry logic
export const getAlliances = async (eventKey: string): Promise<Alliance[]> => {
  try {
    console.log(`Getting alliances for event: ${eventKey} from ${API_BASE_URL}/api/alliances/${eventKey}`);
    const response = await retryAxios(() => axios.get(`${API_BASE_URL}/api/alliances/${eventKey}`));
    console.log('Alliance data response:', response.data);
    
    // Validate the response data
    if (response.data && response.data.alliances && Array.isArray(response.data.alliances)) {
      return response.data.alliances;
    }
    console.warn('Invalid alliance data format received:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching alliances:', error);
    return [];
  }
};

// Save alliances for an event with retry logic
export const saveAlliances = async (allianceData: AllianceData): Promise<AllianceData | null> => {
  try {
    console.log('Saving alliance data:', allianceData);
    
    // Validate the data before sending
    if (!allianceData.eventKey || !allianceData.alliances || !Array.isArray(allianceData.alliances)) {
      console.error('Invalid alliance data format:', allianceData);
      return null;
    }
    
    const response = await retryAxios(() => axios.post(`${API_BASE_URL}/api/alliances`, allianceData));
    console.log('Alliance save response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving alliances:', error);
    return null;
  }
}; 