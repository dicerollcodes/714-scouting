const mongoose = require('mongoose');
require('dotenv').config();

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
        return mongoose;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = async (req, res) => {
  console.log('Status Route Hit:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      console.log('Attempting database connection for status check...');
      await dbConnect();
      console.log('Database connected successfully');
      
      const status = {
        status: 'OK',
        message: 'API is running',
        mongodbConnected: mongoose.connection.readyState === 1,
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      };
      
      console.log('Status check result:', status);
      res.status(200).json(status);
    } catch (error) {
      console.error('Status check error:', error);
      console.error('Stack trace:', error.stack);
      console.error('MongoDB URI defined:', !!process.env.MONGODB_URI);
      console.error('Environment:', process.env.NODE_ENV);
      
      res.status(500).json({
        status: 'ERROR',
        message: 'API Error',
        error: error.message,
        mongodbConnected: mongoose.connection.readyState === 1,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } else {
    console.log('Invalid method for status endpoint:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 