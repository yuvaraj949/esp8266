This document lists all API endpoints used in the project, including their URLs, HTTP methods, and request/response formats.

---

## Base URL

- **Production:** https://zghimexugkubkyvglqmr.supabase.co/functions/v1/<endpoint>

---

## Authorization

- In **production**, all API requests include an Authorization: Bearer <SUPABASE_JWT> header for authentication.
- In **development**, the proxy handles authentication, so the Authorization header is not set by the frontend.
- The apiRequest helper function manages this automatically.

---

## Endpoints

### 1. Sensor Data

#### a. Get Latest Sensor Data
- **Endpoint:** api-data-latest
- **Method:** GET
- **Usage:** Fetches the latest sensor readings (temperature, humidity, soil moisture, etc.)
- **Request:** None
- **Response Example:**
  
json
  {
    "temperature": 25.3,
    "humidity": 60.2,
    "soil_moisture1": 1200,
    "soil_moisture2": 1100,
    "timestamp": "2024-06-01T12:34:56.789Z"
  }


#### b. Get Sensor Data History
- **Endpoint:** api-data-history
- **Method:** GET
- **Usage:** Fetches historical sensor data, supports query params since (timestamp) and limit (number)
- **Request Example:**
  GET /functions/v1/api-data-history?since=1717200000000&limit=1000
- **Response Example:**
  
json
  [
    { "temperature": 25.1, "humidity": 61, "timestamp": "2024-06-01T12:00:00.000Z" },
    { "temperature": 25.3, "humidity": 60.2, "timestamp": "2024-06-01T12:34:56.789Z" }
  ]


#### c. Post New Sensor Data
- **Endpoint:** api-data-post
- **Method:** POST
- **Usage:** (Not used in UI, but available)
- **Request Example:**
  
json
  {
    "temperature": 25.3,
    "humidity": 60.2,
    "soil_moisture1": 1200,
    "soil_moisture2": 1100
  }

- **Response:**
  
json
  { "success": true }


---

### 2. Pump Control

#### a. Get Pump Status
- **Endpoint:** api-pump-get
- **Method:** GET
- **Usage:** Fetches the current status of the pump (on/off)
- **Request:** None
- **Response Example:**
  
json
  { "status": true }


#### b. Set Pump Status
- **Endpoint:** api-pump-post
- **Method:** POST
- **Usage:** Sets the pump on or off
- **Request Example:**
  
json
  { "on": true }

- **Response Example:**
  
json
  { "success": true }


#### c. Get Pump Logs
- **Endpoint:** api-pump-logs
- **Method:** GET
- **Usage:** (Not used in UI, but available)
- **Request:** None
- **Response Example:**
  
json
  [
    { "timestamp": "2024-06-01T12:00:00.000Z", "on": true },
    { "timestamp": "2024-06-01T13:00:00.000Z", "on": false }
  ]


---

### 3. Device Status

#### a. Get Device Status
- **Endpoint:** api-device-status
- **Method:** GET
- **Usage:** Fetches the online/offline status and last seen time of the ESP32 device
- **Request:** None
- **Response Example:**
  
json
  {
    "ESP32": { "online": true, "lastSeen": "2024-06-01T12:34:56.789Z" }
  }


#### b. Ping Device Status
- **Endpoint:** api-device-status-ping
- **Method:** GET
- **Usage:** (Not used in UI, but available)
- **Request:** None
- **Response Example:**
  
json
  { "success": true }


---

### 4. Restart Trigger

#### a. Get Restart Trigger State
- **Endpoint:** api-restart-trigger
- **Method:** GET
- **Usage:** Fetches the current restart trigger state for the ESP32
- **Request:** None
- **Response Example:**
  
json
  { "ESP32": false }


#### b. Set Restart Trigger
- **Endpoint:** api-restart-trigger-post
- **Method:** POST
- **Usage:** Triggers a restart for the ESP32 device
- **Request Example:**
  
json
  { "device": "ESP32" }

- **Response Example:**
  
json
  { "ESP32": true }


#### c. Reset Restart Trigger
- **Endpoint:** api-restart-trigger-reset
- **Method:** POST
- **Usage:** (Not used in UI, but available)
- **Request Example:**
  
json
  { "device": "ESP32" }

- **Response Example:**
  
json
  { "ESP32": false }


---

## Notes
- All endpoints are called via the apiRequest helper, which automatically sets headers and handles authentication in production.
- Query parameters for history endpoints: since (timestamp, ms), limit (number of records).
- Not all endpoints are used in the UI, but are available for integration. 