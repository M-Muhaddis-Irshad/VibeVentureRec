# Vibeventure — Client

React + Vite + Tailwind frontend for the Vibeventure travel journal.

## Local setup

```bash
cd client
npm install
cp .env.example .env   # set VITE_API_URL if the API isn't on localhost:5000
npm run dev
```

App runs on `http://localhost:5173`.

## Pages

- `/` — Journal home: search + paginated post grid
- `/posts/:id` — Full entry with edit/delete actions
- `/create` — New entry form (with image upload)
- `/edit/:id` — Edit an existing entry

## Build

```bash
npm run build
npm run preview   # serve the production build locally
```
