package com.inspire.backend.dashboard;

public class DashboardSummary {

    // Machines
    private int totalMachines;
    private int runningMachines;
    private int idleMachines;
    private int maintenanceMachines;
    private int totalLines;

    // Production
    private int activeRuns;
    private int queuedRuns;
    private int completedToday;

    // Warehouse / inventory
    private int totalProducts;
    private int totalAvailableStock;
    private int lowStockItems;
    private int expiringSoonBatches;

    public DashboardSummary() {
    }

    public DashboardSummary(int totalMachines, int runningMachines, int idleMachines,
                            int maintenanceMachines, int totalLines,
                            int activeRuns, int queuedRuns, int completedToday,
                            int totalProducts, int totalAvailableStock,
                            int lowStockItems, int expiringSoonBatches) {
        this.totalMachines = totalMachines;
        this.runningMachines = runningMachines;
        this.idleMachines = idleMachines;
        this.maintenanceMachines = maintenanceMachines;
        this.totalLines = totalLines;
        this.activeRuns = activeRuns;
        this.queuedRuns = queuedRuns;
        this.completedToday = completedToday;
        this.totalProducts = totalProducts;
        this.totalAvailableStock = totalAvailableStock;
        this.lowStockItems = lowStockItems;
        this.expiringSoonBatches = expiringSoonBatches;
    }

    public int getTotalMachines() {
        return totalMachines;
    }

    public int getRunningMachines() {
        return runningMachines;
    }

    public int getIdleMachines() {
        return idleMachines;
    }

    public int getMaintenanceMachines() {
        return maintenanceMachines;
    }

    public int getTotalLines() {
        return totalLines;
    }

    public int getActiveRuns() {
        return activeRuns;
    }

    public int getQueuedRuns() {
        return queuedRuns;
    }

    public int getCompletedToday() {
        return completedToday;
    }

    public int getTotalProducts() {
        return totalProducts;
    }

    public int getTotalAvailableStock() {
        return totalAvailableStock;
    }

    public int getLowStockItems() {
        return lowStockItems;
    }

    public int getExpiringSoonBatches() {
        return expiringSoonBatches;
    }
}
