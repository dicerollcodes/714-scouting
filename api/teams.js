const mongoose = require('mongoose');
require('dotenv').config();

// Define Team Schema
const TeamSchema = new mongoose.Schema({
  teamNumber: String,
  name: String,
  startingPosition: [String],
  leavesStartingLine: String,
  coralScoredAutoL1: String,
  coralScoredAutoReef: String,
  algaeScoredAutoReef: String,
  primaryAutoActivity: String,
  coralScoringLocation: [String],
  algaeHandling: [String],
  defensePlayed: String,
  drivingSpeed: String,
  endgameAction: String,
  capabilities: {
    autoScoring: Boolean,
    highScoring: Boolean,
    algaeHandling: Boolean,
    climbing: Boolean,
    fastDriving: Boolean,
  },
});

// Only create the model if it hasn't been created already
const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

// Connect to MongoDB (with connection caching for serverless)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// API handler
module.exports = async (req, res) => {
  console.log('API Route Hit:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Attempting database connection...');
    // Connect to database
    await dbConnect();
    console.log('Database connected successfully');

    if (req.method === 'GET') {
      console.log('Processing GET request...');
      const teams = await Team.find();
      console.log(`Found ${teams.length} teams`);
      res.status(200).json(teams);
    } 
    else if (req.method === 'POST') {
      console.log('Processing POST request...');
      console.log('Request body:', req.body);
      
      // Ensure startingPosition and algaeHandling are arrays
      const teamData = {
        ...req.body,
        startingPosition: Array.isArray(req.body.startingPosition) ? req.body.startingPosition : [],
        algaeHandling: Array.isArray(req.body.algaeHandling) ? req.body.algaeHandling : []
      };
      
      const team = new Team(teamData);
      await team.save();
      console.log('Team saved successfully:', team.teamNumber);
      res.status(201).json(team);
    }
    else {
      console.log('Invalid method:', req.method);
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    console.error('Stack trace:', error.stack);
    console.error('MongoDB URI defined:', !!process.env.MONGODB_URI);
    console.error('Environment:', process.env.NODE_ENV);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 