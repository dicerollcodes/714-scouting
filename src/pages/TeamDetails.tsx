import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTeamByNumber } from '../services/teamDataService'

// Helper function to format field values
const formatFieldValue = (key: string, value: any): string => {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  if (value === undefined || value === null) {
    return 'N/A'
  }
  return value.toString()
}

const TeamDetails = () => {
  const { teamNumber } = useParams<{ teamNumber: string }>()
  const [teamData, setTeamData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true)
      try {
        const team = await getTeamByNumber(teamNumber || '')
        setTeamData(team)
      } catch (error) {
        console.error('Error fetching team data:', error)
        setTeamData(null)
      } finally {
        setLoading(false)
      }
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
        { key: 'algaeScoredAutoReef', label: 'Algae Removed from REEF in AUTO' },
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