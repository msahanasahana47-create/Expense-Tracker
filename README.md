# Expense Tracker

A personal expense tracker for recording and reviewing daily spending. The app includes a Next.js frontend and an Express API backed by MongoDB.

## Features

- Create, edit, and delete expense entries.
- Record the title, amount, category, payment method, date, and optional notes.
- Search entries and filter by category or date range.
- Review spending totals and category summaries.
- Fall back to sample in-memory data when the API is unavailable. Entries created in demo mode are not persisted.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, Mongoose
- Database: MongoDB

## Project Structure

```text
backend/   Express API and MongoDB models
frontend/  Next.js application
```

## Requirements

- Node.js 18 or newer
- MongoDB running locally or an accessible MongoDB connection string
- Corepack and pnpm for the frontend

## Run Locally

### 1. Start the backend

In a terminal:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Update `MONGO_URI` in `backend/.env` if MongoDB is not available at the default local address. The API listens on `http://localhost:5000` by default.

### 2. Start the frontend

In a second terminal:

```powershell
cd frontend
corepack pnpm install
corepack pnpm dev
```

Open `http://localhost:3000`. The frontend uses `http://localhost:5000` as its default API URL. Set `NEXT_PUBLIC_API_URL` before starting the frontend to use another API address.

### Production frontend

```powershell
cd frontend
corepack pnpm build
corepack pnpm start
```

## API Endpoints

All expense endpoints are mounted at `/expenses`:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | API health check |
| `GET` | `/expenses` | List expenses; supports `search`, `category`, `startDate`, and `endDate` query parameters |
| `POST` | `/expenses` | Create an expense |
| `GET` | `/expenses/summary` | Get spending totals and category summaries |
| `GET` | `/expenses/:id` | Get one expense |
| `PUT` | `/expenses/:id` | Update an expense |
| `DELETE` | `/expenses/:id` | Delete an expense |
