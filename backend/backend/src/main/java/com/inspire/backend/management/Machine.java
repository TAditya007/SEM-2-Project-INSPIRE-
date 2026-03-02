package com.inspire.backend.management;

import java.time.LocalDateTime;

public class Machine implements Comparable<Machine> {
    private String id;
    private String name;
    private String type;
    private String department;
    private String status;
    private int efficiency;
    private LocalDateTime installedAt;
    private int maintenanceCount;

    public Machine(String id, String name, String type, String department,
                   String status, int efficiency, LocalDateTime installedAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.department = department;
        this.status = status;
        this.efficiency = efficiency;
        this.installedAt = installedAt;
        this.maintenanceCount = 0;
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type; }
    public String getDepartment() { return department; }
    public String getStatus() { return status; }
    public int getEfficiency() { return efficiency; }
    public LocalDateTime getInstalledAt() { return installedAt; }
    public int getMaintenanceCount() { return maintenanceCount; }

    // Setters
    public void setStatus(String status) { this.status = status; }
    public void setEfficiency(int efficiency) { this.efficiency = efficiency; }
    public void incrementMaintenance() { this.maintenanceCount++; }

    // Comparable for sorting by efficiency (descending)
    @Override
    public int compareTo(Machine other) {
        return Integer.compare(other.efficiency, this.efficiency);
    }

    @Override
    public String toString() {
        return id + " [" + name + "] - " + efficiency + "%";
    }
}
