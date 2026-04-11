# KnowBase

Quick start from the repo root on Windows PowerShell.

## 1. Start PostgreSQL

```powershell
cd backend
docker-compose up -d
cd ..
```

## 2. Start Django backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Backend runs at `http://localhost:8000`.

## 3. Start React frontend

Open a new terminal in the repo root:

```powershell
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Daily workflow

Use 3 terminals:

1. Terminal 1

```powershell
cd backend
docker-compose up -d
```

2. Terminal 2

```powershell
cd backend
.\venv\Scripts\python.exe manage.py runserver
```

3. Terminal 3

```powershell
cd frontend
npm run dev
```

## Useful commands

Reindex all pages:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py reindex_all_pages
```

Build frontend:

```powershell
cd frontend
npm run build
```

Run backend tests:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py test
```

## Troubleshooting

- If Docker/PostgreSQL is not running, the backend will fail to connect to `localhost:5432`.
- If PowerShell blocks venv activation, run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```

- If the frontend shows CORS errors, confirm Django is running on `http://localhost:8000`.
