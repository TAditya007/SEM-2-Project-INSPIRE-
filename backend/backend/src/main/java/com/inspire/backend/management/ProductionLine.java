package com.inspire.backend.management;

import java.util.LinkedList;
import java.util.List;

public class ProductionLine {
    private String id;
    private String name;
    private String product;
    private LinkedList<String> machineSequence; // Order matters for production flow

    public ProductionLine(String id, String name, String product, List<String> machineIds) {
        this.id = id;
        this.name = name;
        this.product = product;
        this.machineSequence = new LinkedList<>(machineIds);
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getProduct() { return product; }
    public LinkedList<String> getMachineSequence() { return machineSequence; }

    // ✅ FRONTEND FIX: Alias for JS compatibility
    public List<String> getMachineIds() { 
        return new LinkedList<>(machineSequence); 
    }

    // Add machine at specific position
    public void addMachineAt(int index, String machineId) {
        machineSequence.add(index, machineId);
    }

    // Remove machine by ID
    public boolean removeMachine(String machineId) {
        return machineSequence.remove(machineId);
    }
}
