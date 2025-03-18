import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

// Mock data for skibidi 
const mockTeams = [
  {
    teamNumber: '1812',
    startingPosition: 'leftCoralStation',
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
  },
  {
    teamNumber: '254',
    startingPosition: 'rightCoralStation',
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
  },
  {
    teamNumber: '118',
    startingPosition: 'middle',
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
  },
  {
    teamNumber: '714',
    startingPosition: 'leftCoralStation',
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
  },
]

// Helper function to format field values for display
const formatFieldValue = (key: string, value: string | string[]) => {
  switch (key) {
    case 'startingPosition':
      const positionMap: Record<string, string> = {
        'leftCoralStation': 'Left of Barge Zone',
        'middle': 'Middle (Middle of Barge Zone)',
        'rightCoralStation': 'Right of Barge Zone',
        'doesNotMove': 'Does Not Move',
      }
      return positionMap[value as string] || value
      
    case 'leavesStartingLine':
      return value === 'yes' ? 'Yes' : 'No'
      
    case 'primaryAutoActivity':
      const activityMap: Record<string, string> = {
        'onlyScoresPreloaded': 'Only Scores Preloaded Coral',
        'retrievesAndScores': 'Retrieves and Scores Additional Coral',
        'algaeRemoval': 'Algae Removal/Scoring',
      }
      return activityMap[value as string] || value
      
    case 'coralScoringLocation':
      const locationMap: Record<string, string> = {
        'troughL1': 'Trough (L1)',
        'L2Branches': 'L2 Branches',
        'L3Branches': 'L3 Branches',
        'L4Branches': 'L4 Branches',
        'notObserved': 'Not Observed',
      }
      return (value as string[]).map(loc => locationMap[loc] || loc).join(', ')
      
    case 'algaeHandling':
      const algaeMap: Record<string, string> = {
        'doesNotHandle': 'Does Not Handle Algae',
        'collectsFromReef': 'Collects from Reef',
        'collectsFromFloor': 'Collects from Floor',
        'scoresInProcessor': 'Scores in Processor',
        'scoresInOwnNet': 'Scores in own Net',
        'bothBandC': 'Both Collects from Reef and Floor',
      }
      return algaeMap[value as string] || value
      
    case 'defensePlayed':
      const defenseMap: Record<string, string> = {
        'never': 'Never',
        'occasionally': 'Occasionally',
        'frequently': 'Frequently',
        'primarilyDefensive': 'Primarily a Defensive Bot',
      }
      return defenseMap[value as string] || value
      
    case 'drivingSpeed':
      const speedMap: Record<string, string> = {
        'veryFast': 'Very Fast',
        'fast': 'Fast',
        'moderate': 'Moderate',
        'slow': 'Slow',
      }
      return speedMap[value as string] || value
      
    case 'endgameAction':
      const endgameMap: Record<string, string> = {
        'noAction': 'No Action',
        'parksInBargeZone': 'Parks in Barge Zone',
        'climbsCageShallow': 'Climbs Cage (Shallow)',
        'climbsCageDeep': 'Climbs Cage (Deep)',
      }
      return endgameMap[value as string] || value
      
    default:
      return value
  }
}

const TeamDetails = () => {
  const { teamNumber } = useParams<{ teamNumber: string }>()
  const [teamData, setTeamData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // This will be replaced with Firebase data fetching
    const fetchTeamData = () => {
      setLoading(true)
      
      // Simulate API call
      setTimeout(() => {
        const team = mockTeams.find(t => t.teamNumber === teamNumber)
        setTeamData(team || null)
        setLoading(false)
      }, 500)
    }
    
    fetchTeamData()
  }, [teamNumber])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (!teamData) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Team Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find data for team {teamNumber}.</p>
        <Link 
          to="/teams" 
          className="text-blue-600 hover:underline"
        >
          ← Back to Team List
        </Link>
      </div>
    )
  }
  
  // Group data for display
  const sections = [
    {
      title: 'Autonomous',
      fields: [
        { key: 'startingPosition', label: 'Starting Position' },
        { key: 'leavesStartingLine', label: 'Leaves Starting Line' },
        { key: 'coralScoredAutoL1', label: 'Coral Scored in AUTO (Trough - L1)' },
        { key: 'coralScoredAutoReef', label: 'Coral Scored on REEF in AUTO' },
        { key: 'algaeScoredAutoReef', label: 'Algae Scored on REEF in AUTO' },
        { key: 'primaryAutoActivity', label: 'Primary AUTO Activity' },
      ],
    },
    {
      title: 'Tele-operated',
      fields: [
        { key: 'coralScoringLocation', label: 'Coral Scoring Location' },
        { key: 'algaeHandling', label: 'Algae Handling' },
        { key: 'defensePlayed', label: 'Defense Played' },
        { key: 'drivingSpeed', label: 'Driving Speed/Agility' },
      ],
    },
    {
      title: 'Endgame',
      fields: [
        { key: 'endgameAction', label: 'Endgame Action' },
      ],
    },
  ]
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Team {teamData.teamNumber}</h1>
        <Link 
          to="/teams" 
          className="text-blue-600 hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Team List
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                {section.title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.key} className="flex flex-col">
                    <span className="text-gray-600 text-sm">{field.label}</span>
                    <span className="font-medium">
                      {formatFieldValue(field.key, teamData[field.key])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Team Strengths</h2>
          
          <div className="space-y-2">
            {/* Auto-generated strengths based on team data */}
            {teamData.coralScoredAutoL1 !== '0' || teamData.coralScoredAutoReef !== '0' && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Strong autonomous scoring capabilities</span>
              </div>
            )}
            
            {teamData.coralScoringLocation.includes('L3Branches') || teamData.coralScoringLocation.includes('L4Branches') && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Can score on high branches (L3/L4)</span>
              </div>
            )}
            
            {teamData.algaeHandling !== 'doesNotHandle' && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Capable of handling algae</span>
              </div>
            )}
            
            {teamData.endgameAction === 'climbsCageShallow' || teamData.endgameAction === 'climbsCageDeep' && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Can climb for endgame points</span>
              </div>
            )}
            
            {teamData.drivingSpeed === 'veryFast' || teamData.drivingSpeed === 'fast' && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Fast and agile driving</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamDetails 