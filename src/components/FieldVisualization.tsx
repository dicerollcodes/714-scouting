import React, { useState, useRef, useEffect } from 'react'
import { getAllTeams, getPositionName, TeamData } from '../services/teamDataService'

// Define alliance type
type Alliance = 'blue' | 'red' | null;

// Define team position on field
interface TeamPosition {
  teamNumber: string;
  alliance: Alliance;
  position: 'L' | 'M' | 'R';
}

const FieldVisualization = () => {
  // State to store teams from API
  const [teams, setTeams] = useState<TeamData[]>([]);
  
  // Fetch team data when component mounts
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsData = await getAllTeams();
        setTeams(teamsData || []); // Ensure we always have an array
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeams([]); // Set to empty array on error
      }
    };
    
    fetchTeams();
  }, []);
  
  // State for tracking team positions on the field
  const [teamPositions, setTeamPositions] = useState<TeamPosition[]>([]);
  
  // State for tracking which team is being dragged
  const [draggedTeam, setDraggedTeam] = useState<string | null>(null);
  
  // State for showing team capabilities
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  // State for tracking teams assigned to alliances
  const [blueAllianceTeams, setBlueAllianceTeams] = useState<string[]>([]);
  const [redAllianceTeams, setRedAllianceTeams] = useState<string[]>([]);
  
  // Refs for alliance drop zones
  const blueAllianceRef = useRef<HTMLDivElement>(null);
  const redAllianceRef = useRef<HTMLDivElement>(null);
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, teamNumber: string) => {
    setDraggedTeam(teamNumber);
    // Set data for drag operation
    e.dataTransfer.setData('text/plain', teamNumber);
    // Make the ghost image semi-transparent
    if (e.currentTarget.classList) {
      setTimeout(() => {
        e.currentTarget.classList.add('opacity-50');
      }, 0);
    }
  };
  
  // Handle drag end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('opacity-50');
    }
    setDraggedTeam(null);
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  // Handle drop on alliance zone
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, alliance: Alliance) => {
    e.preventDefault();
    const teamNumber = e.dataTransfer.getData('text/plain');
    
    if (!teamNumber || !alliance) return;
    
    // Update alliance teams
    if (alliance === 'blue') {
      // Check if team is already in blue alliance
      if (!blueAllianceTeams.includes(teamNumber)) {
        // Check if we need to remove from red alliance
        if (redAllianceTeams.includes(teamNumber)) {
          setRedAllianceTeams(redAllianceTeams.filter(t => t !== teamNumber));
        }
        
        // Add to blue alliance (max 3 teams)
        if (blueAllianceTeams.length < 3) {
          setBlueAllianceTeams([...blueAllianceTeams, teamNumber]);
        } else {
          // Replace the first team if alliance is full
          const newTeams = [...blueAllianceTeams];
          newTeams.shift();
          newTeams.push(teamNumber);
          setBlueAllianceTeams(newTeams);
        }
      }
    } else if (alliance === 'red') {
      // Check if team is already in red alliance
      if (!redAllianceTeams.includes(teamNumber)) {
        // Check if we need to remove from blue alliance
        if (blueAllianceTeams.includes(teamNumber)) {
          setBlueAllianceTeams(blueAllianceTeams.filter(t => t !== teamNumber));
        }
        
        // Add to red alliance (max 3 teams)
        if (redAllianceTeams.length < 3) {
          setRedAllianceTeams([...redAllianceTeams, teamNumber]);
        } else {
          // Replace the first team if alliance is full
          const newTeams = [...redAllianceTeams];
          newTeams.shift();
          newTeams.push(teamNumber);
          setRedAllianceTeams(newTeams);
        }
      }
    }
  };
  
  // Get team data by number
  const getTeamData = (teamNumber: string): TeamData | undefined => {
    return teams.find(team => team.teamNumber === teamNumber);
  };
  
  // Update team positions when alliance teams change
  useEffect(() => {
    const newPositions: TeamPosition[] = [];
    
    // Add blue alliance teams to positions
    blueAllianceTeams.forEach((teamNumber) => {
      const team = getTeamData(teamNumber);
      if (team) {
        newPositions.push({
          teamNumber,
          alliance: 'blue',
          position: team.startingPosition as 'L' | 'M' | 'R'
        });
      }
    });
    
    // Add red alliance teams to positions
    redAllianceTeams.forEach((teamNumber) => {
      const team = getTeamData(teamNumber);
      if (team) {
        newPositions.push({
          teamNumber,
          alliance: 'red',
          position: team.startingPosition as 'L' | 'M' | 'R'
        });
      }
    });
    
    setTeamPositions(newPositions);
  }, [blueAllianceTeams, redAllianceTeams]);
  
  // Check if team is assigned to an alliance
  const isTeamAssigned = (teamNumber: string): boolean => {
    return blueAllianceTeams.includes(teamNumber) || redAllianceTeams.includes(teamNumber);
  };
  
  // Get team alliance
  const getTeamAlliance = (teamNumber: string): Alliance => {
    if (blueAllianceTeams.includes(teamNumber)) return 'blue';
    if (redAllianceTeams.includes(teamNumber)) return 'red';
    return null;
  };
  
  // Handle click on team (either in selector or on field)
  const handleTeamClick = (teamNumber: string) => {
    setSelectedTeam(selectedTeam === teamNumber ? null : teamNumber);
  };
  
  // Calculate position for team on field (behind the barge zone)
  const calculateTeamFieldPosition = (position: TeamPosition) => {
    const { alliance, position: pos } = position;
    
    if (alliance === 'blue') {
      switch (pos) {
        case 'L': return 'top-[25%] left-[40%]'; // BLUE L - left side of field
        case 'M': return 'top-[50%] left-[40%]'; // BLUE M - middle area
        case 'R': return 'top-[75%] left-[40%]'; // BLUE R - right/bottom area
      }
    } else if (alliance === 'red') {
      switch (pos) {
        case 'M': return 'bottom-[38%] right-[33%]'; // RED M - middle area
        case 'L': return 'bottom-[14%] right-[33%]'; // RED L - left side
        case 'R': return 'bottom-[64%] right-[33%]'; // RED R - right/bottom area
      }
    }
    
    return '';
  };
  
  return (
    <div className="space-y-4">
      {/* Main container with field and alliance boxes */}
      <div className="relative max-w-4xl mx-auto">
        {/* Field container */}
        <div className="field-container aspect-[2/1] w-full rounded-lg overflow-hidden shadow-xl relative">
          {/* Field background */}
          <div className="absolute inset-0 bg-gray-900"></div>
          
          {/* Blue alliance area - reduced width from 15% to 10% */}
          <div className="absolute top-0 left-0 bottom-0 w-[10%] bg-blue-300">
            {/* Station labels */}
            <div className="absolute top-[12%] left-[5%] text-xs font-bold text-blue-800">L</div>
            <div className="absolute top-[50%] left-[5%] text-xs font-bold text-blue-800">M</div>
            <div className="absolute bottom-[12%] left-[5%] text-xs font-bold text-blue-800">R</div>
            {/* Alliance label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90 text-blue-800 font-bold">BLUE ALLIANCE</div>
          </div>
          
          {/* Red alliance area - reduced width from 15% to 10% */}
          <div className="absolute top-0 right-0 bottom-0 w-[10%] bg-red-300">
            {/* Station labels */}
            <div className="absolute top-[12%] right-[5%] text-xs font-bold text-red-800">R</div>
            <div className="absolute top-[50%] right-[5%] text-xs font-bold text-red-800">M</div>
            <div className="absolute bottom-[12%] right-[5%] text-xs font-bold text-red-800">L</div>
            {/* Alliance label */}
            <div className="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 rotate-90 text-red-800 font-bold">RED ALLIANCE</div>
          </div>
          
          {/* Blue coral station areas - adjusted for new alliance width */}
          <div className="absolute top-0 left-0 w-[10%] h-[25%] bg-blue-300">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-800 font-bold text-center text-xs">CORAL STATION AREA</div>
          </div>
          <div className="absolute bottom-0 left-0 w-[10%] h-[25%] bg-blue-300">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-800 font-bold text-center text-xs">CORAL STATION AREA</div>
          </div>
          
          {/* Red coral station areas - adjusted for new alliance width */}
          <div className="absolute top-0 right-0 w-[10%] h-[25%] bg-red-300">
            <div className="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 text-gray-800 font-bold text-center text-xs">CORAL STATION AREA</div>
          </div>
          <div className="absolute bottom-0 right-0 w-[10%] h-[25%] bg-red-300">
            <div className="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 text-gray-800 font-bold text-center text-xs">CORAL STATION AREA</div>
          </div>
          
          {/* Robot starting line */}
          <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-1 bg-gray-800"></div>
          
          {/* Processor areas */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[10%] h-[12%] bg-blue-200">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-800 text-center text-xs font-bold">PROCESSOR AREA</div>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[10%] h-[12%] bg-red-200">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-800 text-center text-xs font-bold">PROCESSOR AREA</div>
          </div>
          
          {/* Center barge zone - split into two distinct halves */}
          <div className="absolute top-[12%] bottom-[12%] left-1/2 transform -translate-x-1/2 w-[10%] overflow-hidden">
            {/* Blue top half */}
            <div className="absolute top-0 h-1/2 w-full bg-blue-200"></div>
            {/* Red bottom half */}
            <div className="absolute bottom-0 h-1/2 w-full bg-red-200"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-800 text-center font-bold whitespace-nowrap text-xs">BARGE ZONE</div>
          </div>
          
          {/* Blue alliance reef zone - properly centered */}
          <div className="absolute top-1/2 left-[26%] transform -translate-x-1/2 -translate-y-1/2">
            <div className="hexagon bg-blue-400 w-32 h-32 flex items-center justify-center relative">
              <div className="text-white text-center">
                <div className="font-bold">REEF ZONE</div>
              </div>
            </div>
          </div>
          
          {/* Red alliance reef zone - properly centered */}
          <div className="absolute top-1/2 right-[26%] transform translate-x-1/2 -translate-y-1/2">
            <div className="hexagon bg-red-400 w-32 h-32 flex items-center justify-center relative">
              <div className="text-white text-center">
                <div className="font-bold">REEF ZONE</div>
              </div>
            </div>
          </div>
          
          {/* Blue cage indicators - positioned in the middle of the blue side of the barge zone */}
          <div className="absolute top-[18%] left-[49%] w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="absolute top-[28%] left-[49%] w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="absolute top-[38%] left-[49%] w-3 h-3 rounded-full bg-blue-500"></div>
          
          {/* Red cage indicators - positioned in the middle of the red side of the barge zone */}
          <div className="absolute bottom-[18%] left-[49%] w-3 h-3 rounded-full bg-red-500"></div>
          <div className="absolute bottom-[28%] left-[49%] w-3 h-3 rounded-full bg-red-500"></div>
          <div className="absolute bottom-[38%] left-[49%] w-3 h-3 rounded-full bg-red-500"></div>
          
          {/* Teams positioned on the field (clones) */}
          {teamPositions.map((position) => {
            const team = getTeamData(position.teamNumber);
            if (!team) return null;
            
            const positionClass = calculateTeamFieldPosition(position);
            const allianceColor = position.alliance === 'blue' ? 'bg-blue-600' : 'bg-red-600';
            
            return (
              <div 
                key={`field-${position.teamNumber}`}
                className={`absolute ${positionClass} transform -translate-y-1/2 -translate-x-1/2 z-10`}
                onClick={() => handleTeamClick(position.teamNumber)}
              >
                <div className={`${allianceColor} text-white px-3 py-2 rounded-md shadow-md cursor-pointer hover:opacity-90 transition`}>
                  <div className="font-bold">{team.teamNumber}</div>
                </div>
                
                {/* Capabilities popup when team is selected */}
                {selectedTeam === position.teamNumber && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-lg p-3 z-20 w-48">
                    <h4 className="font-bold text-sm mb-2">Team {team.teamNumber} Capabilities:</h4>
                    <ul className="text-xs space-y-1">
                      <li className="flex items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${team.capabilities?.autoScoring ? 'bg-green-500' : 'bg-red-500'}`}>
                          {team.capabilities?.autoScoring ? '✓' : '✗'}
                        </span>
                        Auto Scoring
                      </li>
                      <li className="flex items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${team.capabilities?.highScoring ? 'bg-green-500' : 'bg-red-500'}`}>
                          {team.capabilities?.highScoring ? '✓' : '✗'}
                        </span>
                        High Scoring (L3/L4)
                      </li>
                      <li className="flex items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${team.capabilities?.algaeHandling ? 'bg-green-500' : 'bg-red-500'}`}>
                          {team.capabilities?.algaeHandling ? '✓' : '✗'}
                        </span>
                        Handles Algae
                      </li>
                      <li className="flex items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${team.capabilities?.climbing ? 'bg-green-500' : 'bg-red-500'}`}>
                          {team.capabilities?.climbing ? '✓' : '✗'}
                        </span>
                        Can Climb
                      </li>
                      <li className="flex items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${team.capabilities?.fastDriving ? 'bg-green-500' : 'bg-red-500'}`}>
                          {team.capabilities?.fastDriving ? '✓' : '✗'}
                        </span>
                        Fast Driving
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Alliance boxes outside the field */}
        <div className="flex justify-between mt-4">
          {/* Blue alliance box */}
          <div 
            ref={blueAllianceRef}
            className="w-[30%] bg-blue-600 rounded-lg p-3 shadow-md alliance-zone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'blue')}
          >
            <div className="text-white font-bold text-center mb-2">BLUE ALLIANCE</div>
            <div className="flex flex-col gap-2">
              {blueAllianceTeams.map((teamNumber, index) => {
                const team = getTeamData(teamNumber);
                if (!team) return null;
                
                return (
                  <div 
                    key={`blue-${teamNumber}`}
                    className="bg-blue-700 text-white px-3 py-2 rounded-md shadow-md cursor-pointer hover:bg-blue-800 transition"
                    onClick={() => handleTeamClick(teamNumber)}
                  >
                    <div className="font-bold">{team.teamNumber}</div>
                  </div>
                );
              })}
              {blueAllianceTeams.length < 3 && (
                <div className="border-2 border-dashed border-white rounded-md p-2 text-white text-center text-sm">
                  Drop Team Here
                </div>
              )}
            </div>
          </div>
          
          {/* Red alliance box */}
          <div 
            ref={redAllianceRef}
            className="w-[30%] bg-red-600 rounded-lg p-3 shadow-md alliance-zone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'red')}
          >
            <div className="text-white font-bold text-center mb-2">RED ALLIANCE</div>
            <div className="flex flex-col gap-2">
              {redAllianceTeams.map((teamNumber, index) => {
                const team = getTeamData(teamNumber);
                if (!team) return null;
                
                return (
                  <div 
                    key={`red-${teamNumber}`}
                    className="bg-red-700 text-white px-3 py-2 rounded-md shadow-md cursor-pointer hover:bg-red-800 transition"
                    onClick={() => handleTeamClick(teamNumber)}
                  >
                    <div className="font-bold">{team.teamNumber}</div>
                  </div>
                );
              })}
              {redAllianceTeams.length < 3 && (
                <div className="border-2 border-dashed border-white rounded-md p-2 text-white text-center text-sm">
                  Drop Team Here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Team selector */}
      <div className="bg-white p-4 rounded-lg shadow-md max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-2">Team Selector</h3>
        <div className="flex flex-wrap gap-2">
          {teams.map(team => {
            const alliance = getTeamAlliance(team.teamNumber);
            const isAssigned = !!alliance;
            
            return (
              <div
                key={team.teamNumber}
                className={`px-4 py-2 rounded-md border cursor-pointer ${
                  isAssigned 
                    ? alliance === 'blue' 
                      ? 'bg-blue-100 border-blue-500' 
                      : 'bg-red-100 border-red-500'
                    : 'bg-white hover:bg-gray-100'
                } ${selectedTeam === team.teamNumber ? 'ring-2 ring-blue-500' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, team.teamNumber)}
                onDragEnd={handleDragEnd}
                onClick={() => handleTeamClick(team.teamNumber)}
              >
                <div className="font-medium">{team.teamNumber} <span className="text-xs font-bold ml-1">({getPositionName(team.startingPosition)})</span></div>
                
                {/* Capabilities popup when team is selected in selector */}
                {selectedTeam === team.teamNumber && (
                  <div className="absolute mt-2 bg-white rounded-md shadow-lg p-3 z-20 w-48">
                    <h4 className="font-bold text-sm mb-2">Team {team.teamNumber} Capabilities:</h4>
                    <p className="text-xs mb-1">Start Position: <span className="font-bold">{getPositionName(team.startingPosition)}</span></p>
                    <ul className="text-xs space-y-1">
                      <li className="flex items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${team.capabilities?.autoScoring ? 'bg-green-500' : 'bg-red-500'}`}>
                          {team.capabilities?.autoScoring ? '✓' : '✗'}
                        </span>
                        Auto Scoring
                      </li>
                      <li className="flex items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${team.capabilities?.highScoring ? 'bg-green-500' : 'bg-red-500'}`}>
                          {team.capabilities?.highScoring ? '✓' : '✗'}
                        </span>
                        High Scoring (L3/L4)
                      </li>
                      <li className="flex items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${team.capabilities?.algaeHandling ? 'bg-green-500' : 'bg-red-500'}`}>
                          {team.capabilities?.algaeHandling ? '✓' : '✗'}
                        </span>
                        Handles Algae
                      </li>
                      <li className="flex items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${team.capabilities?.climbing ? 'bg-green-500' : 'bg-red-500'}`}>
                          {team.capabilities?.climbing ? '✓' : '✗'}
                        </span>
                        Can Climb
                      </li>
                      <li className="flex items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${team.capabilities?.fastDriving ? 'bg-green-500' : 'bg-red-500'}`}>
                          {team.capabilities?.fastDriving ? '✓' : '✗'}
                        </span>
                        Fast Driving
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FieldVisualization;