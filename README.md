# Dime! Investment Tracker

A modern, responsive personal-finance dashboard for tracking deposits into the Dime investment app. Built with React + Vite, Recharts, and Lucide icons.

## Features

- Dashboard with summary cards, year-end projection, and YoY comparison
- Annual investment bar chart with click-through monthly drilldown
- Transaction CRUD with search, filtering (year / category), and sorting
- CSV export / import
- Bilingual UI (English / Thai), persisted across sessions
- Light & dark mode
- Data persists locally via `localStorage` (see `src/storage.js`)

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
.
├── index.html
├── src
│   ├── main.jsx          # React entry point
│   ├── index.css         # minimal global reset
│   ├── storage.js         # localStorage persistence adapter
│   └── DimeTracker.jsx    # the entire app (dashboard, transactions, settings, etc.)
├── package.json
└── vite.config.js
```

## Notes

- All data is stored locally in the browser via `localStorage`. Clearing site
  data / browser storage will reset the tracker back to its seeded sample
  data.
- No backend or external API is required — this is a fully static, client-side app.
