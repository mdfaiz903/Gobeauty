# Postman Collection

Import `docs/postman_collection.json` into Postman to exercise the main backend assessment flow.

## Variables

- `base_url`: defaults to `http://127.0.0.1:8000/api`
- `access_token`: auto-filled by the Login request
- `refresh_token`: auto-filled by the Login request
- `product_id`: auto-filled by List Products when products exist
- `order_id`: auto-filled by Create Order
- `payment_transaction_id`: auto-filled by payment initiation

## Suggested Run Order

1. Auth / Register Customer
2. Auth / Login
3. Catalog / List Products
4. Orders / Create Order
5. Payments / Initiate bKash Payment
6. Payments / bKash Query Payment
7. Payments / bKash Execute Payment
8. Orders / Order Detail

Stripe webhook simulation works when `STRIPE_WEBHOOK_SECRET` is empty for local development. When a webhook secret is configured, send a valid `Stripe-Signature` header from Stripe CLI or a signed test request.
