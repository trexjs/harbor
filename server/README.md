# Kong Clone - API Gateway MVP

A production-ready API Gateway inspired by Kong, built with MERN stack.

## Features (P0 - V0 Launch)

### Core Features
- ✅ Request Routing & Reverse Proxy
- ✅ Authentication (API Keys, JWT)
- ✅ Rate Limiting
- ✅ IP Blocking/Whitelisting
- ✅ Geo-Blocking
- ✅ Bot Detection
- ✅ Request/Response Transformation
- ✅ Request Termination
- ✅ Load Balancing
- ✅ Request Correlation ID
- ✅ File Logging with Rotation
- ✅ Metrics & Health Checks

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache**: Redis
- **Auth**: JWT
- **Logging**: Winston + Morgan

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB running
- Redis running (optional for MVP but recommended)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd kong-clone
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update `.env` with your configuration

5. Start the gateway
```bash
# Development
npm run dev

# Production
npm start
```

## Project Structure

```
kong-clone/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Application entry
├── logs/                # Application logs
├── tests/               # Test files
└── package.json
```

## API Endpoints

### Gateway API (Port: 3000)
- `GET /health` - Health check
- `GET /metrics` - Metrics data
- `PROXY /*` - Forward to backend services

### Admin API (Port: 3001)
- Routes, IP Rules, Geo Rules, Bot Detection, Transformations, etc.

## Documentation

See `MVP_Documentation.md` for detailed feature documentation.

## License

MIT
