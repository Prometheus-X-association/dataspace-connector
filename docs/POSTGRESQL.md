# PostgresSQL Flow

The connector allows you to interact with PostgresSQL databases using _postgres_ npm package as dependency.

## The data resource will retrieve data from a PostgresSQL database

### Schema

```mermaid
sequenceDiagram
    participant Provider POSTGRESQL database
    participant Provider PDC
    participant Consumer PDC
    participant Consumer Resource
    Note over Provider PDC, Consumer PDC: Exchange triggered
    Provider PDC->>Provider POSTGRESQL database: DB query
    Provider POSTGRESQL database-->>Provider PDC: DB result
    Provider PDC->>Consumer PDC: data transfer application/json
    Consumer PDC->>Consumer Resource: POST on data to resource url
```

### Configuration

* Data resource representation example:
```json
{
  "sql": {
    "type": "POSTGRESQL",
    "host": "",
    "port": "",
    "credential": "",
    "query": "SELECT * FROM your_table;",
    "url": "postgres://admin:admin@127.0.0.1:5432/users"
  }
}
```

* service resource representation example:
```json
{
  "type": "REST",
  "method": "none",
  "credential": "",
  "url": "https://your-resource-endpoint"
}
```

## The service will resource will execute a query/script from a provider into a database

### Schema

```mermaid
sequenceDiagram
    participant Provider Resource
    participant Provider PDC
    participant Consumer PDC
    participant Consumer POSTGRESQL database
    Note over Provider PDC, Consumer PDC: Exchange triggered
    Provider PDC->>Provider Resource: GET on resource url
    Provider Resource-->>Provider PDC: text/plain query/script
    Provider PDC->>Consumer PDC: data transfer text/plain
    Consumer PDC->>Consumer POSTGRESQL database: execute query/script
```

### Configuration

* Data resource representation example:
```json
{
  "type": "REST",
  "method": "none",
  "credential": "",
  "url": "https://your-resource-endpoint/generate-query"
}
```

* service resource representation example:
```json
{
  "sql": {
    "type": "POSTGRESQL",
    "host": "",
    "port": "",
    "credential": "",
    "query": "",
    "url": "postgres://admin:admin@127.0.0.1:5432/users"
  }
}
```