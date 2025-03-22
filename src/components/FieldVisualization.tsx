import React, { useState, useRef, useEffect } from 'react'
import { getAllTeams, TeamData } from '../services/teamDataService'

// Define alliance type
type Alliance = 'blue' | 'red' | null;

// Define team position on field
interface TeamPosition {
  teamNumber: string;
  alliance: Alliance;
  position: string; // Changed from 'L' | 'M' | 'R' to string to support any position
  selectedPosition?: string; // Which starting position is selected for this match
  customPosition?: { x: number, y: number }; // Custom position for draggable positioning
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
  
  // For mobile touch support
  const [touchTeam, setTouchTeam] = useState<string | null>(null);
  const [touchPosition, setTouchPosition] = useState<{ x: number, y: number } | null>(null);
  
  // Add new state for field dragging
  const [isDraggingOnField, setIsDraggingOnField] = useState(false);
  const [fieldDimensions, setFieldDimensions] = useState({ width: 0, height: 0 });
  const fieldRef = useRef<HTMLDivElement>(null);
  
  // Initialize field dimensions on mount
  useEffect(() => {
    const updateFieldDimensions = () => {
      if (fieldRef.current) {
        const { width, height } = fieldRef.current.getBoundingClientRect();
        setFieldDimensions({ width, height });
      }
    };
    
    updateFieldDimensions();
    window.addEventListener('resize', updateFieldDimensions);
    
    return () => {
      window.removeEventListener('resize', updateFieldDimensions);
    };
  }, []);
  
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
  
  // Handle touch start for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, teamNumber: string) => {
    e.preventDefault();
    setTouchTeam(teamNumber);
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
    
