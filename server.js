const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// More permissive CORS configuration
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Add options preflight for all routes
app.options('*', cors());

// Add a simple test endpoint that responds to all origins
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.json({ message: 'API server is working correctly!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/frc-scouting', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.log('MongoDB connection error:', err);
  console.log('Connection string used (redacted password):', 
    process.env.MONGODB_URI ? 
    process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@') : 
    'mongodb://localhost:27017/frc-scouting');
});

// Define Alliance Schema
const AllianceSchema = new mongoose.Schema({
  eventKey: String,
  alliances: [{
    allianceNumber: Number,
    captain: Number,
    firstPick: Number,
    secondPick: Number
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Alliance = mongoose.model('Alliance', AllianceSchema);

// Routes with explicit CORS headers
app.get('/api/alliances/:eventKey', async (req, res) => {
  try {
    // Add CORS headers explicitly
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    console.log(`GET request received for event key: ${req.params.eventKey}`);
    const { eventKey } = req.params;
    const alliances = await Alliance.findOne({ eventKey });
    console.log(`Found alliances: ${alliances ? 'Yes' : 'No'}`);
    res.json(alliances || { message: 'No alliances found for this event' });
  } catch (error) {
    console.error('Error fetching alliances:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alliances', async (req, res) => {
  try {
    // Add CORS headers explicitly
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    console.log('POST request received for alliances');
    
    // Check if request body exists
    if (!req.body) {
      console.error('Empty request body');
      return res.status(400).json({ error: 'Empty request body' });
    }
    
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { eventKey, alliances } = req.body;
    
    // Validate required fields
    if (!eventKey) {
      console.error('Missing eventKey in request');
      return res.status(400).json({ error: 'Missing eventKey' });
    }
    
    if (!alliances || !Array.isArray(alliances)) {
      console.error('Invalid alliances data:', alliances);
      return res.status(400).json({ error: 'Invalid alliances data' });
    }
    
    // Check if an entry already exists for this event
    const existingAlliance = await Alliance.findOne({ eventKey });
    console.log(`Existing alliance found: ${existingAlliance ? 'Yes' : 'No'}`);
    
    if (existingAlliance) {
      // Update existing record
      existingAlliance.alliances = alliances;
      existingAlliance.timestamp = new Date();
      await existingAlliance.save();
      console.log('Existing alliance updated successfully');
      res.json(existingAlliance);
    } else {
      // Create new record
      const newAlliance = new Alliance({
        eventKey,
        alliances
      });
      await newAlliance.save();
      console.log('New alliance created successfully');
      res.json(newAlliance);
    }
  } catch (error) {
    console.error('Error saving alliances:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 