# Payment Flow Diagrams

## Stripe Checkout And Webhook Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as Customer
    participant F as React SPA
    participant API as DRF API
    participant PF as PaymentProviderFactory
    participant SS as StripePaymentStrategy
    participant DB as PostgreSQL
    participant ST as Stripe

    U->>F: Select Stripe and place order
    F->>API: POST /api/orders/
    API->>DB: Create pending order + order item snapshots
    API-->>F: Order response
    F->>API: POST /api/payments/initiate/
    API->>PF: create("stripe")
    PF-->>API: StripePaymentStrategy
    API->>SS: initiate_payment(order, amount)
    SS-->>API: transaction_id + redirect_url
    API->>DB: Upsert pending payment
    API-->>F: Payment session
    F-->>U: Open Stripe checkout URL
    ST->>API: POST /api/payments/stripe/webhook/
    API->>API: Validate Stripe-Signature when configured
    API->>DB: Lock payment, order, products
    API->>DB: Mark payment succeeded + order paid + reduce stock
    API-->>ST: Webhook received
```

## bKash Sandbox Execute And Query Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as Customer
    participant F as React SPA
    participant API as DRF API
    participant PF as PaymentProviderFactory
    participant BS as BkashPaymentStrategy
    participant DB as PostgreSQL
    participant BK as bKash Sandbox/API

    U->>F: Select bKash and place order
    F->>API: POST /api/orders/
    API->>DB: Create pending order + order item snapshots
    API-->>F: Order response
    F->>API: POST /api/payments/initiate/
    API->>PF: create("bkash")
    PF-->>API: BkashPaymentStrategy
    API->>BS: initiate_payment(order, amount)
    BS-->>API: paymentID + redirect_url
    API->>DB: Upsert pending payment
    API-->>F: Payment session
    F-->>U: Show bKash transaction details
    BK->>API: GET/POST /api/payments/bkash/execute/
    API->>BS: execute_payment(paymentID)
    BS-->>API: succeeded result
    API->>DB: Lock payment, order, products
    API->>DB: Mark payment succeeded + order paid + reduce stock
    API-->>BK: Execute response
    F->>API: POST /api/payments/bkash/query/
    API->>BS: query_payment(paymentID)
    BS-->>API: latest status
    API-->>F: Payment status
```

## Security And Consistency Notes

- Frontend never sends payable totals. The backend uses `Order.total_amount`.
- Provider-specific behavior is isolated behind `PaymentProviderStrategy`.
- `PaymentProviderFactory` chooses Stripe or bKash without leaking provider logic into views.
- Payment success uses database transactions and row locks.
- Duplicate success callbacks are idempotent and do not reduce stock twice.
- Stripe webhook signature validation is enforced when `STRIPE_WEBHOOK_SECRET` is configured.
- bKash query requires authentication and payment ownership, except staff users.
