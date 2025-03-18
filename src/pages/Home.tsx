import React from 'react';
import { Link } from 'react-router-dom'
import FieldVisualization from '../components/FieldVisualization'

const Home = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Team 714 Scouting System</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Track and analyze team performance for the FRC 2025 REEFSCAPE competition
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/scout" 
          className="bg-team-blue text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          <h2 className="text-2xl font-bold mb-2">Scout a Team</h2>
          <p>Record data about team performance during matches</p>
        </Link>
        
        <Link 
          to="/teams" 
          className="bg-team-red text-white p-6 rounded-lg shadow-md hover:bg-red-700 transition"
        >
          <h2 className="text-2xl font-bold mb-2">View Teams</h2>
          <p>Browse and analyze scouted team data</p>
        </Link>
        
        <Link 
          to="/alliance-selection" 
          className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition"
        >
          <h2 className="text-2xl font-bold mb-2">Alliance Selection</h2>
          <p>Manage alliance drafting process with real-time team stats</p>
        </Link>
      </div>
      
      <div className="mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Interactive Field Visualization</h2>
          <p className="text-gray-600 mb-4">
            Drag teams onto the blue or red alliance areas to see how they would position on the field. 
            Click on any team to view their capabilities with green checkmarks or red X marks.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <div className="bg-gray-100 px-3 py-1 rounded-full">Drag & Drop Teams</div>
            <div className="bg-gray-100 px-3 py-1 rounded-full">View Team Capabilities</div>
            <div className="bg-gray-100 px-3 py-1 rounded-full">Plan Alliance Strategies</div>
          </div>
        </div>
        <FieldVisualization />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">About FRC 2025 REEFSCAPE</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Game Elements</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Coral pieces that can be scored in troughs (L1) or on reef branches (L2-L4)</li>
              <li>Algae that can be collected from the reef or floor and scored in processors</li>
              <li>Barge zone for parking during endgame</li>
              <li>Cage structures for climbing during endgame</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Match Phases</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li><strong>Autonomous:</strong> Robots operate independently for 15 seconds</li>
              <li><strong>Tele-operated:</strong> Drivers control robots for the main phase</li>
              <li><strong>Endgame:</strong> Final 30 seconds for climbing and parking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 