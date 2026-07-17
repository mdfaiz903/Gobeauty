# OpenAPI And Swagger

The backend exposes generated OpenAPI documentation through drf-spectacular.

## Local URLs

- Swagger UI: `http://127.0.0.1:8000/api/docs/`
- OpenAPI schema: `http://127.0.0.1:8000/api/schema/`

## Main API Groups

- Auth: registration, JWT login, refresh, and current-user profile.
- Catalog: categories, public products, product detail, and admin product management.
- Recommendations: DFS-based related products using the cached category tree.
- Orders: authenticated order creation, server-side totals, and order history.
- Payments: strategy-based payment initiation, Stripe webhook, and bKash execute/query callbacks.

## Authentication In Swagger

1. Login through `POST /api/auth/login/`.
2. Copy the returned access token.
3. Click **Authorize** in Swagger UI.
4. Enter `Bearer <access-token>`.

Public catalog endpoints work without a token. Orders, current user, payment initiation, and bKash query require JWT authentication.
