const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log('MongoDB URI exists:', !!uri);
console.log('MongoDB URI length:', uri ? uri.length : 0);

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
  console.log('Connection state:', mongoose.connection.readyState);
  process.exit(0);
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  console.error('Full error details:', JSON.stringify(error, null, 2));
  process.exit(1);
}); 