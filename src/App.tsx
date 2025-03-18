import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ScoutingForm from './pages/ScoutingForm'
import TeamList from './pages/TeamList'
import TeamDetails from './pages/TeamDetails'
import AllianceSelection from './pages/AllianceSelection'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scout" element={<ScoutingForm />} />
          <Route path="/teams" element={<TeamList />} />
          <Route path="/teams/:teamNumber" element={<TeamDetails />} />
          <Route path="/alliance-selection" element={<AllianceSelection />} />
        </Routes>
      </main>
    </div>
  )
}

export default App 