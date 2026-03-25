# Dairy Management System

Single-service dairy system with:

- Node.js + Express backend
- React + Bootstrap frontend
- JSON data storage
- Python analytics helper
- Razorpay-ready live payment integration

The backend serves the built frontend, so production uses one web service and one public URL.

## Project structure

- `frontend/` React app
- `backend/` Express API
- `python/` analytics script
- `render.yaml` Render deployment config
- `railway.json` Railway deployment config
- `Procfile` generic Node deployment start file

## Local development

Install both apps:

```bash
npm run install:all
```

Run backend:

```bash
npm run dev:backend
```

Run frontend:

```bash
npm run dev:frontend
```

Local URLs:

- Frontend: `http://localhost:4173`
- Backend: `http://localhost:4000`

## Production build

Build frontend:

```bash
npm run build
```

Start production server:

```bash
npm start
```

Production URL:

- `http://localhost:4000`

## Permanent deployment

### Render

1. Push this project to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Select your repo.
4. Render will read `render.yaml`.
5. Add a persistent disk and set `STORE_PATH` to the mounted disk file path.
6. Deploy.

Render uses:

- Build command:
  `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
- Start command:
  `npm --prefix backend start`

Recommended environment:

- `PORT=4000`
- `STORE_PATH=/var/data/store.json`
- `RAZORPAY_KEY_ID=...`
- `RAZORPAY_KEY_SECRET=...`

### Railway

1. Push this project to GitHub.
2. In Railway, create a new project from the repo.
3. Railway will use `railway.json`.
4. Add a persistent volume or external storage path for `STORE_PATH`.
5. Deploy.

### Other Node hosts

Use:

- Build:
  `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
- Start:
  `npm --prefix backend start`

## Public access

For permanent public access, deploy the app to Render, Railway, or another Node hosting provider.

The backend already serves the built frontend, so you only need one deployed service.

Important:

- For permanent data retention, `STORE_PATH` must point to a persistent disk path.
- If you deploy without persistent storage, the app may reset data after redeploy/restart depending on the host.
- To activate real online payments on the live URL, add valid Razorpay live keys in the Render environment variables.

## Python analytics

```bash
cd python
python analytics.py
```

## Demo users

- `admin / admin123`
- `staff / staff123`

## Notes

- Data is stored in `backend/data/store.json`.
- JSON storage is fine for demo/testing. For real production, move to a database.
