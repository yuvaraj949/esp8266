
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
