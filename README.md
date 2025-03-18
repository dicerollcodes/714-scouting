# FRC Team 714 Scouting App

A scouting application for FRC competitions with an Alliance Selection feature that integrates with The Blue Alliance API.

## Features

- **Alliance Selection**: Fetch real-time data from The Blue Alliance API and create alliance selections
- **MongoDB Integration**: Store and retrieve alliance selections
- **Team Rankings**: View team statistics including Average Score, Average Auto, and OPR
- **Drag and Drop Interface**: Easily create alliance selections with a visual interface

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local installation or MongoDB Atlas account)
- The Blue Alliance API Key

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd 714-scouting
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/frc-scouting
   PORT=5000
   TBA_API_KEY=your_tba_api_key
   ```

   Replace `mongodb://localhost:27017/frc-scouting` with your MongoDB connection string if using MongoDB Atlas.

## Running the Application

### Development Mode

To run both the backend server and frontend development server simultaneously:

```
npm run dev:full
```

Or run them separately:

- Frontend: `npm run dev`
- Backend: `npm run server`

### Production Mode

1. Build the frontend:
   ```
   npm run build
   ```

2. Start the server (which will serve the built frontend):
   ```
   npm start
   ```


## License

MIT

## Acknowledgements

- [The Blue Alliance](https://www.thebluealliance.com/) for providing the API
- FIRST Robotics Competition for the inspiration 
