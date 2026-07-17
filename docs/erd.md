# Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    CATEGORY ||--o{ CATEGORY : contains
    CATEGORY ||--o{ PRODUCT : groups
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : snapshot_from
    ORDER ||--o{ PAYMENT : paid_by

    USER {
        bigint id PK
        string email UK
        string first_name
        string last_name
        string role
        boolean is_active
        boolean is_staff
        datetime date_joined
    }

    CATEGORY {
        bigint id PK
        string name
        string slug UK
        bigint parent_id FK
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    PRODUCT {
        bigint id PK
        bigint category_id FK
        string name
        string sku UK
        text description
        string image
        decimal price
        integer stock
        string status
        datetime created_at
        datetime updated_at
    }

    ORDER {
        bigint id PK
        bigint user_id FK
        decimal total_amount
        string status
        datetime created_at
        datetime updated_at
    }

    ORDER_ITEM {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        integer quantity
        decimal price
        decimal subtotal
        datetime created_at
        datetime updated_at
    }

    PAYMENT {
        bigint id PK
        bigint order_id FK
        string provider
        decimal amount
        string transaction_id
        string status
        json raw_response
        datetime created_at
        datetime updated_at
    }
```

## Important Constraints

- `USER.email` is unique and is the login identifier.
- `CATEGORY.slug` is unique.
- `CATEGORY.parent_id + CATEGORY.name` is unique to prevent duplicate sibling category names.
- `PRODUCT.sku` is unique and indexed.
- `ORDER_ITEM.price` and `ORDER_ITEM.subtotal` are immutable order-time snapshots.
- `PAYMENT.provider + PAYMENT.transaction_id` is unique when `transaction_id` is not blank.

## Stock And Payment Consistency

Order creation validates product status and available stock, but stock is reduced only after successful payment confirmation. Payment success locks the payment, order, and products inside one database transaction so repeated callbacks do not reduce stock twice.
