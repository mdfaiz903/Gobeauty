# Go Beauty Ordering & Payment System

Backend-first assessment project for an e-commerce ordering and payment system. The backend uses Django REST Framework with PostgreSQL, Redis caching, JWT authentication, Swagger/OpenAPI documentation, and a domain app structure for accounts, catalog, orders, payments, and recommendations.

## Backend Setup

Run all backend commands from the `backend` directory.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Update `.env` with local secrets and service settings. Keep `.env` private; commit only `.env.example`.

## Local Checks

Use the project virtual environment, not global Python.

```bash
cd backend
source .venv/bin/activate
PYTHONDONTWRITEBYTECODE=1 python manage.py check
PYTHONDONTWRITEBYTECODE=1 python manage.py spectacular --file /tmp/gobeauty-schema.yml --validate
```

`PYTHONDONTWRITEBYTECODE=1` keeps Python from changing tracked bytecode files that already exist in this repository.

## Docker Services

The root Compose file starts the backend, PostgreSQL, and Redis.

```bash
docker compose up --build
```

Services:

- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/api/docs/`
- OpenAPI schema: `http://localhost:8000/api/schema/`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

Compose reads `backend/.env` and overrides container service hosts internally:

- `POSTGRES_HOST=db`
- `REDIS_URL=redis://redis:6379/1`

## Current Backend Structure

```text
backend/
  accounts/
  catalog/
  orders/
  payments/
  recommendations/
  config/
```

Upcoming implementation phases add the custom email user model, product/category hierarchy, DFS recommendations with Redis caching, order creation, payment provider strategies, and test coverage.
