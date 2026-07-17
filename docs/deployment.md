# Environment And Deployment Guide

## Local Backend With Docker

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with local values. For Docker Compose, keep the normal local values in the file; Compose overrides container-only host settings:

- `POSTGRES_HOST=db`
- `REDIS_URL=redis://redis:6379/1`

Start services from the repository root:

```bash
docker compose up --build
```

Useful local URLs:

- Backend API: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/api/docs/`
- OpenAPI schema: `http://127.0.0.1:8000/api/schema/`
- PostgreSQL: `127.0.0.1:5432`
- Redis: `127.0.0.1:6379`

Run migrations and seed data:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_catalog
```

Run backend verification:

```bash
docker compose exec backend python manage.py check
docker compose exec backend python manage.py test
docker compose exec backend python manage.py spectacular --validate --file /tmp/gobeauty-openapi.yaml
```

## Local Backend Without Docker

Start PostgreSQL and Redis first, then run:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_catalog
python manage.py runserver
```

Use `PYTHONDONTWRITEBYTECODE=1` if you want to prevent Python from touching local bytecode files during checks:

```bash
PYTHONDONTWRITEBYTECODE=1 python manage.py test
```

## Required Backend Environment Variables

Core:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `DJANGO_MEDIA_URL`

Database:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_CONN_MAX_AGE`

Cache:

- `REDIS_URL`

JWT:

- `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`
- `JWT_REFRESH_TOKEN_LIFETIME_DAYS`

Payments:

- `STRIPE_MODE`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `BKASH_MODE`
- `BKASH_APP_KEY`
- `BKASH_APP_SECRET`
- `BKASH_USERNAME`
- `BKASH_PASSWORD`
- `BKASH_BASE_URL`

Never commit `backend/.env`.

## Stripe Webhook Testing With ngrok

Start the backend:

```bash
docker compose up backend db redis
```

Expose the backend:

```bash
ngrok http 8000
```

Use the ngrok HTTPS URL as the Stripe webhook endpoint:

```text
https://<ngrok-domain>/api/payments/stripe/webhook/
```

Set `STRIPE_WEBHOOK_SECRET` in `backend/.env` to the webhook signing secret from Stripe CLI or the Stripe dashboard. Restart the backend after changing it.

For Stripe CLI testing:

```bash
stripe listen --forward-to https://<ngrok-domain>/api/payments/stripe/webhook/
```

Then trigger a checkout event from Stripe CLI or complete a test checkout session. The backend validates the `Stripe-Signature` header when `STRIPE_WEBHOOK_SECRET` is configured.

## bKash Sandbox Testing

The bKash strategy supports sandbox-first behavior. After initiating a bKash payment, use the returned `transaction_id`/`paymentID`:

```bash
curl -X POST http://127.0.0.1:8000/api/payments/bkash/query/ \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"paymentID":"<payment-id>"}'
```

Execute sandbox success:

```bash
curl -X POST http://127.0.0.1:8000/api/payments/bkash/execute/ \
  -H "Content-Type: application/json" \
  -d '{"paymentID":"<payment-id>"}'
```

Successful execution marks the payment succeeded, marks the order paid, and reduces stock inside one database transaction.

## Frontend Local Setup

Create the frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

For local backend:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Build verification:

```bash
npm run build
```

## Frontend Deployment To Vercel

Use the `frontend` directory as the Vercel project root.

Vercel settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Set the frontend environment variable in Vercel:

```text
VITE_API_BASE_URL=https://<backend-domain>/api
```

Update backend CORS and allowed hosts:

```text
DJANGO_ALLOWED_HOSTS=<backend-domain>,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://<vercel-domain>,http://localhost:5173,http://127.0.0.1:5173
```

Redeploy/restart the backend after changing backend environment variables.

## Backend Production Notes

For a production host, use:

- PostgreSQL managed database or hosted PostgreSQL container.
- Redis managed cache or hosted Redis container.
- `DJANGO_DEBUG=False`.
- A strong `DJANGO_SECRET_KEY`.
- HTTPS-only public URL.
- Real Stripe and bKash sandbox/live credentials.
- Static/media serving through the host platform or object storage.

Run before release:

```bash
python manage.py check --deploy
python manage.py migrate
python manage.py spectacular --validate --file openapi.yaml
python manage.py test
```

## Submission Checklist

- GitHub repository URL.
- Swagger UI URL or OpenAPI schema file.
- Postman collection: `docs/postman_collection.json`.
- Architecture diagram: `docs/architecture.md`.
- ERD: `docs/erd.md`.
- Payment flow diagrams: `docs/payment-flows.md`.
- Deployment guide: `docs/deployment.md`.
