// API Configuration for Supabase Edge Functions
const SUPABASE_URL = 'https://zghimexugkubkyvglqmr.supabase.co';
const SUPABASE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaGltZXh1Z2t1Ymt5dmdscW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTM0MTYsImV4cCI6MjA2Nzg2OTQxNn0.-CQPk25p5AZX90uyU5OSoR16EJYNd7piEfs718JIDNk'; // Replace with your actual JWT token

// Use proxy in development, direct URL in production
const isDevelopment = import.meta.env.DEV;
const BASE_URL = isDevelopment ? '' : SUPABASE_URL;
const API_PREFIX = isDevelopment ? '/api' : `${SUPABASE_URL}/functions/v1`;

// Helper function to make authenticated API requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_PREFIX}/${endpoint}`;
  
  console.log('API Request Details:');
  console.log('- Endpoint:', endpoint);
  console.log('- Full URL:', url);
  console.log('- Development mode:', isDevelopment);
  console.log('- API_PREFIX:', API_PREFIX);
  
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  // Only add Authorization header in production (proxy handles it in development)
  if (!isDevelopment) {
    defaultHeaders['Authorization'] = `Bearer ${SUPABASE_JWT}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
    // Add CORS mode for development
    mode: 'cors',
    credentials: 'omit'
  };

  console.log('- Request config:', {
    method: config.method || 'GET',
    headers: config.headers,
    body: config.body
  });

  try {
    const response = await fetch(url, config);
    console.log('- Response status:', response.status);
    console.log('- Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('- Error response body:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('- Response data:', data);
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// API endpoints
export const API_ENDPOINTS = {
  // Sensor data endpoints
  DATA_LATEST: 'api-data-latest',
  DATA_HISTORY: 'api-data-history',
  DATA_POST: 'api-data-post',
  
  // Pump control endpoints
  PUMP_GET: 'api-pump-get',
  PUMP_POST: 'api-pump-post',
  PUMP_LOGS: 'api-pump-logs',
  
  // Device status endpoints
  DEVICE_STATUS: 'api-device-status',
  DEVICE_STATUS_PING: 'api-device-status-ping',
  
  // Restart trigger endpoints
  RESTART_TRIGGER: 'api-restart-trigger',
  RESTART_TRIGGER_POST: 'api-restart-trigger-post',
  RESTART_TRIGGER_RESET: 'api-restart-trigger-reset'
}; 