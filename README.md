# IPTV Player Web Application

A modern web application for streaming IPTV content with user and admin interfaces.

## Features

### User Features
- Login with Xtream Credentials
- Live TV, Movies, and Series streaming
- EPG (Electronic Program Guide) integration
- Multi-screen support
- Favorites management
- Watch history and resume playback
- Subtitle and audio track selection
- Adult content filtering

### Admin Features
- User management
- Content management
- EPG integration settings
- Usage statistics and reporting
- System configuration

## Technology Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- Real-time: WebSocket
- UI Framework: Material-UI
- State Management: Redux Toolkit
- Video Player: Video.js

## Project Structure

```
iptv-player/
├── frontend/          # React frontend application
├── backend/           # Node.js backend server
└── docs/             # Project documentation
```

## Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd frontend
npm install
```

4. Configure environment variables
- Copy `.env.example` to `.env` in both frontend and backend directories
- Update the variables with your configuration

5. Start development servers
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.