# KindKart

KindKart connects people and organizations with surplus food to NGOs that can collect and distribute it. Donors can publish and manage donations, while NGO users can find available donations and coordinate pickups.

## Features

- Donor and NGO account flows
- Create and manage food donation listings
- Browse available donations and manage pickup requests
- Donation and pickup history
- User profiles and location details
- OTP delivery support through email or SMS providers

## Tech stack

- Frontend: React, TypeScript, and Vite
- Backend: Node.js and Express
- Database: MySQL

## Requirements

- Node.js (LTS recommended) and npm
- MySQL server

## Getting started

### 1. Install dependencies

From the repository root:

```bash
npm install
cd backend && npm install
```

### 2. Configure the backend

Create `backend/.env` and set the connection details for your local MySQL database:

```dotenv
PORT=8000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=kindkart
JWT_SECRET=replace_with_a_long_random_secret
CORS_ORIGIN=http://localhost:5173
```

Create the `kindkart` database in MySQL before starting the backend. The application also supports optional email and SMS OTP delivery configuration:

```dotenv
SMTP_SERVICE=
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

Set only the provider settings you use. Keep real credentials in local environment files and never commit them. SQL migration scripts, when needed, are in `backend/sql/`.

### 3. Configure the frontend (optional)

By default, the frontend calls `http://localhost:8000/api`. To override that or configure Google Maps, create a root `.env` file:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=
```

### 4. Run the app

Open two terminals from the repository root.

Start the backend:

```bash
cd backend
npm start
```

Start the frontend in the other terminal:

```bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The backend health endpoint is available at `http://localhost:8000/health`.

## Production build

Build the frontend from the repository root:

```bash
npm run build
```

The generated frontend files are placed in `dist/`. Configure `VITE_API_BASE_URL` for the deployed backend when building for production.

## Project layout

```text
src/                 React application and UI components
  components/        Donor, NGO, and shared interface components
  lib/               API and location helpers
  styles/            Global styles
backend/             Express API
  config/            Database configuration
  controllers/       Request handlers
  middleware/        Authentication middleware
  models/            Database models
  routes/            API routes
  services/          OTP delivery integrations
  sql/               Database migration scripts
```

## Security

Do not commit `.env` files or publish credentials. If a secret has been pushed to a public repository, rotate it with the relevant provider; deleting it in a later commit does not remove it from Git history.
