
<!-- PROJECT TAGS -->
<p align="center">
  <img src="https://img.shields.io/badge/IoT-ESP8266-blue?style=flat-square" alt="IoT">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Vercel-Deploy-black?style=flat-square&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License">
</p>


<h1 align="center">🌱 ESP8266 Balcony IoT Dashboard 🌱</h1>

A web application and backend server for monitoring and controlling ESP8266-based devices (e.g., for a balcony garden or similar IoT project).

## Project Structure

```
Balcany/
  ├── backend/           # Node.js backend API
  ├── public/            # Static assets
  ├── src/               # React frontend source code
  │   ├── assets/        # Images and static files
  │   └── components/    # React components
  ├── index.html         # Main HTML file
  ├── package.json       # Frontend dependencies
  ├── vite.config.js     # Vite config
  └── README.md          # Frontend readme
LICENSE
README.md               # (this file)
```

## Features
- Real-time device status monitoring
- Control relays (e.g., pump) from the UI
- View sensor data and history graphs
- Device restart and management buttons

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd Balcany
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn
   ```
3. Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Backend Setup
1. Navigate to the backend directory:
   ```sh
   cd Balcany/backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the backend server:
   ```sh
   npm start
   ```

### Deployment
- The backend is configured for deployment on Vercel (see `vercel.json`).
- The frontend can be built with `npm run build` and deployed to any static hosting service.

## File Overview
- `Balcany/backend/index.js`: Main backend server (API endpoints for device communication)
- `Balcany/src/components/`: React components for device control, status, and visualization
- `Balcany/public/`: Static assets (SVGs, icons)

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)



admin@homelab:~/Project $ cat irrigation_system.py
```
import paho.mqtt.client as mqtt
import requests
import time
import logging
import os
from datetime import datetime
import threading


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger()

# MQTT Config
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
SENSOR_TOPIC = "sensors/data"
PUMP_TOPIC = "pump/control"
RESTART_TOPIC = "device/restart"  # New topic for restart commands

# Server Config
SERVER_URL = "https://esp8266-server.vercel.app/api/"
TRIGGER_URL = f"{SERVER_URL}restart-trigger"
RESET_URL = f"{SERVER_URL}restart-trigger/reset"
BACKEND_PING_URL = f"{SERVER_URL}device-status/ping"
CHECK_INTERVAL = 5  # Seconds for trigger checks
PUMP_CHECK_INTERVAL = 1  # Seconds

def ping_backend(device):
    try:
        requests.post(BACKEND_PING_URL, json={"device": device}, timeout=2)
    except Exception as e:
        logger.warning(f"Ping failed for {device}: {e}")

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        logger.info(f"Received sensor data: {payload}")
        response = requests.post(
            f"{SERVER_URL}data",
            data=payload,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        logger.info(f"Forwarded data: HTTP {response.status_code}")
        # Forward NodeMCU status to backend
        if msg.topic == "status/nodemcu":
            ping_backend("nodeMCU")
    except Exception as e:
        logger.error(f"Error: {str(e)}")


def periodic_pi_ping():
    while True:
        ping_backend("raspberryPi")
        time.sleep(10)

def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        logger.info("MQTT connected successfully")
        client.subscribe(SENSOR_TOPIC)
        client.subscribe("status/nodemcu")  # <-- ADD THIS LINE
        logger.info(f"Subscribed to {SENSOR_TOPIC} and status/nodemcu")
    else:
        logger.error(f"Connection failed with error code {rc}")

def on_disconnect(client, userdata, rc, properties=None):
    logger.warning(f"Disconnected from broker (rc={rc})")
    if rc != 0:
        logger.info("Attempting reconnect...")
        client.reconnect()

def check_pump_status(client):
    try:
        response = requests.get(f"{SERVER_URL}pump", timeout=1)
        if response.status_code == 200:
            data = response.json()
            status = "ON" if data.get("status") else "OFF"
            client.publish(PUMP_TOPIC, status)
            logger.info(f"Published pump: {status}")
    except Exception as e:
        logger.error(f"Pump check error: {str(e)}")

def check_restart_triggers(client):
    try:
        response = requests.get(TRIGGER_URL, timeout=2)
        if response.status_code == 200:
            triggers = response.json()
            logger.info(f"Trigger status: {triggers}")

            # Handle Raspberry Pi restart
            if triggers.get('raspberryPi'):
                logger.warning("Raspberry Pi restart triggered!")
                requests.post(RESET_URL, json={"device": "raspberryPi"})
                time.sleep(1)
                os.system('sudo reboot')

            # Handle NodeMCU restart
            if triggers.get('nodeMCU'):
                logger.warning("NodeMCU restart triggered!")
                requests.post(RESET_URL, json={"device": "nodeMCU"})
                client.publish(RESTART_TOPIC, "RESTART")
                logger.info("Sent NodeMCU restart command")

    except Exception as e:
        logger.error(f"Trigger check error: {str(e)}")

def main():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect
    client.reconnect_delay_set(min_delay=1, max_delay=120)

    try:
        logger.info("Connecting to MQTT broker...")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
        # Start Pi ping thread
        threading.Thread(target=periodic_pi_ping, daemon=True).start()

        logger.info("Middleman service running...")
        last_pump_check = time.time()
        last_trigger_check = time.time()

        while True:
            current_time = time.time()

            # Pump status checks
            if current_time - last_pump_check >= PUMP_CHECK_INTERVAL:
                check_pump_status(client)
                last_pump_check = current_time

            # Restart trigger checks
            if current_time - last_trigger_check >= CHECK_INTERVAL:
                check_restart_triggers(client)
                last_trigger_check = current_time

            time.sleep(0.1)

    except KeyboardInterrupt:
        logger.info("Service stopping...")
        client.loop_stop()
    except Exception as e:
        logger.critical(f"Fatal error: {str(e)}")
        raise

if __name__ == "__main__":
    main()
```