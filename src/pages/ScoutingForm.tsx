import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addTeamData } from '../services/teamDataService'

// Firebase import will be used later
// import { addTeamData } from '../firebase/firestore'

const ScoutingForm = () => {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    teamNumber: '',
    // Autonomous
    startingPosition: [] as string[],
    leavesStartingLine: '',
    coralScoredAutoL1: '',
    coralScoredAutoReef: '',
    algaeScoredAutoReef: '',
    primaryAutoActivity: '',
    // Teleop
    coralScoringLocation: [] as string[],
    algaeHandling: [] as string[],
    defensePlayed: '',
    drivingSpeed: '',
    // Endgame
    endgameAction: '',
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    const value = e.target.value
    
    setFormData(prev => {
      if (checked) {
        return { ...prev, [name]: [...prev[name as keyof typeof prev] as string[], value] }
      } else {
        return { 
          ...prev, 
          [name]: (prev[name as keyof typeof prev] as string[]).filter(item => item !== value)
        }
      }
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.teamNumber) {
      alert('Please enter a team number')
      return
    }
    
    try {
      // Create capabilities object based on form data
      const teamData = {
        ...formData,
        capabilities: {
          autoScoring: formData.coralScoredAutoL1 !== '0' || formData.coralScoredAutoReef !== '0',
          highScoring: formData.coralScoringLocation.includes('L3Branches') || formData.coralScoringLocation.includes('L4Branches'),
          algaeHandling: formData.algaeHandling.length > 0 && 
            (formData.algaeHandling.length > 1 || !formData.algaeHandling.includes('doesNotHandle')),
          climbing: formData.endgameAction === 'climbsCageShallow' || formData.endgameAction === 'climbsCageDeep',
          fastDriving: formData.drivingSpeed === 'veryFast' || formData.drivingSpeed === 'fast'
        }
      }
      
      // Save to MongoDB via the API
      await addTeamData(teamData)
      console.log('Form submitted:', teamData)
      alert('Team data submitted successfully!')
      navigate('/teams')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error submitting form. Please try again.')
    }
  }
  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-center mb-6">FRC 2025 REEFSCAPE Scouting Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Team Number */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="teamNumber">
            Team Number:
          </label>
          <input
            type="text"
            id="teamNumber"
            name="teamNumber"
            value={formData.teamNumber}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter team number"
          />
        </div>
        
        {/* Autonomous Section */}
        <fieldset className="border rounded-md p-4">
          <legend className="text-xl font-bold px-2">I. Autonomous (AUTO)</legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Starting Position */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Starting Position (as marked on field map):
              </label>
              <div className="space-y-2">
                <div>
                  <input
                    type="checkbox"
                    id="startingPositionL"
                    name="startingPosition"
                    value="L"
                    checked={formData.startingPosition.includes('L')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="startingPositionL">A) L - Left</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="startingPositionM"
                    name="startingPosition"
                    value="M"
                    checked={formData.startingPosition.includes('M')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="startingPositionM">B) M - Middle</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="startingPositionR"
                    name="startingPosition"
                    value="R"
                    checked={formData.startingPosition.includes('R')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="startingPositionR">C) R - Right</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="startingPositionN"
                    name="startingPosition"
                    value="N"
                    checked={formData.startingPosition.includes('N')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="startingPositionN">D) N - Does Not Move</label>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Select all that apply. Positions can be dragged to exact locations in the preview field.
              </p>
            </div>
            
            {/* Leaves Starting Line */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Leaves Starting Line:
              </label>
              <select
                name="leavesStartingLine"
                value={formData.leavesStartingLine}
                onChange={handleSelectChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select an option</option>
                <option value="yes">A) Yes</option>
                <option value="no">B) No</option>
              </select>
            </div>
            
            {/* Coral Scored in AUTO (Trough - L1) */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Coral Scored in AUTO (L1):
              </label>
              <select
                name="coralScoredAutoL1"
                value={formData.coralScoredAutoL1}
                onChange={handleSelectChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select an option</option>
                <option value="0">A) 0</option>
                <option value="1">B) 1</option>
                <option value="2">C) 2</option>
                <option value="3+">D) 3+</option>
              </select>
            </div>
            
            {/* Coral Scored on the REEF in AUTO */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Coral Scored on the REEF in AUTO (L2, L3, or L4):
              </label>
              <select
                name="coralScoredAutoReef"
                value={formData.coralScoredAutoReef}
                onChange={handleSelectChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select an option</option>
                <option value="0">A) 0</option>
                <option value="1">B) 1</option>
                <option value="2">C) 2</option>
                <option value="3+">D) 3+</option>
              </select>
            </div>
            
            {/* Algae scored on reef in auto */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Algae removed from reef in auto:
              </label>
              <select
                name="algaeScoredAutoReef"
                value={formData.algaeScoredAutoReef}
                onChange={handleSelectChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select an option</option>
                <option value="0">A) 0</option>
                <option value="1">B) 1</option>
                <option value="2+">C) 2+</option>
              </select>
            </div>
            
            {/* Primary AUTO Activity */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Primary AUTO Activity (Choose One):
              </label>
              <select
                name="primaryAutoActivity"
                value={formData.primaryAutoActivity}
                onChange={handleSelectChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select an option</option>
                <option value="onlyScoresPreloaded">A) Only Scores Preloaded Coral</option>
                <option value="retrievesAndScores">B) Retrieves and Scores Additional Coral</option>
                <option value="algaeRemoval">C) Algae Removal/Scoring</option>
                <option value="Does not do anything">D) Does not do anything</option>
              </select>
            </div>
          </div>
        </fieldset>
        
        {/* Tele-operated Section */}
        <fieldset className="border rounded-md p-4">
          <legend className="text-xl font-bold px-2">II. Tele-operated (TELEOP)</legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coral Scoring Location */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-bold mb-2">
                Coral Scoring Location (select all):
              </label>
              <div className="space-y-2">
                <div>
                  <input
                    type="checkbox"
                    id="coralL1"
                    name="coralScoringLocation"
                    value="troughL1"
                    checked={formData.coralScoringLocation.includes('troughL1')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="coralL1">A) Trough (L1)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="coralL2"
                    name="coralScoringLocation"
                    value="L2Branches"
                    checked={formData.coralScoringLocation.includes('L2Branches')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="coralL2">B) L2 Branches</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="coralL3"
                    name="coralScoringLocation"
                    value="L3Branches"
                    checked={formData.coralScoringLocation.includes('L3Branches')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="coralL3">C) L3 Branches</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="coralL4"
                    name="coralScoringLocation"
                    value="L4Branches"
                    checked={formData.coralScoringLocation.includes('L4Branches')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="coralL4">D) L4 Branches</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="coralNotObserved"
                    name="coralScoringLocation"
                    value="notObserved"
                    checked={formData.coralScoringLocation.includes('notObserved')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="coralNotObserved">E) Not Observed</label>
                </div>
              </div>
            </div>
            
            {/* Algae Handling */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Algae Handling:
              </label>
              <div className="space-y-2">
                <div>
                  <input
                    type="checkbox"
                    id="algaeHandlingDoesNotHandle"
                    name="algaeHandling"
                    value="doesNotHandle"
                    checked={formData.algaeHandling.includes('doesNotHandle')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="algaeHandlingDoesNotHandle">A) Does Not Handle Algae</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="algaeHandlingCollectsFromReef"
                    name="algaeHandling"
                    value="collectsFromReef"
                    checked={formData.algaeHandling.includes('collectsFromReef')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="algaeHandlingCollectsFromReef">B) Collects from Reef</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="algaeHandlingCollectsFromFloor"
                    name="algaeHandling"
                    value="collectsFromFloor"
                    checked={formData.algaeHandling.includes('collectsFromFloor')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="algaeHandlingCollectsFromFloor">C) Collects from Floor</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="algaeHandlingScoresInProcessor"
                    name="algaeHandling"
                    value="scoresInProcessor"
                    checked={formData.algaeHandling.includes('scoresInProcessor')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="algaeHandlingScoresInProcessor">D) Scores in Processor</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="algaeHandlingScoresInOwnNet"
                    name="algaeHandling"
                    value="scoresInOwnNet"
                    checked={formData.algaeHandling.includes('scoresInOwnNet')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="algaeHandlingScoresInOwnNet">E) Scores in own Net</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="algaeHandlingBothBandC"
                    name="algaeHandling"
                    value="bothBandC"
                    checked={formData.algaeHandling.includes('bothBandC')}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="algaeHandlingBothBandC">F) Both B and C</label>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Select all that apply. Items can be dragged to exact locations in the preview field.
              </p>
            </div>
            
            {/* Defense Played */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Defense Played:
              </label>
              <select
                name="defensePlayed"
                value={formData.defensePlayed}
                onChange={handleSelectChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select an option</option>
                <option value="never">A) Never</option>
                <option value="occasionally">B) Occasionally</option>
                <option value="frequently">C) Frequently</option>
                <option value="primarilyDefensive">D) Primarily a Defensive Bot</option>
              </select>
            </div>
            
            {/* Driving Speed/Agility */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Driving Speed/Agility (Subjective):
              </label>
              <select
                name="drivingSpeed"
                value={formData.drivingSpeed}
                onChange={handleSelectChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select an option</option>
                <option value="veryFast">A) Very Fast</option>
                <option value="fast">B) Fast</option>
                <option value="moderate">C) Moderate</option>
                <option value="slow">D) Slow</option>
              </select>
            </div>
          </div>
        </fieldset>
        
        {/* Endgame Section */}
        <fieldset className="border rounded-md p-4">
          <legend className="text-xl font-bold px-2">III. Endgame</legend>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Endgame Action:
            </label>
            <select
              name="endgameAction"
              value={formData.endgameAction}
              onChange={handleSelectChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select an option</option>
              <option value="noAction">A) No Action</option>
              <option value="parksInBargeZone">B) Parks in Barge Zone</option>
              <option value="climbsCageShallow">C) Climbs Cage (Shallow)</option>
              <option value="climbsCageDeep">D) Climbs Cage (Deep)</option>
            </select>
          </div>
        </fieldset>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-team-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default ScoutingForm 