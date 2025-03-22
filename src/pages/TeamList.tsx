import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllTeams, getPositionName, TeamData } from '../services/teamDataService'

const TeamList = () => {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState({
    autoScoring: false,
    highScoring: false,
    algaeHandling: false,
    climbing: false,
  })
  
  // Fetch team data from MongoDB
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsData = await getAllTeams()
        setTeams(teamsData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching teams:', error)
        setLoading(false)
      }
    }
    
    fetchTeams()
  }, [])
  
  // Filter teams based on search and capability filters
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.teamNumber.includes(searchTerm)
    
    // Skip capability filtering if no filters are active
    if (!filter.autoScoring && !filter.highScoring && !filter.algaeHandling && !filter.climbing) {
      return matchesSearch
    }
    
    // Check capabilities
    const capabilities = team.capabilities || {
      autoScoring: team.coralScoredAutoL1 !== '0' || team.coralScoredAutoReef !== '0',
      highScoring: team.coralScoringLocation.includes('L3Branches') || team.coralScoringLocation.includes('L4Branches'),
      algaeHandling: Array.isArray(team.algaeHandling) 
        ? team.algaeHandling.length > 0 && (!team.algaeHandling.includes('doesNotHandle') || team.algaeHandling.length > 1)
        : team.algaeHandling !== 'doesNotHandle',
      climbing: team.endgameAction === 'climbsCageShallow' || team.endgameAction === 'climbsCageDeep',
      fastDriving: team.drivingSpeed === 'veryFast' || team.drivingSpeed === 'fast'
    }
    
    // Check if the team has all the selected capabilities
    const hasRequiredCapabilities = 
      (!filter.autoScoring || capabilities.autoScoring) &&
      (!filter.highScoring || capabilities.highScoring) &&
      (!filter.algaeHandling || capabilities.algaeHandling) &&
      (!filter.climbing || capabilities.climbing)
    
    return matchesSearch && hasRequiredCapabilities
  })
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFilter(prev => ({
      ...prev,
      [name]: checked
    }))
  }
  
  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Team List</h1>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Search teams..."
            className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Link 
            to="/alliance-selection" 
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center"
          >
            Alliance Selection
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">Filter by Capabilities</h2>
          <div className="mt-2 flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                name="autoScoring" 
                checked={filter.autoScoring} 
                onChange={handleFilterChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Auto Scoring</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                name="highScoring" 
                checked={filter.highScoring} 
                onChange={handleFilterChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">High Scoring (L3/L4)</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                name="algaeHandling" 
                checked={filter.algaeHandling} 
                onChange={handleFilterChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Handles Algae</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                name="climbing" 
                checked={filter.climbing} 
                onChange={handleFilterChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Can Climb</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.length === 0 ? (
          <div className="col-span-full text-center py-8 bg-white rounded-lg shadow-md">
            <h3 className="text-xl text-gray-600">No teams match your criteria</h3>
            <p className="mt-2 text-gray-500">Try adjusting your filters or search term</p>
          </div>
        ) : (
          filteredTeams.map(team => (
            <div key={team.teamNumber} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-800">Team {team.teamNumber}</h2>
                  <div className={`
                    px-2 py-1 rounded-md text-xs font-bold uppercase
                    ${Array.isArray(team.startingPosition) && team.startingPosition.length > 0 
                      ? (team.startingPosition.includes('L') ? 'bg-blue-100 text-blue-800' : 
                         team.startingPosition.includes('M') ? 'bg-green-100 text-green-800' : 
                         'bg-red-100 text-red-800')
                      : 'bg-gray-100 text-gray-800'}
                  `}>
                    {getPositionName(team.startingPosition)}
                  </div>
                </div>
                
                <div className="mt-4 mb-6 space-y-2">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${team.coralScoredAutoL1 !== '0' || team.coralScoredAutoReef !== '0' ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                    <span className="text-sm text-gray-600">Auto Scoring</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${team.coralScoringLocation.includes('L3Branches') || team.coralScoringLocation.includes('L4Branches') ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                    <span className="text-sm text-gray-600">High Scoring (L3/L4)</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${
                      Array.isArray(team.algaeHandling) 
                        ? (team.algaeHandling.length > 0 && !team.algaeHandling.includes('doesNotHandle')) 
                        : (team.algaeHandling !== 'doesNotHandle')
                    } ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                    <span className="text-sm text-gray-600">Handles Algae</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${team.endgameAction === 'climbsCageShallow' || team.endgameAction === 'climbsCageDeep' ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                    <span className="text-sm text-gray-600">Can Climb</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${team.drivingSpeed === 'veryFast' || team.drivingSpeed === 'fast' ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                    <span className="text-sm text-gray-600">Fast Driving</span>
                  </div>
                </div>
                
                <Link 
                  to={`/teams/${team.teamNumber}`} 
                  className="block w-full bg-team-blue text-white text-center py-2 rounded-md hover:bg-blue-700 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TeamList 