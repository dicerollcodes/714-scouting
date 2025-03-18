// The Blue Alliance API Service
import { TeamData } from './teamDataService';

const TBA_API_URL = 'https://www.thebluealliance.com/api/v3';
const TBA_API_KEY = 'l9ja5N4kFmNU8mh0nuaSJdu6JQgBRoLZkmuXIowHf7bnpXf7HC2HMIT9ab7YfLuY';

// Interface for team data from TBA
export interface TBATeam {
  key: string;
  team_number: number;
  nickname: string;
  name: string;
  city: string;
  state_prov: string;
  country: string;
}

// Interface for team event stats
export interface TeamEventStats {
  teamNumber: number;
  teamName: string;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  avgScore: number;
  avgAuto: number;
  opr: number;
}

// Interface for event ranking data
export interface EventRanking {
  rank: number;
  team_key: string;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  qual_average: number;
  matches_played: number;
  extra_stats: number[];
  sort_orders: number[];
}

// Interface to store alliance selection data
export interface AllianceSelectionData {
  captain: string | null;
  pick1: string | null;
  pick2: string | null;
}

/**
 * Fetch teams from an event
 */
export const fetchEventTeams = async (eventKey: string): Promise<TBATeam[]> => {
  try {
    const response = await fetch(`${TBA_API_URL}/event/${eventKey}/teams`, {
      headers: {
        'X-TBA-Auth-Key': TBA_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching teams: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching event teams:', error);
    return [];
  }
};

/**
 * Fetch event rankings
 */
export const fetchEventRankings = async (eventKey: string): Promise<EventRanking[]> => {
  try {
    const response = await fetch(`${TBA_API_URL}/event/${eventKey}/rankings`, {
      headers: {
        'X-TBA-Auth-Key': TBA_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching rankings: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.rankings || [];
  } catch (error) {
    console.error('Error fetching event rankings:', error);
    return [];
  }
};

/**
 * Fetch event OPRs
 */
export const fetchEventOPRs = async (eventKey: string): Promise<Record<string, { opr: number; auto: number }>> => {
  try {
    const response = await fetch(`${TBA_API_URL}/event/${eventKey}/oprs`, {
      headers: {
        'X-TBA-Auth-Key': TBA_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching OPRs: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process the data to include both OPR and auto OPR
    const result: Record<string, { opr: number; auto: number }> = {};
    
    if (data.oprs) {
      Object.keys(data.oprs).forEach(key => {
        result[key] = { 
          opr: data.oprs[key] || 0,
          auto: data.auto_oprs?.[key] || 0
        };
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching event OPRs:', error);
    return {};
  }
};

/**
 * Get comprehensive team stats for alliance selection
 */
export const getEventTeamStats = async (eventKey: string): Promise<TeamEventStats[]> => {
  try {
    const [teams, rankings, oprs] = await Promise.all([
      fetchEventTeams(eventKey),
      fetchEventRankings(eventKey),
      fetchEventOPRs(eventKey)
    ]);
    
    const teamStats: TeamEventStats[] = [];
    
    // Process and merge the data
    for (const ranking of rankings) {
      const teamKey = ranking.team_key;
      const teamNumber = parseInt(teamKey.substring(3), 10); // Remove "frc" prefix
      const team = teams.find(t => t.team_number === teamNumber);
      
      if (team) {
        const oprData = oprs[teamKey] || { opr: 0, auto: 0 };
        
        teamStats.push({
          teamNumber,
          teamName: team.nickname || `Team ${teamNumber}`,
          rank: ranking.rank,
          wins: ranking.record?.wins || 0,
          losses: ranking.record?.losses || 0,
          ties: ranking.record?.ties || 0,
          avgScore: ranking.qual_average || 0,
          avgAuto: oprData.auto || 0,
          opr: oprData.opr || 0
        });
      }
    }
    
    // Sort by rank
    return teamStats.sort((a, b) => a.rank - b.rank);
  } catch (error) {
    console.error('Error getting event team stats:', error);
    return [];
  }
};

// Convert from TBA team data to our app's TeamData format
export const convertToTeamData = (tbaTeams: TBATeam[], stats: TeamEventStats[]): TeamData[] => {
  return tbaTeams.map(tbaTeam => {
    const teamStat = stats.find(stat => stat.teamNumber === tbaTeam.team_number);
    
    // Determine capabilities based on stats
    const autoScoring = teamStat?.avgAuto ? teamStat.avgAuto > 10 : false;
    const fastDriving = teamStat?.opr ? teamStat.opr > 50 : false;
    
    return {
      teamNumber: tbaTeam.team_number.toString(),
      name: tbaTeam.nickname,
      startingPosition: 'M', // Default value
      leavesStartingLine: 'yes',
      coralScoredAutoL1: '0',
      coralScoredAutoReef: '0',
      algaeScoredAutoReef: '0',
      primaryAutoActivity: 'retrievesAndScores',
      coralScoringLocation: ['troughL1'],
      algaeHandling: 'collectsFromReef',
      defensePlayed: 'never',
      drivingSpeed: 'moderate',
      endgameAction: 'parksInBargeZone',
      capabilities: {
        autoScoring,
        highScoring: false,
        algaeHandling: false,
        climbing: false,
        fastDriving
      }
    };
  });
}; 