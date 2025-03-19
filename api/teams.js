const mongoose = require('mongoose');
require('dotenv').config();

// Define Team Schema
const TeamSchema = new mongoose.Schema({
  teamNumber: String,
  name: String,
  startingPosition: String,
  leavesStartingLine: String,
  coralScoredAutoL1: String,
  coralScoredAutoReef: String,
  algaeScoredAutoReef: String,
  primaryAutoActivity: String,
  coralScoringLocation: [String],
  algaeHandling: String,
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
    // Connect to database
    await dbConnect();

    if (req.method === 'GET') {
      const teams = await Team.find();
      res.status(200).json(teams);
    } 
    else if (req.method === 'POST') {
      const team = new Team(req.body);
      await team.save();
      res.status(201).json(team);
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}; 