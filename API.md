# GramMart AI API

Base URL: `/api`

## Authentication

### `POST /auth/register`

Creates a shop and the first shop owner.

```json
{
  "shopName": "Sri Lakshmi Stores",
  "ownerName": "Ravi",
  "phone": "9876543210",
  "password": "change-this-password",
  "preferredLanguage": "TAMIL",
  "address": "Main Road",
  "village": "Pudur",
  "district": "Madurai",
  "state": "Tamil Nadu"
}
```

### `POST /auth/login`

```json
{
  "phone": "9876543210",
  "password": "change-this-password"
}
```

## Customers

### `POST /customers`

Creates a credit customer.

### `GET /customers?query=kumar`

Searches customers within the authenticated shop.

## Products

### `GET /products?query=arisi`

Searches enabled master and shop products by name or alias.

## Ledger

### `POST /ledger/credit`

Adds purchase credit and updates running outstanding balance.

### `POST /ledger/payment`

Receives payment and updates running outstanding balance.

## Voice

### `POST /voice/commands`

Converts a spoken transcript into a structured action.

```json
{
  "transcript": "Kumar paid 500 rupees",
  "language": "ENGLISH"
}
```

Response:

```json
{
  "intent": "RECEIVE_PAYMENT",
  "customerName": "kumar",
  "productAlias": null,
  "amount": 500,
  "quantity": null,
  "slots": {
    "confidence": 0.82
  }
}
```