    // Add visual feedback
    if (e.currentTarget.classList) {
      e.currentTarget.classList.add('opacity-50');
    }
  };
  
  // Handle touch move for mobile devices
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (touchTeam) {
      const touch = e.touches[0];
      setTouchPosition({ x: touch.clientX, y: touch.clientY });
    }
  };
  
  // Handle touch end for mobile devices
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!touchTeam || !touchPosition) {
      return;
    }
    
    // Remove visual feedback
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('opacity-50');
    }
    
    // Determine which alliance to drop into based on touch position
    const blueRect = blueAllianceRef.current?.getBoundingClientRect();
    const redRect = redAllianceRef.current?.getBoundingClientRect();
    
    if (blueRect && isPositionInRect(touchPosition, blueRect)) {
      handleTeamAssignment(touchTeam, 'blue');
    } else if (redRect && isPositionInRect(touchPosition, redRect)) {
      handleTeamAssignment(touchTeam, 'red');
    }
    
    // Reset touch state
    setTouchTeam(null);
    setTouchPosition(null);
  };
  
  // Helper function to check if position is within a rectangle
  const isPositionInRect = (position: { x: number, y: number }, rect: DOMRect): boolean => {
    return (
      position.x >= rect.left &&
      position.x <= rect.right &&
      position.y >= rect.top &&
      position.y <= rect.bottom
    );
  };
  
  // Common function to handle team assignment to alliances
  const handleTeamAssignment = (teamNumber: string, alliance: Alliance) => {
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
  
  // Handle drop on alliance zone
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, alliance: Alliance) => {
    e.preventDefault();
    const teamNumber = e.dataTransfer.getData('text/plain');
    handleTeamAssignment(teamNumber, alliance);
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
        // Check if team has starting positions
        if (team.startingPosition && team.startingPosition.length > 0) {
          // Use the first position as default selected position
          const defaultPosition = team.startingPosition[0];
          newPositions.push({
            teamNumber,
            alliance: 'blue',
            position: defaultPosition,
            selectedPosition: defaultPosition
          });
        } else {
          // Fallback for legacy data
          newPositions.push({
            teamNumber,
            alliance: 'blue',
            position: 'M', // Default to middle if no position specified
          });
        }
      }
    });
    
    // Add red alliance teams to positions
    redAllianceTeams.forEach((teamNumber) => {
      const team = getTeamData(teamNumber);
      if (team) {
        // Check if team has starting positions
        if (team.startingPosition && team.startingPosition.length > 0) {
          // Use the first position as default selected position
          const defaultPosition = team.startingPosition[0];
          newPositions.push({
            teamNumber,
            alliance: 'red',
            position: defaultPosition,
            selectedPosition: defaultPosition
          });
        } else {
          // Fallback for legacy data
          newPositions.push({
            teamNumber,
            alliance: 'red',
            position: 'M', // Default to middle if no position specified
          });
        }
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
    // If a custom position exists, use it instead of the predefined positions
    if (position.customPosition) {
      return `top-[${position.customPosition.y}%] left-[${position.customPosition.x}%]`;
    }
    
    const { alliance, position: pos } = position;
    
    if (alliance === 'blue') {
      switch (pos) {
        case 'L': return 'top-[25%] left-[40%]'; // BLUE L - left side of field
        case 'M': return 'top-[50%] left-[40%]'; // BLUE M - middle area
        case 'R': return 'top-[75%] left-[40%]'; // BLUE R - right/bottom area
        default: return 'top-[50%] left-[40%]';  // Default to middle
      }
    } else if (alliance === 'red') {
      switch (pos) {
        case 'M': return 'bottom-[38%] right-[33%]'; // RED M - middle area
        case 'L': return 'bottom-[14%] right-[33%]'; // RED L - left side
        case 'R': return 'bottom-[64%] right-[33%]'; // RED R - right/bottom area
        default: return 'bottom-[38%] right-[33%]';  // Default to middle
      }
    }
    
    return '';
  };
  
  // Show floating team indicator for mobile drag
  const renderTouchDragIndicator = () => {
    if (!touchTeam || !touchPosition) return null;
    
    const team = getTeamData(touchTeam);
    if (!team) return null;
    
    return (
      <div 
        className="absolute z-50 bg-white rounded-lg shadow-lg p-2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          top: touchPosition.y,
          left: touchPosition.x,
          pointerEvents: 'none'
        }}
      >
        <div className={`px-2 py-1 rounded ${getTeamAlliance(touchTeam) === 'blue' ? 'bg-blue-600' : getTeamAlliance(touchTeam) === 'red' ? 'bg-red-600' : 'bg-gray-800'} text-white`}>
          {team.teamNumber}
        </div>
      </div>
    );
  };
  
  // Handle drag on the field itself
  const handleFieldDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOnField(true);
  };
  
  // Handle leaving the field
  const handleFieldDragLeave = () => {
    setIsDraggingOnField(false);
  };
  
  // Handle dropping a team on the field itself (for custom positioning)
  const handleFieldDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOnField(false);
    
    const teamNumber = e.dataTransfer.getData('text/plain');
    if (!teamNumber) return;
    
    // Determine team alliance
    const alliance = getTeamAlliance(teamNumber);
    if (!alliance) return; // Team must be in an alliance to be positioned on field
    
    // Calculate position as percentage of field dimensions
    const fieldRect = fieldRef.current?.getBoundingClientRect();
    if (!fieldRect) return;
    
    const x = ((e.clientX - fieldRect.left) / fieldRect.width) * 100;
    const y = ((e.clientY - fieldRect.top) / fieldRect.height) * 100;
    
    // Update team position
    setTeamPositions(prevPositions => {
      const teamIndex = prevPositions.findIndex(pos => pos.teamNumber === teamNumber);
      if (teamIndex === -1) return prevPositions;
      
      const newPositions = [...prevPositions];
      newPositions[teamIndex] = {
        ...newPositions[teamIndex],
        customPosition: { x, y }
      };
      
      return newPositions;
    });
  };
  
  // Handle starting position change
  const handleStartingPositionChange = (teamNumber: string, position: string) => {
    setTeamPositions(prevPositions => {
      const teamIndex = prevPositions.findIndex(pos => pos.teamNumber === teamNumber);
      if (teamIndex === -1) return prevPositions;
      
      const newPositions = [...prevPositions];
      newPositions[teamIndex] = {
        ...newPositions[teamIndex],
        position,
        selectedPosition: position,
        // Remove custom position when changing to a predefined position
        customPosition: undefined
      };
      
      return newPositions;
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Main container with field and alliance boxes */}
      <div className="relative max-w-4xl mx-auto">
        {/* Field container */}
        <div 
          ref={fieldRef}
          className={`field-container aspect-[2/1] w-full rounded-lg overflow-hidden shadow-xl relative ${isDraggingOnField ? 'border-4 border-yellow-400' : ''}`}
          onDragOver={handleFieldDragOver}
          onDragLeave={handleFieldDragLeave}
          onDrop={handleFieldDrop}
        >
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
            
            // Custom inline style for absolute positioning when using percentages
            const customPositionStyle = position.customPosition ? {
              position: 'absolute' as const,
              top: `${position.customPosition.y}%`,
              left: `${position.customPosition.x}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            } : {};
            
            return (
              <div 
                key={`field-${position.teamNumber}`}
                className={position.customPosition ? 'cursor-grab active:cursor-grabbing' : `absolute ${positionClass} transform -translate-y-1/2 -translate-x-1/2 z-10`}
                style={position.customPosition ? customPositionStyle : {}}
                onClick={() => handleTeamClick(position.teamNumber)}
                draggable
                onDragStart={(e) => handleDragStart(e, position.teamNumber)}
              >
                <div className={`${allianceColor} text-white px-3 py-2 rounded-md shadow-md cursor-pointer hover:opacity-90 transition flex flex-col items-center`}>
                  <div className="font-bold">{team.teamNumber}</div>
                  {/* Show current position */}
                  <div className="text-xs">{position.selectedPosition || position.position}</div>
                </div>
                
                {/* Capabilities popup when team is selected */}
                {selectedTeam === position.teamNumber && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-lg p-3 z-20 w-48">
                    <h4 className="font-bold text-sm mb-2">Team {team.teamNumber} Capabilities:</h4>
                    
                    {/* Starting position dropdown for teams with multiple options */}
                    {team.startingPosition && team.startingPosition.length > 0 ? (
                      <div className="mb-3">
                        <label className="text-xs font-semibold block mb-1">Starting Position:</label>
                        <select 
                          className="w-full text-xs p-1 border rounded"
                          value={position.selectedPosition || position.position}
                          onChange={(e) => handleStartingPositionChange(team.teamNumber, e.target.value)}
                        >
                          {team.startingPosition.map((pos) => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                        <p className="text-xs mt-1 text-gray-500 italic">
                          Drag to position anywhere on field
                        </p>
                      </div>
                    ) : null}
                    
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
      
      {/* Mobile touch indicator */}
      {renderTouchDragIndicator()}
      
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
                onTouchStart={(e) => handleTouchStart(e, team.teamNumber)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => handleTeamClick(team.teamNumber)}
              >
                <div className="font-medium">{team.teamNumber} <span className="text-xs font-bold ml-1">({team.startingPosition ? team.startingPosition.join(', ') : 'Not specified'})</span></div>
                
                {/* Capabilities popup when team is selected in selector */}
                {selectedTeam === team.teamNumber && (
                  <div className="absolute mt-2 bg-white rounded-md shadow-lg p-3 z-20 w-48">
                    <h4 className="font-bold text-sm mb-2">Team {team.teamNumber} Capabilities:</h4>
                    <p className="text-xs mb-1">
                      Position(s): <span className="font-bold">
                        {team.startingPosition && team.startingPosition.length 
                          ? team.startingPosition.join(', ')
                          : 'Not specified'}
                      </span>
                    </p>
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