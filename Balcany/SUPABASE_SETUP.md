# Supabase Edge Functions Setup

This frontend application has been updated to use Supabase Edge Functions instead of the previous Vercel backend.

## Configuration

### 1. Update JWT Token

You need to update the JWT token in the API configuration file:

1. Open `src/config/api.js`
2. Replace `'your_jwt_token_here'` with your actual Supabase JWT token
3. Save the file

```javascript
// In src/config/api.js
const SUPABASE_JWT = 'your_actual_jwt_token_here';
```

### 2. Getting Your JWT Token

To get your JWT token from Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the `anon` public key or generate a service role key
4. Use this as your JWT token

### 3. Environment Variables (Alternative)

If you prefer to use environment variables:

1. Create a `.env` file in the root directory
2. Add your JWT token:
   ```
   VITE_SUPABASE_JWT=your_jwt_token_here
   ```
3. Update `src/config/api.js` to use the environment variable:
   ```javascript
   const SUPABASE_JWT = import.meta.env.VITE_SUPABASE_JWT || 'your_jwt_token_here';
   ```

## CORS Configuration

### Development Mode
The application uses a Vite proxy to handle CORS issues during development. This is configured in `vite.config.js` and automatically routes API requests through the proxy.

### Production Mode
In production, the application makes direct requests to Supabase Edge Functions. Make sure your Edge Functions are configured to allow CORS from your production domain.

## API Endpoints

The application now uses these Supabase Edge Functions:

- **Sensor Data**: `api-data-latest`, `api-data-history`, `api-data-post`
- **Pump Control**: `api-pump-get`, `api-pump-post`, `api-pump-logs`
- **Device Status**: `api-device-status`, `api-device-status-ping`
- **Restart Triggers**: `api-restart-trigger`, `api-restart-trigger-post`, `api-restart-trigger-reset`

## Testing

You can test the API endpoints using the cURL commands provided in the main README or use the frontend application directly.

## Troubleshooting CORS Issues

If you encounter CORS errors:

1. **Development**: The Vite proxy should handle CORS automatically
2. **Production**: Ensure your Supabase Edge Functions include proper CORS headers:
   ```javascript
   // In your Edge Function
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   };
   ```

## Security Notes

- Keep your JWT token secure and don't commit it to version control
- Consider using environment variables for production deployments
- The JWT token provides authentication for all API requests 