# KPI Routes

The KPI (Key Performance Indicator) module exposes read-only metrics about data exchanges processed by the connector. It is intended for monitoring dashboards and reporting tools.

All KPI routes are mounted under **`/private/kpis`**.

---

## Authentication

KPI routes accept **two authentication methods**:

| Method | Header | Notes |
|---|---|---|
| Static API key | `x-kpi-api-key: <value>` | Must match the `KPI_API_KEY` environment variable |
| JWT Bearer | `Authorization: Bearer <token>` | Standard connector JWT issued at login |

The API key method exists to allow long-lived monitoring tools (dashboards, Grafana, etc.) to call the endpoints without managing short-lived JWT tokens.

---

## Concepts

### Exchange status

A `DataExchange` document can have one of the following statuses:

| Status | Meaning |
|---|---|
| `PENDING` | Exchange is in progress |
| `EXPORT_SUCCESS` | Provider successfully exported data |
| `IMPORT_SUCCESS` | Consumer successfully imported data (**terminal success state**) |
| `PROVIDER_EXPORT_ERROR` | Error on the provider side during export |
| `CONSENT_EXPORT_ERROR` | Consent validation failed on export |
| `CONSENT_IMPORT_ERROR` | Consent validation failed on import |
| `CONSUMER_IMPORT_ERROR` | Error on the consumer side during import |
| `PEP_ERROR` | Policy enforcement point error |
| `NODE_CALLBACK_ERROR` | Error during a service chain node callback |
| `UNDEFINED_ERROR` | Uncategorised error |

Across all KPI routes, **"successful"** means the exchange status is `EXPORT_SUCCESS` or `IMPORT_SUCCESS`.

### Exchange types

The connector distinguishes two types of exchanges based on the presence of a service chain:

- **Simple (bilateral)**: a direct point-to-point transfer between a data provider and a data consumer. `serviceChain.services` is absent or empty.
- **Service-chain**: a multi-hop transfer orchestrated through the [Data Processing Chain Protocol](https://github.com/prometheus-x-association/data-processing-chain-protocol). `serviceChain.services` contains at least one entry.

> **Important**: for service-chain metrics, each individual exchange *step* within a chain is counted as a separate `DataExchange` document. The KPI routes do not group steps by logical chain. A chain with 3 steps contributes 3 to the total, not 1.

---

## Routes

### `GET /private/kpis/exchanges/overview`

Returns a global snapshot across **all** data exchanges.

**Response schema: `KpiOverview`**

```jsonc
{
  "totalExchanges": 1274,
  "completedExchanges": 1200,      // left the PENDING state
  "successfulExchanges": 1100,     // EXPORT_SUCCESS or IMPORT_SUCCESS
  "globalSuccessRate": 0.863,      // successfulExchanges / totalExchanges
  "totalBytesTransferred": 204800, // see byte coverage note below
  "simpleExchanges": 900,
  "serviceChainExchanges": 374
}
```

---

### `GET /private/kpis/exchanges/by-offer`

Returns one entry per distinct service offering URI, sorted by total exchange count descending.

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `type` | `resource` \| `purpose` | `resource` | Group by the provider's resource offering or the consumer's purpose offering |

**Response schema: `KpiByOffer[]`**

```jsonc
[
  {
    "serviceOffering": "https://catalog.example.com/v1/catalog/serviceofferings/abc123",
    "totalExchanges": 300,
    "successfulExchanges": 270,
    "successRate": 0.9
  }
]
```

---

### `GET /private/kpis/exchanges/service-chain`

Returns statistics restricted to exchange steps that are **part of a service chain**.

**Response schema: `KpiServiceChain`**

```jsonc
{
  "totalServiceChainExchanges": 374,
  "successfulServiceChainExchanges": 320,
  "successRate": 0.856
}
```

---

### `GET /private/kpis/exchanges/simple`

Returns statistics restricted to **simple (bilateral)** exchanges.

**Response schema: `KpiSimple`**

```jsonc
{
  "totalSimpleExchanges": 900,
  "successfulSimpleExchanges": 780,
  "successRate": 0.867
}
```

---

### `GET /private/kpis/exchanges/volume`

Returns total bytes transferred and a daily exchange count time-series.

**Query parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `from` | ISO 8601 date-time | No | Start of the date range (inclusive). Omit to start from the earliest record. |
| `to` | ISO 8601 date-time | No | End of the date range (inclusive). Omit to include up to the latest record. |

**Response schema: `KpiVolume`**

```jsonc
{
  "totalBytesTransferred": 204800,
  "byteCoverageNote": "Only REST non-service-chain exchanges report a size. This total is partial.",
  "exchangesByDay": [
    { "date": "2026-03-10", "count": 38 },
    { "date": "2026-03-11", "count": 45 }
  ]
}
```

> **Byte coverage**: `totalBytesTransferred` is the sum of `providerData.size` across qualifying documents. Only REST-based non-service-chain exchanges populate this field. The value is therefore a **partial lower bound**, not a complete total.

---

## Success rate calculation

All `successRate` values are calculated as:

```
successRate = round(successfulExchanges / totalExchanges * 1000) / 1000
```

This gives a value between `0` and `1` rounded to 3 decimal places (e.g. `0.863` = 86.3%).

When `totalExchanges` is 0, `successRate` is always `0`.
