package com.inspire.backend.management;

import java.time.LocalDateTime;

public class MaintenanceTicket implements Comparable<MaintenanceTicket> {
    private String id;
    private String machineId;
    private String description;
    private int priority; // 1=LOW, 2=MEDIUM, 3=HIGH, 4=CRITICAL
    private String status; // PENDING, IN_PROGRESS, RESOLVED
    private LocalDateTime createdAt;

    public MaintenanceTicket(String id, String machineId, String description, int priority) {
        this.id = id;
        this.machineId = machineId;
        this.description = description;
        this.priority = priority;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getMachineId() { return machineId; }
    public String getDescription() { return description; }
    public int getPriority() { return priority; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setStatus(String status) { this.status = status; }

    // Comparable for priority queue (higher priority = processed first)
    @Override
    public int compareTo(MaintenanceTicket other) {
        return Integer.compare(other.priority, this.priority);
    }
}
