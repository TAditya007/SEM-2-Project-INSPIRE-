package com.inspire.backend.dashboard;

import com.inspire.backend.management.Machine;
import com.inspire.backend.management.ManagementService;
import com.inspire.backend.production.ProductionRun;
import com.inspire.backend.production.ProductionService;
import com.inspire.backend.warehouse.InventoryItem;
import com.inspire.backend.warehouse.WarehouseService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final ManagementService managementService;
    private final ProductionService productionService;
    private final WarehouseService warehouseService;

    public DashboardService(ManagementService managementService,
                            ProductionService productionService,
                            WarehouseService warehouseService) {
        this.managementService = managementService;
        this.productionService = productionService;
        this.warehouseService = warehouseService;
    }

    public DashboardSummary getSummary() {

        // Machines
        List<Machine> machines = managementService.getMachines("", "");
        int totalMachines = machines.size();
        int runningMachines = (int) machines.stream()
                .filter(m -> "RUNNING".equalsIgnoreCase(m.getStatus()))
                .count();
        int idleMachines = (int) machines.stream()
                .filter(m -> "IDLE".equalsIgnoreCase(m.getStatus()))
                .count();
        int maintenanceMachines = (int) machines.stream()
                .filter(m -> "MAINTENANCE".equalsIgnoreCase(m.getStatus()))
                .count();

        int totalLines = managementService.getLines().size();

        // Production
        List<ProductionRun> activeRuns = productionService.getActiveRuns();
        List<ProductionRun> queuedRuns = productionService.getQueuedRuns();
        List<ProductionRun> completedRuns = productionService.getCompletedRuns();

        int active = activeRuns.size();
        int queued = queuedRuns.size();

        LocalDate today = LocalDate.now();
        int completedToday = (int) completedRuns.stream()
                .filter(r -> r.getCompletedAt() != null &&
                        r.getCompletedAt().toLocalDate().isEqual(today))
                .count();

        // Warehouse / inventory
        List<InventoryItem> inventory = warehouseService.getInventorySummary();
        int totalProducts = inventory.size();
        int totalAvailableStock = inventory.stream()
                .mapToInt(InventoryItem::getAvailableQuantity)
                .sum();

        int lowStockItems = warehouseService.getLowStockItems().size();

        int expiringSoonBatches = warehouseService.getExpiringBatches(30).size();

        return new DashboardSummary(
                totalMachines,
                runningMachines,
                idleMachines,
                maintenanceMachines,
                totalLines,
                active,
                queued,
                completedToday,
                totalProducts,
                totalAvailableStock,
                lowStockItems,
                expiringSoonBatches
        );
    }
}
