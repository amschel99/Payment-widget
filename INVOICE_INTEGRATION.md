# Invoice Payment Integration Guide

## Overview

Invoices support two payment methods:
- **Fiat (Mobile Money)** — via the onramp flow (Pretium)
- **Crypto (On-chain)** — direct ERC20 token transfer

Both methods automatically update the invoice status to `COMPLETED`, record payment details, and notify the invoice creator.

---

## Architecture

```
┌─────────────┐     creates invoice      ┌─────────────┐
│  Your App   │ ──────────────────────→   │   Backend   │
│  (merchant) │     POST /invoices/       │  (rift-api) │
└─────────────┘                           └──────┬──────┘
                                                 │
                                          returns short URL
                                   https://payment.riftfi.xyz/invoice/xK4m
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │   Payment    │
                              payer opens │   Widget     │  (pay.riftfi.xyz)
                              invoice URL │  (separate   │
                                          │   frontend)  │
                                          └──────┬───────┘
                                                 │
                              ┌──────────────────┼──────────────────┐
                              │                                     │
                       Fiat (M-Pesa)                         Crypto (on-chain)
                              │                                     │
                              ▼                                     ▼
                    GET /pay/open-ramp                    User sends ERC20
                    ?invoice_id=<id>                      transfer on-chain
                              │                                     │
                              ▼                                     ▼
                    Pretium STK push                      POST /invoices/pay
                    → user confirms                      {invoiceId, txHash, chain}
                              │                                     │
                              ▼                                     ▼
                    Pretium webhook                       Backend verifies
                    → backend receives                   on-chain Transfer event
                              │                                     │
                              └──────────────────┬──────────────────┘
                                                 │
                                                 ▼
                                      Invoice → COMPLETED
                                      Creator notified
                                      (in-app + email + SMS)
                                                 │
                                                 ▼
                                      GET /invoices/?status=COMPLETED
                                      (merchant queries settlement)
```

---

## 1. Creating an Invoice

**Endpoint:** `POST /invoices/`

**Headers:**
- `x-api-key` — project API key
- `Authorization: Bearer <jwt>` — authenticated user

**Body:**
```json
{
  "description": "Order #1234",
  "chain": "BASE",
  "token": "USDC",
  "amount": 25.00,
  "recipientEmail": "customer@example.com",
  "recipientPhone": "+254700000000",
  "originUrl": "https://yourapp.com",
  "orderId": "order-1234"
}
```

- `recipientEmail` and `recipientPhone` are optional — used for sending the invoice link and payment notifications.
- `originUrl` and `orderId` are optional — for your own tracking.

**Response (201):**
```json
{
  "id": "a1b2c3d4-...",
  "description": "Order #1234",
  "chain": "BASE",
  "token": "USDC",
  "amount": 25.0,
  "status": "PENDING",
  "url": "https://payment.riftfi.xyz/invoice/xK4m",
  "recipientAddress": "0xabc...",
  "createdAt": "2026-02-26T10:00:00.000Z",
  ...
}
```

The `url` is a short link that redirects the payer to the payment widget.

---

## 2. Invoice URL (Base64 Payload)

When the payer opens the invoice URL, they are redirected to:

```
https://pay.riftfi.xyz?invoice=<base64>
```

The base64 payload decodes to:

```json
{
  "invoiceId": "a1b2c3d4-...",
  "chain": "BASE",
  "token": "USDC",
  "amount": 25.0,
  "address": "0xabc...",
  "userId": "user-uuid",
  "exchangeRate": 130.11,
  "projectId": "project-uuid",
  "originUrl": "https://yourapp.com",
  "orderId": "order-1234"
}
```

The widget should decode this and extract:
- `invoiceId` — needed for both fiat and crypto payment flows
- `address` — the recipient wallet address (for crypto payments)
- `chain` / `token` / `amount` — what to pay

---

## 3. Paying with Fiat (Mobile Money)

When the payer chooses to pay with mobile money, the widget calls the onramp endpoint with `invoice_id` appended:

**Endpoint:** `GET /pay/open-ramp`

**Query params:**
```
/pay/open-ramp?shortcode=0797168636
  &amount=25.0
  &chain=BASE
  &asset=USDC
  &mobile_network=Safaricom
  &country_code=KES
  &address=0xabc...
  &user_id=<userId>
  &project_id=<projectId>
  &invoice_id=<invoiceId>      <-- LINKS PAYMENT TO INVOICE
```

