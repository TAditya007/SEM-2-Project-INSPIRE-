package com.inspire.backend.staff;

import java.time.LocalDateTime;

public class Staff {
    private String id;
    private String name;
    private String role;
    private String department;
    private String status;       // ACTIVE, ON_LEAVE, RESIGNED
    private double salary;
    private String avatarInitials;
    private LocalDateTime joinedAt;

    public Staff(String id, String name, String role, String department,
                 String status, double salary, LocalDateTime joinedAt) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.department = department;
        this.status = status;
        this.salary = salary;
        this.joinedAt = joinedAt;
        this.avatarInitials = buildInitials(name);
    }

    private String buildInitials(String fullName) {
        if (fullName == null || fullName.isBlank()) return "ST";
        String[] parts = fullName.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty()) {
                sb.append(Character.toUpperCase(p.charAt(0)));
                if (sb.length() == 2) break;
            }
        }
        return sb.toString();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getRole() { return role; }
    public String getDepartment() { return department; }
    public String getStatus() { return status; }
    public double getSalary() { return salary; }
    public String getAvatarInitials() { return avatarInitials; }
    public LocalDateTime getJoinedAt() { return joinedAt; }

    public void setDepartment(String department) { this.department = department; }
    public void setStatus(String status) { this.status = status; }
    public void setSalary(double salary) { this.salary = salary; }
}
