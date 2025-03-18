import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import React from 'react'
import { getTeamByNumber, getPositionName, TeamData } from '../services/teamDataService'

// Helper function to get full position name
const getPositionName = (position: string): string => {
  switch (position) {
    case 'L': return 'Left';
    case 'M': return 'Middle';
    case 'R': return 'Right';
    case 'N': return 'Does Not Move';
    // Handle old format values for backward compatibility
    case 'leftCoralStation': return 'Left';
    case 'middle': return 'Middle';
    case 'rightCoralStation': return 'Right';
    default: return position;
  }
};

// Helper to convert values to more readable formats
const getPrimaryActivityName = (activity: string): string => {
  switch (activity) {
    case 'onlyScoresPreloaded': return 'Only Scores Preloaded Coral';
    case 'retrievesAndScores': return 'Retrieves and Scores Additional Coral';
    case 'algaeRemoval': return 'Algae Removal/Scoring';
    default: return activity;
  }
};

const getAlgaeHandlingName = (handling: string): string => {
  switch (handling) {
    case 'doesNotHandle': return 'Does Not Handle Algae';
    case 'collectsFromReef': return 'Collects from Reef';
    case 'collectsFromFloor': return 'Collects from Floor';
    case 'scoresInProcessor': return 'Scores in Processor';
    case 'scoresInOwnNet': return 'Scores in own Net';
    case 'bothBandC': return 'Both Collects from Reef and Floor';
    default: return handling;
  }
};

const getDefensePlayedName = (defense: string): string => {
  switch (defense) {
    case 'never': return 'Never';
    case 'occasionally': return 'Occasionally';
    case 'frequently': return 'Frequently';
    case 'primarilyDefensive': return 'Primarily a Defensive Bot';
    default: return defense;
  }
};

const getEndgameActionName = (action: string): string => {
  switch (action) {
    case 'noAction': return 'No Action';
    case 'parksInBargeZone': return 'Parks in Barge Zone';
    case 'climbsCageShallow': return 'Climbs Cage (Shallow)';
    case 'climbsCageDeep': return 'Climbs Cage (Deep)';
    default: return action;
  }
}; 