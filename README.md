# New Novel Backend

A TypeScript + Express.js REST API backend for the New Novel application.

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

### Development

Run the development server with hot-reload:
```bash
npm run dev
```

The server will start at `http://localhost:5000`

### Build & Production

Build the TypeScript code:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

### Code Quality

Lint the code:
```bash
npm run lint
```

Format the code:
```bash
npm run format
```

## Project Structure

```
src/
├── index.ts           # Application entry point
├── config/            # Configuration files
├── controllers/       # Route handlers
├── routes/            # Route definitions
├── services/          # Business logic
├── models/            # Data models/types
└── utils/             # Utility functions
```

## API Documentation

### Health Check

- **Endpoint:** `GET /api/health`
- **Response:** `{ "status": "ok" }`

## License

ISC
