# System Architecture

```mermaid
flowchart LR
    user[Customer / Admin] --> frontend[Vite React SPA]
    frontend -->|JSON over HTTPS| api[Django REST Framework API]

    api --> auth[Accounts App<br/>Custom email user + JWT]
    api --> catalog[Catalog App<br/>Categories + Products]
    api --> orders[Orders App<br/>Order + price snapshots]
    api --> payments[Payments App<br/>Strategy provider factory]
    api --> recommendations[Recommendations App<br/>DFS category traversal]

    auth --> postgres[(PostgreSQL)]
    catalog --> postgres
    orders --> postgres
    payments --> postgres

    recommendations --> redis[(Redis Cache)]
    catalog -->|invalidate category tree| redis
    redis -->|cached category tree| recommendations

    payments --> stripe[Stripe Strategy]
    payments --> bkash[bKash Strategy]
    stripe -->|checkout session + webhook| stripeProvider[Stripe API / CLI]
    bkash -->|create / execute / query| bkashProvider[bKash Sandbox / API]

    stripeProvider -->|webhook| api
    bkashProvider -->|execute callback| api

    payments -->|transaction + row locks| stock[Stock Finalization<br/>Payment + Order + Product locks]
    stock --> postgres
```

## Runtime Flow

1. React calls DRF endpoints using JSON and JWT bearer tokens.
2. DRF separates responsibilities by domain apps: accounts, catalog, orders, payments, and recommendations.
3. PostgreSQL stores source-of-truth users, products, orders, order items, and payments.
4. Redis stores the active category tree used by DFS recommendations.
5. Payment initiation delegates to a provider strategy through the payment factory.
6. Successful Stripe webhook or bKash execute callback finalizes payment transactionally and reduces stock exactly once.

## Production Notes

- Secrets and infrastructure settings are loaded from environment variables.
- PostgreSQL is the final database target.
- Redis is used for category-tree caching.
- Payment success uses database transactions and row locks to protect stock consistency.
- Swagger/OpenAPI and Postman docs are included for reviewer testing.
