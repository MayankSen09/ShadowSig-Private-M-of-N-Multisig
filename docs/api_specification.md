# ShadowSig API Specification

This document details the HTTP REST endpoints provided by the ShadowSig Axum API Gateway.

## Base URL
The API Gateway runs locally at: `http://localhost:8080`

---

## 1. System Health
### `GET /health`
Returns the status, version, and uptime of the gateway.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "0.1.0",
    "uptime_seconds": 1240
  },
  "error": null
}
```

---

## 2. Multisig Management

### `POST /api/multisigs`
Initializes a new privacy-preserving multisig with custom threshold and shielded member commitments.

**Request Body:**
```json
{
  "name": "Treasury Multisig",
  "description": "Logos foundation core treasury wallet",
  "threshold": 2,
  "member_commitments": [
    "a1b2c3d4...",
    "e5f6g7h8..."
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "e4b10b80-87a3-41c3-882d-41a4a49c336b",
    "name": "Treasury Multisig",
    "description": "Logos foundation core treasury wallet",
    "threshold": 2,
    "member_count": 2,
    "merkle_root": [14, 56, 128, ...],
    "status": "active",
    "created_at": "2026-07-27T15:30:10Z",
    "updated_at": "2026-07-27T15:30:10Z"
  },
  "error": null
}
```

---

## 3. Proposal Management

### `POST /api/proposals`
Creates a new governance or treasury proposal for a multisig.

**Request Body:**
```json
{
  "multisig_id": "e4b10b80-87a3-41c3-882d-41a4a49c336b",
  "title": "Transfer 100 LGS",
  "description": "Transfer operational budget to Dev Pool",
  "action_type": "transfer",
  "action_data": {
    "asset": "LGS",
    "amount": 100,
    "recipient": "0x8920..."
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "fa2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "multisig_id": "e4b10b80-87a3-41c3-882d-41a4a49c336b",
    "title": "Transfer 100 LGS",
    "description": "Transfer operational budget to Dev Pool",
    "action_type": "transfer",
    "action_data": {
      "asset": "LGS",
      "amount": 100,
      "recipient": "0x8920..."
    },
    "approval_count": 0,
    "threshold": 2,
    "status": "pending",
    "expires_at": null,
    "created_at": "2026-07-27T15:31:00Z",
    "updated_at": "2026-07-27T15:31:00Z"
  },
  "error": null
}
```
