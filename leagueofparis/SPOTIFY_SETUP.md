# Spotify Authentication Setup

This page provides a development interface for Spotify OAuth authentication and displays access/refresh tokens.

## Setup Instructions

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in the app details:
   - App name: Your app name
   - App description: Brief description
   - Website: Your website URL
   - Redirect URI: `http://localhost:5173/spotify-auth` (for development)
4. Save the app

### 2. Configure Environment Variables

Create a `.env` file in your project root and add:

```env
# Spotify OAuth Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Other existing environment variables
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
```

### 3. Update the Frontend

In `src/pages/SpotifyAuth.jsx`, replace `YOUR_SPOTIFY_CLIENT_ID` with your actual client ID:

```javascript
const CLIENT_ID = "your_actual_spotify_client_id";
```

### 4. Start the Development Server

1. Start the backend server:

   ```bash
   npm run start:server
   ```

2. Start the frontend:

   ```bash
   npm run dev
   ```

3. Navigate to `http://localhost:5173/spotify-auth`

## How It Works

1. User clicks "Sign in with Spotify"
2. User is redirected to Spotify's authorization page
3. After authorization, Spotify redirects back with an authorization code
4. The backend exchanges the code for access and refresh tokens
5. Tokens are displayed on the page for development use

## Security Notes

- This page is for development purposes only
- Never expose client secrets in frontend code
- Access tokens expire after 1 hour
- Refresh tokens are long-lived and should be stored securely
- In production, implement proper token storage and refresh mechanisms

## API Endpoints

- `POST /api/spotify/token` - Exchanges authorization code for tokens
  - Body: `{ code: string, redirect_uri: string }`
  - Returns: `{ access_token, refresh_token, token_type, expires_in, scope }`
