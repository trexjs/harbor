# API Gateway Admin UI

Modern admin interface for managing API Gateway built with React, TypeScript, and Styled Components.

## Features

- ✅ Route Management (CRUD)
- ✅ Consumer Management
- ✅ API Key Management
- ✅ Responsive Design
- ✅ Real-time Updates
- ✅ Modern UI with Styled Components

## Tech Stack

- **React 18**
- **TypeScript**
- **Styled Components**
- **React Router v6**
- **Axios**
- **Context API**
- **Vite**

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on port 3001

### Installation

1. Navigate to the admin-ui directory
```bash
cd admin-ui
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Configure environment variables (optional)
```env
VITE_API_URL=http://localhost:3001
```

5. Start development server
```bash
npm run dev
```

The admin UI will be available at `http://localhost:3002`

## Project Structure

```
admin-ui/
├── src/
│   ├── api/              # API client and functions
│   ├── components/       # Reusable components
│   ├── context/          # Context API
│   ├── pages/            # Page components
│   ├── styles/           # Global styles
│   ├── theme.ts          # Theme configuration
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Pages

- **Dashboard** (`/`) - Overview and statistics
- **Routes** (`/routes`) - Manage API routes
- **Consumers** (`/consumers`) - Manage consumers
- **API Keys** (`/api-keys`) - Manage API keys

## Development

The UI uses Vite for fast development and hot module replacement. All API calls are proxied through the Vite dev server to the backend API.
