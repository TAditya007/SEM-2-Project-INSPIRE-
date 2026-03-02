package com.inspire.backend.alerts;

import java.time.LocalDateTime;

public class Alert {

    private String id;
    private String type;      // MACHINE, PRODUCTION, WAREHOUSE
    private String severity;  // INFO, WARNING, CRITICAL
    private String title;
    private String message;
    private String sourceId;  // machineId, runId, productId, batchId...
    private LocalDateTime createdAt;
    private boolean acknowledged;

    public Alert(String id, String type, String severity, String title,
                 String message, String sourceId, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.severity = severity;
        this.title = title;
        this.message = message;
        this.sourceId = sourceId;
        this.createdAt = createdAt;
        this.acknowledged = false;
    }

    public String getId() { return id; }
    public String getType() { return type; }
    public String getSeverity() { return severity; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getSourceId() { return sourceId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isAcknowledged() { return acknowledged; }

    public void setAcknowledged(boolean acknowledged) {
        this.acknowledged = acknowledged;
    }
}
