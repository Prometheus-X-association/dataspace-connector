# Dataspace Protocol (DSP) — First Iteration

## Overview

This document describes the first iteration of the **Dataspace Protocol (DSP)** implementation within the Prometheus-X dataspace connector.  
DSP is a protocol specification defined by the **International Data Spaces Association (IDSA)** to enable interoperable data exchange between participants in a dataspace.

The first iteration focuses on exposing the **Contract Negotiation** endpoints under the `/dsif` prefix, split between public (provider/consumer-facing) and private (internal) routes.

> **Note:** This is the first iteration of the DSP implementation. Subsequent iterations will progressively cover the **full DSP specification**, including Catalog, Transfer Process, all message flows, state machine transitions, and protocol-compliant error handling as defined by the IDSA.

---

## Base URL

```
/dsif
```

All routes described below are relative to this base path.

---

## Authentication

All `/dsif` endpoints require a valid **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## 1. Private Routes

These routes are intended for **internal use** by the connector.

### 1.1 Initiate a Negotiation (Internal)

| Property   | Value    |
|------------|----------|
| **Method** | `POST`   |
| **Route**  | `/dsif/` |

Triggers an internal contract negotiation process.

---

## 2. Contract Negotiation — Provider Routes

Routes exposed by the **provider** side of the connector.

### 2.1 Receive Contract Request

| Property   | Value                            |
|------------|----------------------------------|
| **Method** | `POST`                           |
| **Route**  | `/dsif/negotiations/request`     |

#### Request Body

```json
{
  "@context": "https://w3id.org/dspace/v0.8/context.json",
  "@type": "dspace:ContractRequestMessage",
  "dspace:providerId": "urn:uuid:provider-001",
  "dspace:offer": {
    "@type": "odrl:Offer",
    "@id": "urn:uuid:offer-001",
    "odrl:target": "urn:uuid:dataset-001"
  },
  "dspace:callbackAddress": "https://consumer.example.com/dsif/callback"
}
```

| Field                    | Type   | Required | Description                                |
|--------------------------|--------|----------|--------------------------------------------|
| `dspace:providerId`      | string | Yes      | URN of the data provider                   |
| `dspace:offer`           | object | Yes      | ODRL Offer referencing the target dataset  |
| `dspace:callbackAddress` | string | Yes      | Consumer callback URL for state updates    |

#### Response — `201 Created`

```json
{
  "@context": "https://w3id.org/dspace/v0.8/context.json",
  "@type": "dspace:ContractNegotiation",
  "@id": "urn:uuid:negotiation-001",
  "dspace:state": "REQUESTED"
}
```

---

### 2.2 Provider — Negotiation Events

| Property   | Value                                         |
|------------|-----------------------------------------------|
| **Method** | `POST`                                        |
| **Route**  | `/dsif/negotiations/:providerPid/events`      |

#### Path Parameters

| Parameter     | Type   | Description                     |
|---------------|--------|---------------------------------|
| `providerPid` | string | URN of the provider negotiation |

---

### 2.3 Provider — Agreement Verification

| Property   | Value                                                        |
|------------|--------------------------------------------------------------|
| **Method** | `POST`                                                       |
| **Route**  | `/dsif/negotiations/:providerPid/agreement/verification`     |

#### Path Parameters

| Parameter     | Type   | Description                     |
|---------------|--------|---------------------------------|
| `providerPid` | string | URN of the provider negotiation |

---

### 2.4 Provider — Termination

| Property   | Value                                            |
|------------|--------------------------------------------------|
| **Method** | `POST`                                           |
| **Route**  | `/dsif/negotiations/:providerPid/termination`    |

#### Path Parameters

| Parameter     | Type   | Description                     |
|---------------|--------|---------------------------------|
| `providerPid` | string | URN of the provider negotiation |

---

## 3. Contract Negotiation — Consumer Routes

Routes exposed by the **consumer** side of the connector, called back by the provider.

### 3.1 Consumer — Receive Agreement

| Property   | Value                                          |
|------------|------------------------------------------------|
| **Method** | `POST`                                         |
| **Route**  | `/dsif/negotiations/:consumerPid/agreement`    |

#### Path Parameters

| Parameter     | Type   | Description                     |
|---------------|--------|---------------------------------|
| `consumerPid` | string | URN of the consumer negotiation |

---

### 3.2 Consumer — Negotiation Events

| Property   | Value                                         |
|------------|-----------------------------------------------|
| **Method** | `POST`                                        |
| **Route**  | `/dsif/negotiations/:consumerPid/events`      |

#### Path Parameters

| Parameter     | Type   | Description                     |
|---------------|--------|---------------------------------|
| `consumerPid` | string | URN of the consumer negotiation |

---

### 3.3 Consumer — Termination

| Property   | Value                                            |
|------------|--------------------------------------------------|
| **Method** | `POST`                                           |
| **Route**  | `/dsif/negotiations/:consumerPid/termination`    |

#### Path Parameters

| Parameter     | Type   | Description                     |
|---------------|--------|---------------------------------|
| `consumerPid` | string | URN of the consumer negotiation |

---

## 4. Negotiation States

| State        | Description                                         |
|--------------|-----------------------------------------------------|
| `REQUESTED`  | Consumer has sent the contract request              |
| `OFFERED`    | Provider sent a counter-offer                       |
| `AGREED`     | Both parties agreed on the contract                 |
| `VERIFIED`   | Consumer verified the agreement                     |
| `FINALIZED`  | Provider finalized — negotiation complete           |
| `TERMINATED` | Negotiation was terminated by either party          |

---

## 5. Route Summary

| Method | Route                                                    | Scope    | Description                          |
|--------|----------------------------------------------------------|----------|--------------------------------------|
| `POST` | `/dsif/`                                                 | Private  | Initiate a negotiation internally    |
| `POST` | `/dsif/negotiations/request`                             | Public   | Receive a contract request           |
| `POST` | `/dsif/negotiations/:providerPid/events`                 | Public   | Provider negotiation events          |
| `POST` | `/dsif/negotiations/:providerPid/agreement/verification` | Public   | Provider agreement verification      |
| `POST` | `/dsif/negotiations/:providerPid/termination`            | Public   | Provider negotiation termination     |
| `POST` | `/dsif/negotiations/:consumerPid/agreement`              | Public   | Consumer receives agreement          |
| `POST` | `/dsif/negotiations/:consumerPid/events`                 | Public   | Consumer negotiation events          |
| `POST` | `/dsif/negotiations/:consumerPid/termination`            | Public   | Consumer negotiation termination     |

---

## 6. Known Limitations (First Iteration)

- Only **Contract Negotiation** is covered in this iteration.
- **Catalog** and **Transfer Process** endpoints are not yet implemented.
- Counter-offer flow (provider-side `OFFERED` state) is **not yet implemented**.
- Callback notifications are **not yet dispatched** automatically.
- No persistent storage of negotiation state between restarts.
- **Full DSP protocol coverage** will be addressed in upcoming iterations.
- This implementation is currently **only functional with [VisionsTrust](https://visionstrust.com)**. Interoperability with other dataspace connectors is not yet guaranteed.

---

## 7. References

- [IDSA Dataspace Protocol Specification](https://docs.internationaldataspaces.org/ids-knowledgebase/dataspace-protocol)
- [DCAT Vocabulary](https://www.w3.org/TR/vocab-dcat-3/)
- [ODRL Information Model](https://www.w3.org/TR/odrl-model/)
