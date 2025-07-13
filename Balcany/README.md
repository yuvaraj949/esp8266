# Smart Garden Dashboard

This project is a gardening dashboard for monitoring and controlling your garden using an ESP8266 (NodeMCU) with temperature and humidity sensors, and a pump. It features:

- **Supabase Edge Functions backend** with PostgreSQL for storing sensor data and controlling the pump
- **React + Vite frontend** for displaying live and historical data, and triggering the pump

## Features
- Receive and store temperature/humidity data from ESP8266
- Display latest sensor values with beautiful gauge visualizations
- Show historical data as interactive graphs with time scale selection
- Manually trigger the pump from the web app
- Monitor device status (NodeMCU and Raspberry Pi)
- Remote device restart functionality
- Real-time updates with polling

## Getting Started

### Prerequisites
- Node.js installed
- Supabase project with Edge Functions deployed
- JWT token from your Supabase project

### Setup
1. Install dependencies:
   ```sh
   npm install
   ```

2. Configure the JWT token:
   - Open `src/config/api.js`
   - Replace `'your_jwt_token_here'` with your actual Supabase JWT token
   - See `SUPABASE_SETUP.md` for detailed instructions

3. Start the frontend:
   ```sh
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

The application uses Supabase Edge Functions for all backend operations:

- **Sensor Data**: `api-data-latest`, `api-data-history`, `api-data-post`
- **Pump Control**: `api-pump-get`, `api-pump-post`, `api-pump-logs`
- **Device Status**: `api-device-status`, `api-device-status-ping`
- **Restart Triggers**: `api-restart-trigger`, `api-restart-trigger-post`, `api-restart-trigger-reset`

## Testing

You can test the API endpoints using the cURL commands provided in the main project README.

## Development

- **Frontend**: React with Vite for fast development
- **Charts**: Recharts for data visualization
- **Styling**: CSS with modern gradient designs
- **API**: Centralized API configuration with authentication

## Security

- All API requests are authenticated using JWT tokens
- Keep your JWT token secure and don't commit it to version control
- Consider using environment variables for production deployments
