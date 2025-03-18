import React from 'react';
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold">
              Team 714 Scouting
            </Link>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-team-blue transition">
              Home
            </Link>
            <Link to="/scout" className="hover:text-team-blue transition">
              Scouting Form
            </Link>
            <Link to="/teams" className="hover:text-team-blue transition">
              Team List
            </Link>
            <Link to="/alliance-selection" className="hover:text-team-blue transition">
              Alliance Selection
            </Link>
          </div>
          <div className="md:hidden">
            {/* Mobile menu button would go here */}
            <button className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 