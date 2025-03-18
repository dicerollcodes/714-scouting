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

## Deployment

### Deploying to Heroku

1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku CLI:
   ```
   heroku login
   ```

3. Create a new Heroku app:
   ```
   heroku create team714-scouting
   ```

4. Add MongoDB add-on or set up environment variable for MongoDB Atlas:
   ```
   heroku addons:create mongodb
   ```
   or
   ```
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   ```

5. Set your TBA API key:
   ```
   heroku config:set TBA_API_KEY=your_tba_api_key
   ```

6. Deploy to Heroku:
   ```
   git push heroku main
   ```

### Deploying to Vercel, Netlify, or Railway

Follow the standard deployment procedures for these platforms, ensuring you set up the environment variables correctly.

## Using the Alliance Selection Feature

1. Navigate to the Alliance Selection page
2. Enter a Blue Alliance event URL or event code (e.g., `2023txcha`)
3. Click "Fetch Event Data" to load team rankings
4. Drag teams to alliance positions (captain, first pick, second pick)
5. Click "Finalize Selections" to save your alliance selections to the database

## Development

### Project Structure

- `src/` - Frontend React code
  - `pages/` - Main application pages
  - `components/` - Reusable UI components
- `server.js` - Express.js backend server
- `dist/` - Built frontend files (after running `npm run build`)

### Backend API Endpoints

- `GET /api/alliances/:eventKey` - Get saved alliance selections for an event
- `POST /api/alliances` - Save alliance selections for an event

## License

MIT

## Acknowledgements

- [The Blue Alliance](https://www.thebluealliance.com/) for providing the API
- FIRST Robotics Competition for the inspiration 