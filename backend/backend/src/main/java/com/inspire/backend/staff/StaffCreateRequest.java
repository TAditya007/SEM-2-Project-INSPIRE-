package com.inspire.backend.staff;

public class StaffCreateRequest {
    private String name;
    private String role;
    private String department;
    private String status;
    private double salary;

    public String getName() { return name; }
    public String getRole() { return role; }
    public String getDepartment() { return department; }
    public String getStatus() { return status; }
    public double getSalary() { return salary; }

    public void setName(String name) { this.name = name; }
    public void setRole(String role) { this.role = role; }
    public void setDepartment(String department) { this.department = department; }
    public void setStatus(String status) { this.status = status; }
    public void setSalary(double salary) { this.salary = salary; }
}
