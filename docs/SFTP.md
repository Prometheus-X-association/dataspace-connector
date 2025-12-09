# FTP & SFTP

The workflows for enabling (S)FTP servers to exchange information after control-plane verification from the connector is a work in progress. The feature is currently **not implemented**. This document exists as an open reference to obtain community feedback.

```mermaid
sequenceDiagram
    participant Provider SFTP
    participant Provider PDC
    participant Consumer PDC
    participant Consumer SFTP
    Note over Provider PDC, Consumer PDC: Exchange triggered
    Note over Provider PDC: Execute SFTP script
    Provider PDC->>Provider SFTP: Execute SFTP
    Provider SFTP-->>Provider PDC: Get file
    Provider PDC->>Consumer PDC: data transfer mime type based on file
    Note over Consumer PDC: TMP file
    Consumer PDC->>Consumer SFTP: Execute SFTP script
    Note over Consumer PDC: TMP file deleted
```

```mermaid
sequenceDiagram
    participant Provider SFTP
    participant Provider PDC
    participant Consumer PDC
    participant Consumer SFTP
    Note over Provider PDC, Consumer PDC: Exchange triggered
    Note over Provider PDC: Execute SFTP script
    Provider PDC->>Consumer PDC: transfer sftp configuration
    Note over Consumer PDC: TMP configuration
    Consumer PDC->>Consumer PDC: Execute SFTP script using configuration in pdc env (need multiple package to work well)
    Consumer PDC->>Provider SFTP: Get file
    Provider SFTP-->>Consumer PDC: 
    Consumer PDC->>Consumer SFTP: transfer file
```

```mermaid
sequenceDiagram
    participant Provider SFTP
    participant Provider PDC
    participant Consumer PDC
    participant Consumer SFTP Server
    Note over Provider PDC, Consumer PDC: Exchange triggered
    Note over Provider PDC: Execute SFTP script
    Provider PDC->>Consumer PDC: transfer sftp configuration
    Note over Consumer PDC: TMP configuration
    Consumer PDC->>Consumer SFTP Server: Execute SFTP script using ssh
    Consumer SFTP Server->>Provider SFTP: Get file
    Provider SFTP-->>Consumer SFTP Server: 
```