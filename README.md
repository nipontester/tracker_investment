# Dime! Investment Tracker

A modern, responsive personal-finance dashboard for tracking deposits into the Dime investment app. Built with React + Vite, Supabase (auth + database), Recharts, and Lucide icons.

## Features

- Email/password login -- each account only ever sees its own data
- Dashboard with summary cards, year-end projection, monthly pace, and YoY comparison
- Annual investment bar chart with click-through monthly drilldown
- Transaction CRUD with search, filtering (year / category), and sorting
- CSV export / import
- Bilingual UI (English / Thai), persisted per account
- Light & dark mode, persisted per account
- Data stored in Supabase Postgres, scoped per user via Row Level Security

## One-time Supabase setup

This app needs a (free) Supabase project to handle login and store data.

1. Go to [supabase.com](https://supabase.com) and create a free account, then create a new project. Wait a minute or two for it to finish provisioning.
2. In your new project, go to **Project Settings -> API**. Copy the **Project URL** and the **anon public** key.
3. In this folder, copy `.env.example` to a new file named `.env`, and paste in your URL and key:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. In your Supabase project, go to the **SQL Editor**, paste in the entire contents of `supabase-schema.sql` (included in this folder), and run it. This creates the `deposits` and `user_settings` tables along with Row Level Security policies, so each signed-in user can only ever see or edit their own rows -- enforced at the database level, not just in the app. If you already ran an older version of the schema, run this file again to add the target-year settings (`goal_years`, `goal_started_at`) safely.
5. In **Authentication -> URL Configuration**, set your production **Site URL** (for example `https://trackerinvestment.netlify.app`) and add it to **Redirect URLs**. This is required for forgot-password reset links to return users to the app.
6. (Optional but recommended for testing) In **Authentication -> Providers -> Email**, you can turn off "Confirm email" while developing, so new signups can log in immediately without clicking a confirmation link. Turn it back on before sharing the app publicly.

That's it -- the app talks to Supabase directly from the browser using the anon key, which is safe to expose publicly (Row Level Security is what actually protects the data, not keeping the key secret).

## Getting started locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`). You'll see a login screen -- create an account with any email/password (6+ characters) to get started. Every new account starts with zero deposits.

### Build for production

```bash
npm run build
npm run preview
```

## Deploying (e.g. to Netlify)

1. Push this project to GitHub as usual.
2. In Netlify, connect the repo. Build command: `npm run build`. Publish directory: `dist`.
3. In Netlify's site settings, go to **Environment variables** and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values from your `.env` file. (Netlify never reads your local `.env` file -- you must set these in its dashboard.) After adding or changing these values, trigger a new deploy because Vite reads `VITE_*` variables during the build.
4. Deploy. Anyone who signs up on the live site gets their own private account and data, accessible from any device they log in on.
5. For password reset emails, confirm your live Netlify URL is listed in Supabase **Authentication -> URL Configuration -> Redirect URLs**. After changing Supabase or Netlify settings, redeploy if you changed any `VITE_*` environment variables.

## Project structure

```
.
├── index.html
├── supabase-schema.sql    # run once in Supabase's SQL editor
├── .env.example            # copy to .env and fill in your project values
├── src
│   ├── main.jsx             # React entry point
│   ├── index.css            # minimal global reset
│   ├── App.jsx               # auth gate: shows Auth or DimeTracker
│   ├── Auth.jsx               # login / signup screen
│   ├── useAuth.js             # tracks the current Supabase session
│   ├── supabaseClient.js      # Supabase client setup (reads .env)
│   ├── db.js                   # all Supabase queries (deposits, settings)
│   └── DimeTracker.jsx          # the main app (dashboard, transactions, settings, etc.)
├── package.json
└── vite.config.js
```

## Notes

- Each account's data is completely isolated from every other account, enforced by Postgres Row Level Security -- not just hidden in the UI.
- Monthly pace uses `user_settings.goal`, `goal_years`, and `goal_started_at`. Changing the goal amount or target years starts a new target timeline from today.
- Forgot-password reset emails are handled by Supabase Auth. The production URL must be allowed in Supabase redirect settings.
- The anon Supabase key is meant to be public (it ships in the browser bundle) -- never put your Supabase **service role** key in this project.