**What happens behind the scenes:**
1. Backend creates an `OnrampOrder` linked to the invoice via `invoice_id`
2. Pretium sends a mobile money STK push to the payer's phone
3. Payer confirms payment on their phone
4. Pretium sends a webhook to the backend when payment completes
5. Backend updates the `OnrampOrder` status to `completed`
6. Backend detects the linked `invoice_id`, marks the Invoice as `COMPLETED`
7. Invoice creator is notified (in-app + email + SMS)

**No additional API calls needed from the widget** — the webhook handles everything automatically.

---

## 4. Paying with Crypto (On-chain Transfer)

When the payer chooses to pay with crypto:

### Step 1: Payer sends tokens on-chain

The widget should prompt the payer to send an ERC20 transfer:
- **To:** `address` from the invoice payload (the recipient's wallet)
- **Token:** The token contract for the invoice's `token` on the invoice's `chain`
- **Amount:** >= `amount` from the invoice

### Step 2: Submit transaction hash for verification

Once the transaction is confirmed on-chain, call:

**Endpoint:** `POST /invoices/pay`

**Headers:**
- `x-api-key` — project API key

**Body:**
```json
{
  "invoiceId": "a1b2c3d4-...",
  "transactionHash": "0xdef456...",
  "chain": "BASE"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invoice payment verified"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "No matching USDC Transfer found to recipient (0xabc...). Found 2 Transfer events, but none matched the invoice requirements."
}
```

**What happens behind the scenes:**
1. Backend connects to the chain's RPC (with retry logic — up to 3 attempts)
2. Fetches the transaction and its receipt
3. Parses all ERC20 `Transfer(address,address,uint256)` event logs
4. Verifies: correct token contract, correct recipient address, amount >= invoice amount
5. If valid: marks Invoice as `COMPLETED`, stores `transactionHash` and `payerAddress`
6. Invoice creator is notified (in-app + email + SMS)

### Possible errors:
| Error | Meaning |
|-------|---------|
| `Invoice not found` | Invalid `invoiceId` |
| `Invoice is already paid` | Invoice status is already `COMPLETED` |
| `Invoice has no recipient address` | Invoice was created before this feature (no `recipientAddress`) |
| `Unsupported chain: X` | Chain not in config |
| `Token X not found on chain Y` | Token/chain mismatch |
| `Transaction not found...` | Tx hash invalid or not yet confirmed — retry after a few seconds |
| `Transaction failed on-chain` | The transaction reverted |
| `No matching Transfer found...` | Token, recipient, or amount didn't match the invoice |

---

## 5. Querying Invoices & Checking Settlement

The invoice creator (merchant) can query their invoices to check which ones have been paid.

**Endpoint:** `GET /invoices/`

**Headers:**
- `x-api-key` — project API key
- `Authorization: Bearer <jwt>` — authenticated user (invoice creator)

**Query params (all optional):**
| Param | Values | Default | Description |
|-------|--------|---------|-------------|
| `status` | `PENDING`, `COMPLETED`, `EXPIRED` | all | Filter by payment status |
| `sortBy` | `createdAt`, `updatedAt`, `paidAt` | `createdAt` | Sort field |
| `sortOrder` | `asc`, `desc` | `desc` | Sort direction |
| `startDate` | ISO date string | — | Filter invoices created after this date |
| `endDate` | ISO date string | — | Filter invoices created before this date |

### Example: Get all paid invoices

```
GET /invoices/?status=COMPLETED&sortBy=paidAt&sortOrder=desc
```

### Example: Get unpaid invoices from this week

```
GET /invoices/?status=PENDING&startDate=2026-02-20T00:00:00Z
```

### Example: Get all invoices in a date range

```
GET /invoices/?startDate=2026-02-01T00:00:00Z&endDate=2026-02-28T23:59:59Z
```

**Response:**
```json
[
  {
    "id": "a1b2c3d4-...",
    "description": "Order #1234",
    "amount": 25.0,
    "token": "USDC",
    "chain": "BASE",
    "status": "COMPLETED",
    "paymentMethod": "crypto",
    "transactionHash": "0xdef456...",
    "payerAddress": "0x789...",
    "recipientAddress": "0xabc...",
    "paidAt": "2026-02-26T10:05:00.000Z",
    "createdAt": "2026-02-26T10:00:00.000Z",
    "updatedAt": "2026-02-26T10:05:00.000Z",
    "url": "https://payment.riftfi.xyz/invoice/xK4m",
    "recipientEmail": "customer@example.com",
    "recipientPhone": "+254700000000"
  },
  {
    "id": "e5f6g7h8-...",
    "description": "Subscription Feb",
    "amount": 10.0,
    "token": "USDC",
    "chain": "BASE",
    "status": "COMPLETED",
    "paymentMethod": "fiat",
    "transactionHash": null,
    "payerAddress": null,
    "recipientAddress": "0xabc...",
    "paidAt": "2026-02-25T14:30:00.000Z",
    "createdAt": "2026-02-25T14:00:00.000Z",
    "updatedAt": "2026-02-25T14:30:00.000Z",
    "url": "https://payment.riftfi.xyz/invoice/mN7p",
    "recipientEmail": null,
    "recipientPhone": null
  }
]
```

### How to tell if an invoice was settled:

| Check | How |
|-------|-----|
| Is it paid? | `status === "COMPLETED"` |
| When was it paid? | `paidAt` timestamp |
| How was it paid? | `paymentMethod` — `"fiat"` or `"crypto"` |
| Crypto tx hash? | `transactionHash` (only for crypto payments) |
| Who paid? | `payerAddress` (only for crypto — the wallet that sent tokens) |
| Still waiting? | `status === "PENDING"` |

---

## 6. Invoice Status Flow

```
PENDING ──→ COMPLETED   (paid via fiat or crypto)
   │
   └──→ EXPIRED         (if expiresAt is set and passed)
```

### Fields set on payment:
| Field | Fiat | Crypto |
|-------|------|--------|
| `status` | `COMPLETED` | `COMPLETED` |
| `paidAt` | timestamp | timestamp |
| `paymentMethod` | `"fiat"` | `"crypto"` |
| `transactionHash` | — | `"0x..."` |
| `payerAddress` | — | `"0x..."` |

---

## 7. Widget Integration Summary

The payment widget (`pay.riftfi.xyz`) is a **separate frontend app**. The backend provides all the APIs — the widget just needs to:

### For fiat payments:
1. Decode the base64 `?invoice=` query param
2. Extract `invoiceId` from the decoded data
3. When user pays with mobile money, append `&invoice_id=<invoiceId>` to the `/pay/open-ramp` call
4. Everything else is automatic (webhook updates invoice, sends notifications)

### For crypto payments:
1. Decode the base64 `?invoice=` query param
2. Extract `invoiceId`, `address`, `chain`, `token`, `amount`
3. Prompt user to send ERC20 transfer to `address`
4. After tx confirms, call `POST /invoices/pay` with `{ invoiceId, transactionHash, chain }`
5. Show success/error to the payer

### The widget does NOT need to:
- Update invoice status directly — the backend handles it
- Send notifications — the backend handles it
- Verify on-chain transactions — the backend handles it

---

## 8. Supported Chains & Tokens

Any chain/token configured in the backend is supported. Common ones:

| Chain | Tokens |
|-------|--------|
| BASE | USDC, USDT, DAI, WETH, CBBTC |
| CELO | (configured via DB) |
| POLYGON | USDC |
| ARBITRUM | USDC, USDT, DAI |
| ETHEREUM | USDC, USDT, DAI |
| BSC | USDC, USDT |
| OPTIMISM | USDC, USDT, DAI |
| AVAX | USDC, USDT |
| LISK | USDC, USDT |

---

## 9. Notifications

When an invoice is paid, the creator receives:
- **In-app notification** — via the notification system
- **Email** — sent to `recipientEmail` (if set on invoice) or the creator's `notificationEmail`
- **SMS** — sent to `recipientPhone` (if set on invoice) or the creator's `phoneNumber`

Message format:
> Your invoice "Order #1234" for 25 USDC has been paid via crypto.

---

## 10. API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/invoices/` | API key + JWT | Create a new invoice |
| `GET` | `/invoices/` | API key + JWT | List invoices (with filters) |
| `POST` | `/invoices/pay` | API key | Verify crypto payment for an invoice |
| `POST` | `/invoices/send-link` | API key | Send invoice link via email/SMS |
| `GET` | `/pay/open-ramp` | — | Initiate fiat payment (pass `invoice_id` to link) |
