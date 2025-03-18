import React, { useState, useEffect } from 'react';

interface TBATeam {
  key: string;
  team_number: number;
  nickname: string;
}

interface TBARanking {
  rank: number;
  team_key: string;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  qual_average: number;
  matches_played: number;
  sort_orders: number[];
  extra_stats: number[];
}

interface TBARankings {
  rankings: TBARanking[];
  sort_order_info: {
    name: string;
    precision: number;
  }[];
  extra_stats_info: {
    name: string;
    precision: number;
  }[];
}

interface TeamRankingData {
  rank: number;
  teamNumber: number;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  avgScore: number;
  avgAuto: number;
  opr: number;
  selected: boolean;
}

interface AllianceData {
  captain: TeamRankingData | null;
  firstPick: TeamRankingData | null;
  secondPick: TeamRankingData | null;
}

// Main component
const AllianceSelection = () => {
  // State for input URL
  const [eventUrl, setEventUrl] = useState<string>('');
  const [eventKey, setEventKey] = useState<string>('');
  
  // State for API data
  const [teams, setTeams] = useState<TBATeam[]>([]);
  const [rankings, setRankings] = useState<TBARankings | null>(null);
  const [oprs, setOprs] = useState<Record<string, number>>({});
  
  // Processed data for display
  const [teamRankings, setTeamRankings] = useState<TeamRankingData[]>([]);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [alliances, setAlliances] = useState<AllianceData[]>(
    Array(8).fill(null).map(() => ({ captain: null, firstPick: null, secondPick: null }))
  );
  const [finalized, setFinalized] = useState<boolean>(false);
  const [draggingTeam, setDraggingTeam] = useState<TeamRankingData | null>(null);
  
  // Add new state for saving status
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // TBA API key - in production, this should come from environment variables
  const TBA_API_KEY = 'l9ja5N4kFmNU8mh0nuaSJdu6JQgBRoLZkmuXIowHf7bnpXf7HC2HMIT9ab7YfLuY';

  // Extract event key from URL
  const handleEventUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventUrl(e.target.value);
  };

  const extractEventKey = (url: string): string => {
    try {
      // Parse the URL to extract the event key (last part of the path)
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/');
      // Event key is the last part of the path after /event/
      const eventKeyIndex = pathParts.findIndex(part => part === 'event');
      if (eventKeyIndex !== -1 && eventKeyIndex < pathParts.length - 1) {
        return pathParts[eventKeyIndex + 1];
      }
      throw new Error("Event key not found in URL");
    } catch (error) {
      // If URL parsing fails, check if the input is just an event key
      if (/^\d{4}[a-z0-9]+$/.test(url)) {
        return url; // It looks like an event key already (e.g., 2023txcha)
      }
      throw new Error("Invalid URL or event key format");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Reset data when submitting a new event
      setTeams([]);
      setRankings(null);
      setOprs({});
      setTeamRankings([]);
      setAlliances(Array(8).fill(null).map(() => ({ captain: null, firstPick: null, secondPick: null })));
      setFinalized(false);
      
      // Extract the event key from URL
      const newEventKey = extractEventKey(eventUrl);
      setEventKey(newEventKey);
      
      // Fetch data for the event
      setLoading(true);
      await fetchEventData(newEventKey);
    } catch (error) {
      console.error('Error processing event URL:', error);
      setError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data needed from TBA API
  const fetchEventData = async (key: string) => {
    try {
      // Make parallel requests for teams, rankings, and OPRs
      const [teamsResponse, rankingsResponse, oprsResponse] = await Promise.all([
        fetchTeams(key),
        fetchRankings(key),
        fetchOPRs(key)
      ]);
      
      // Process and combine the data
      setTeams(teamsResponse);
      setRankings(rankingsResponse);
      setOprs(oprsResponse.oprs || {});
      
      // Process the combined data into a format for our table
      processTeamData(teamsResponse, rankingsResponse, oprsResponse.oprs || {});
      
      // After we have team data, check if we have saved alliances
      loadSavedAlliances(key);
    } catch (error) {
      console.error('Error fetching event data:', error);
      setError(`Failed to fetch event data: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Fetch teams for an event
  const fetchTeams = async (key: string): Promise<TBATeam[]> => {
    try {
      const response = await fetch(`https://www.thebluealliance.com/api/v3/event/${key}/teams`, {
        headers: {
          'X-TBA-Auth-Key': TBA_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Could not fetch teams: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  };

  // Fetch rankings for an event
  const fetchRankings = async (key: string): Promise<TBARankings> => {
    try {
      const response = await fetch(`https://www.thebluealliance.com/api/v3/event/${key}/rankings`, {
        headers: {
          'X-TBA-Auth-Key': TBA_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Could not fetch rankings: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Rankings data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching rankings:', error);
      throw error;
    }
  };

  // Fetch OPRs for an event
  const fetchOPRs = async (key: string): Promise<any> => {
    try {
      const response = await fetch(`https://www.thebluealliance.com/api/v3/event/${key}/oprs`, {
        headers: {
          'X-TBA-Auth-Key': TBA_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Could not fetch OPRs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('OPR data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching OPRs:', error);
      throw error;
    }
  };

  // Process the API data into a format for our table
  const processTeamData = (
    teams: TBATeam[], 
    rankingsData: TBARankings | null, 
    oprs: Record<string, number>
  ) => {
    if (!rankingsData) return;
    
    console.log('Processing team data:');
    console.log('- Teams:', teams);
    console.log('- Rankings:', rankingsData);
    console.log('- OPRs:', oprs);
    
    // Find the indices for average score and auto score in the sort_orders
    let avgScoreIndex = -1;
    let avgAutoIndex = -1;
    
    // Check sort_order_info to find the right indices
    if (rankingsData.sort_order_info) {
      console.log('Sort order info:', rankingsData.sort_order_info);
      
      rankingsData.sort_order_info.forEach((info, index) => {
        console.log(`Checking sort order: ${info.name} at index ${index}`);
        if (info.name.toLowerCase().includes('match') || info.name.toLowerCase().includes('score')) {
          console.log(`Found avg score index: ${index}`);
          avgScoreIndex = index;
        }
        if (info.name.toLowerCase().includes('auto')) {
          console.log(`Found avg auto index: ${index}`);
          avgAutoIndex = index;
        }
      });
    }
    
    // Check extra_stats_info if we didn't find avgAutoIndex in sort_orders
    if (avgAutoIndex === -1 && rankingsData.extra_stats_info) {
      console.log('Extra stats info:', rankingsData.extra_stats_info);
      
      rankingsData.extra_stats_info.forEach((info, index) => {
        if (info.name.toLowerCase().includes('auto')) {
          console.log(`Found avg auto in extra_stats at index: ${index}`);
          avgAutoIndex = -100 - index; // Use negative to indicate it's in extra_stats
        }
      });
    }
    
    // If we can't identify the right indices, use some defaults
    if (avgScoreIndex === -1) {
      console.log('Using default sort order index 2 for avg score');
      avgScoreIndex = 2; // Common index for match score
    }
    
    if (avgAutoIndex === -1) {
      console.log('Using default sort order index 1 for avg auto');
      avgAutoIndex = 1; // Common index for auto score
    }
    
    // Map rankings to our format
    const processed = rankingsData.rankings.map(ranking => {
      const teamNumber = parseInt(ranking.team_key.replace('frc', ''), 10);
      const team = teams.find(t => t.team_number === teamNumber);
      
      // Get avgAuto correctly based on where we found it
      let avgAuto = 0;
      if (avgAutoIndex >= 0 && ranking.sort_orders) {
        avgAuto = ranking.sort_orders[avgAutoIndex];
      } else if (avgAutoIndex < -100 && ranking.extra_stats) {
        // It's in extra_stats
        avgAuto = ranking.extra_stats[-(avgAutoIndex + 100)];
      }
      
      return {
        rank: ranking.rank,
        teamNumber,
        teamName: team?.nickname || `Team ${teamNumber}`,
        wins: ranking.record?.wins || 0,
        losses: ranking.record?.losses || 0,
        ties: ranking.record?.ties || 0,
        avgScore: avgScoreIndex >= 0 && ranking.sort_orders ? 
          ranking.sort_orders[avgScoreIndex] : 0,
        avgAuto,
        opr: oprs[ranking.team_key] || 0,
        selected: false
      };
    });
    
    // Debug log a sample of processed data
    if (processed.length > 0) {
      console.log('Sample processed team data:', processed[0]);
    }
    
    // Sort by rank
    processed.sort((a, b) => a.rank - b.rank);
    setTeamRankings(processed);
  };

  // Handle team drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, team: TeamRankingData) => {
    e.dataTransfer.setData('teamNumber', team.teamNumber.toString());
    setDraggingTeam(team);
  };

  // Handle team drag end
  const handleDragEnd = () => {
    setDraggingTeam(null);
  };

  // Check if a team is selected (in any alliance)
  const isTeamSelected = (teamNumber: number): boolean => {
    return alliances.some(alliance => 
      (alliance.captain?.teamNumber === teamNumber) ||
      (alliance.firstPick?.teamNumber === teamNumber) ||
      (alliance.secondPick?.teamNumber === teamNumber)
    );
  };

  // Handle drop on alliance position
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, allianceIndex: number, position: 'captain' | 'firstPick' | 'secondPick') => {
    e.preventDefault();
    if (finalized) return;
    
    const teamNumber = parseInt(e.dataTransfer.getData('teamNumber'), 10);
    const team = teamRankings.find(t => t.teamNumber === teamNumber);
    
    if (!team) return;
    
    // Check if team is already selected in another position
    if (isTeamSelected(teamNumber)) {
      // First, remove the team from its current position
      const newAlliances = [...alliances];
      
      newAlliances.forEach((alliance, idx) => {
        if (alliance.captain?.teamNumber === teamNumber) {
          newAlliances[idx] = { ...alliance, captain: null };
        }
        if (alliance.firstPick?.teamNumber === teamNumber) {
          newAlliances[idx] = { ...alliance, firstPick: null };
        }
        if (alliance.secondPick?.teamNumber === teamNumber) {
          newAlliances[idx] = { ...alliance, secondPick: null };
        }
      });
      
      // Then place it in the new position
      newAlliances[allianceIndex] = {
        ...newAlliances[allianceIndex],
        [position]: team
      };
      
      setAlliances(newAlliances);
    } else {
      // Simply place the team in the new position
      const newAlliances = [...alliances];
      newAlliances[allianceIndex] = {
        ...newAlliances[allianceIndex],
        [position]: team
      };
      
      setAlliances(newAlliances);
    }
    
    // Update team as selected
    const updatedRankings = teamRankings.map(t => 
      t.teamNumber === teamNumber ? { ...t, selected: true } : t
    );
    setTeamRankings(updatedRankings);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Remove team from alliance position
  const handleRemoveTeam = (allianceIndex: number, position: 'captain' | 'firstPick' | 'secondPick') => {
    if (finalized) return;
    
    const teamToRemove = alliances[allianceIndex][position];
    if (!teamToRemove) return;
    
    // Update alliances
    const newAlliances = [...alliances];
    newAlliances[allianceIndex] = {
      ...newAlliances[allianceIndex],
      [position]: null
    };
    
    setAlliances(newAlliances);
    
    // Update team as not selected
    const updatedRankings = teamRankings.map(t => 
      t.teamNumber === teamToRemove.teamNumber ? { ...t, selected: false } : t
    );
    setTeamRankings(updatedRankings);
  };

  // Finalize alliance selection
  const handleFinalize = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('Saving...');
      
      // Format data for saving
      const alliancesForSave = alliances.map((alliance, index) => ({
        allianceNumber: index + 1,
        captain: alliance.captain?.teamNumber || null,
        firstPick: alliance.firstPick?.teamNumber || null,
        secondPick: alliance.secondPick?.teamNumber || null
      }));
      
      // Add detailed debugging
      console.log('Current event key:', eventKey);
      console.log('Formatted alliances for save:', alliancesForSave);
      
      const payload = {
        eventKey,
        alliances: alliancesForSave
      };
      
      console.log('Sending payload to server:', payload);
      
      // Try to hit the test endpoint first to verify server connectivity
      try {
        const testResponse = await fetch('/api/test', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('Test endpoint response:', testData);
        } else {
          console.error('Test endpoint failed:', testResponse.status);
          console.error('Test endpoint status text:', testResponse.statusText);
          const errorText = await testResponse.text();
          console.error('Test endpoint error text:', errorText);
        }
      } catch (testError) {
        console.error('Error reaching test endpoint:', testError);
      }
      
      // Try direct URL instead of relative URL
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : '';
      
      const response = await fetch(`${baseUrl}/api/alliances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Server response:', data);
      
      setFinalized(true);
      setSaveStatus('Selections saved successfully!');
    } catch (error) {
      console.error('Error finalizing alliances:', error);
      setSaveStatus(`Error saving to database: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Function to load saved alliances for an event
  const loadSavedAlliances = async (key: string) => {
    try {
      const response = await fetch(`/api/alliances/${key}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No saved alliances for this event yet, which is fine
          return;
        }
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // If we have saved alliances, load them
      if (data && data.alliances && data.alliances.length > 0) {
        // Set finalized state
        setFinalized(true);
        
        // Create a mapping of team numbers to TeamRankingData objects
        const teamMap = teamRankings.reduce((map, team) => {
          map[team.teamNumber] = team;
          return map;
        }, {} as Record<number, TeamRankingData>);
        
        // Create alliance data from saved data
        const loadedAlliances = data.alliances.map((savedAlliance: any) => ({
          captain: savedAlliance.captain ? { ...teamMap[savedAlliance.captain], selected: true } : null,
          firstPick: savedAlliance.firstPick ? { ...teamMap[savedAlliance.firstPick], selected: true } : null,
          secondPick: savedAlliance.secondPick ? { ...teamMap[savedAlliance.secondPick], selected: true } : null
        }));
        
        setAlliances(loadedAlliances);
        
        // Update selected status in teamRankings
        const updatedRankings = teamRankings.map(team => {
          const isSelected = data.alliances.some(
            (alliance: any) => 
              alliance.captain === team.teamNumber || 
              alliance.firstPick === team.teamNumber || 
              alliance.secondPick === team.teamNumber
          );
          return { ...team, selected: isSelected };
        });
        
        setTeamRankings(updatedRankings);
        setSaveStatus('Loaded previously saved alliance selections');
      }
    } catch (error) {
      console.error('Error loading saved alliances:', error);
      // Don't show an error to the user, just continue with empty alliances
    }
  };

  // Debug section - useful for development
  useEffect(() => {
    // Pre-populate with a sample event for easy testing
    if (process.env.NODE_ENV === 'development' && !eventUrl && !eventKey) {
      // Can uncomment this for easier testing
      // setEventUrl('2023txcha');
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Alliance Selection</h1>
        
        {/* Event Input Form */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div>
              <label htmlFor="eventUrl" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Enter The Blue Alliance Event URL:
              </label>
              <input
                type="text"
                id="eventUrl"
                value={eventUrl}
                onChange={handleEventUrlChange}
                placeholder="e.g., https://www.thebluealliance.com/event/2023txcha"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-left">
                Example: https://www.thebluealliance.com/event/2023txcha or just enter the event code: 2023txcha
              </p>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-2 rounded-md ${
                  loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium`}
              >
                {loading ? 'Loading...' : 'Fetch Event Data'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded max-w-3xl mx-auto">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <p className="text-sm mt-2">
              Try a known working event code: 2023txcha, 2023mokc1, or 2023casj
            </p>
          </div>
        )}
        
        {/* Event Information */}
        {eventKey && !error && (
          <div className="mt-4 text-xl text-gray-600">
            Event: {eventKey}
            {teamRankings.length > 0 && ` (${teamRankings.length} teams)`}
          </div>
        )}
      </div>

      {/* Alliance Selection Area */}
      {teamRankings.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Alliances</h2>
            <div>
              {saveStatus && (
                <span className={`mr-4 ${saveStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                  {saveStatus}
                </span>
              )}
              <button
                onClick={handleFinalize}
                disabled={finalized}
                className={`px-4 py-2 rounded-md ${
                  finalized 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {finalized ? 'Finalized' : 'Finalize Selections'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {alliances.map((alliance, index) => (
              <div key={index} className="border rounded-md p-4">
                <h3 className="text-lg font-bold mb-3">Alliance {index + 1}</h3>
                
                {/* Captain */}
                <div 
                  className={`mb-2 h-14 border-2 rounded-md flex items-center justify-between p-2 ${
                    alliance.captain ? 'bg-alliance-blue text-white' : 'border-dashed'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index, 'captain')}
                >
                  {alliance.captain ? (
                    <>
                      <div>
                        <span className="font-bold">{alliance.captain.teamNumber}</span>
                        <span className="text-xs ml-2">{alliance.captain.teamName}</span>
                      </div>
                      {!finalized && (
                        <button 
                          onClick={() => handleRemoveTeam(index, 'captain')}
                          className="text-white hover:text-red-300"
                        >
                          ✕
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500 mx-auto">Captain</span>
                  )}
                </div>
                
                {/* First Pick */}
                <div 
                  className={`mb-2 h-14 border-2 rounded-md flex items-center justify-between p-2 ${
                    alliance.firstPick ? 'bg-alliance-blue text-white' : 'border-dashed'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index, 'firstPick')}
                >
                  {alliance.firstPick ? (
                    <>
                      <div>
                        <span className="font-bold">{alliance.firstPick.teamNumber}</span>
                        <span className="text-xs ml-2">{alliance.firstPick.teamName}</span>
                      </div>
                      {!finalized && (
                        <button 
                          onClick={() => handleRemoveTeam(index, 'firstPick')}
                          className="text-white hover:text-red-300"
                        >
                          ✕
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500 mx-auto">1st Pick</span>
                  )}
                </div>
                
                {/* Second Pick */}
                <div 
                  className={`h-14 border-2 rounded-md flex items-center justify-between p-2 ${
                    alliance.secondPick ? 'bg-alliance-blue text-white' : 'border-dashed'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index, 'secondPick')}
                >
                  {alliance.secondPick ? (
                    <>
                      <div>
                        <span className="font-bold">{alliance.secondPick.teamNumber}</span>
                        <span className="text-xs ml-2">{alliance.secondPick.teamName}</span>
                      </div>
                      {!finalized && (
                        <button 
                          onClick={() => handleRemoveTeam(index, 'secondPick')}
                          className="text-white hover:text-red-300"
                        >
                          ✕
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500 mx-auto">2nd Pick</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Rankings Table */}
      {teamRankings.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Rankings</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W-L-T</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Auto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OPR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamRankings.map((team) => (
                <tr 
                  key={team.teamNumber}
                  className={team.selected ? 'bg-gray-100' : 'hover:bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {team.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{team.teamNumber}</div>
                      <div className="text-sm text-gray-500 ml-2">{team.teamName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {team.wins}-{team.losses}-{team.ties}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {team.avgScore.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {team.avgAuto.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {team.opr.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {team.selected ? (
                      <span className="text-gray-400">Selected</span>
                    ) : (
                      <div
                        className="bg-team-blue text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-700"
                        draggable
                        onDragStart={(e) => handleDragStart(e, team)}
                        onDragEnd={handleDragEnd}
                      >
                        Drag
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* OPR Explanation */}
      {teamRankings.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">What is OPR?</h2>
          <p className="text-gray-700 mb-4">
            OPR (Offensive Power Rating) is a statistical measure used to estimate a team's scoring contribution to their alliance. 
            It's calculated using linear algebra to determine each team's likely contribution to match scores.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Key metrics explained:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>OPR:</strong> Estimated points contributed per match</li>
              <li><strong>Avg Auto:</strong> Average autonomous points contributed</li>
              <li><strong>Avg Score:</strong> Average qualification match score for their alliances</li>
              <li><strong>W-L-T:</strong> Win-Loss-Tie record in qualification matches</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllianceSelection; 