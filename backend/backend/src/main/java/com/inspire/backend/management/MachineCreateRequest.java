package com.inspire.backend.management;

public class MachineCreateRequest {
    private String name;
    private String type;
    private String department;
    private String status;
    private int efficiency;

    public String getName() { return name; }
    public String getType() { return type; }
    public String getDepartment() { return department; }
    public String getStatus() { return status; }
    public int getEfficiency() { return efficiency; }

    public void setName(String name) { this.name = name; }
    public void setType(String type) { this.type = type; }
    public void setDepartment(String department) { this.department = department; }
    public void setStatus(String status) { this.status = status; }
    public void setEfficiency(int efficiency) { this.efficiency = efficiency; }
}
