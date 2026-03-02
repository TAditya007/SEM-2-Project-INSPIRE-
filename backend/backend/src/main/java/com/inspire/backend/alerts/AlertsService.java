package com.inspire.backend.alerts;

import com.inspire.backend.management.Machine;
import com.inspire.backend.management.ManagementService;
import com.inspire.backend.production.ProductionRun;
import com.inspire.backend.production.ProductionService;
import com.inspire.backend.warehouse.InventoryItem;
import com.inspire.backend.warehouse.WarehouseService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AlertsService {

    private final ManagementService managementService;
    private final ProductionService productionService;
    private final WarehouseService warehouseService;

    // Simple in-memory map for acknowledge state
    private final Map<String, Boolean> acknowledgedById = new ConcurrentHashMap<>();

    public AlertsService(ManagementService managementService,
                         ProductionService productionService,
                         WarehouseService warehouseService) {
        this.managementService = managementService;
        this.productionService = productionService;
        this.warehouseService = warehouseService;
    }

    public List<Alert> getAlerts(String type, String severity, Boolean acknowledged) {
        List<Alert> alerts = new ArrayList<>();

        alerts.addAll(machineAlerts());
        alerts.addAll(productionAlerts());
        alerts.addAll(warehouseAlerts());

        // Sort newest first
        alerts.sort(Comparator.comparing(Alert::getCreatedAt).reversed());

        // Apply filters
        return alerts.stream()
                .filter(a -> type == null || type.isEmpty() || a.getType().equalsIgnoreCase(type))
                .filter(a -> severity == null || severity.isEmpty() || a.getSeverity().equalsIgnoreCase(severity))
                .filter(a -> acknowledged == null || a.isAcknowledged() == acknowledged)
                .collect(Collectors.toList());
    }

    public List<Alert> getRecentAlerts(int limit) {
        return getAlerts(null, null, null).stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    public boolean acknowledgeAlert(String id) {
        if (!acknowledgedById.containsKey(id)) {
            acknowledgedById.put(id, true);
        } else {
            acknowledgedById.put(id, true);
        }
        return true;
    }

    private List<Alert> machineAlerts() {
        List<Alert> alerts = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Machine m : managementService.getMachines(null, null)) {
            String id = "MACHINE-" + m.getId();
            boolean ack = acknowledgedById.getOrDefault(id, false);

            if ("MAINTENANCE".equalsIgnoreCase(m.getStatus())) {
                Alert a = new Alert(
                        id,
                        "MACHINE",
                        "WARNING",
                        "Machine in maintenance",
                        "Machine " + m.getId() + " (" + m.getName() + ") is in maintenance.",
                        m.getId(),
                        now.minusMinutes(10)
                );
                a.setAcknowledged(ack);
                alerts.add(a);
            } else if (!"RUNNING".equalsIgnoreCase(m.getStatus())) {
                Alert a = new Alert(
                        id,
                        "MACHINE",
                        "INFO",
                        "Machine not running",
                        "Machine " + m.getId() + " is " + m.getStatus() + ".",
                        m.getId(),
                        now.minusMinutes(30)
                );
                a.setAcknowledged(ack);
                alerts.add(a);
            }
        }
        return alerts;
    }

    private List<Alert> productionAlerts() {
        List<Alert> alerts = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (ProductionRun run : productionService.getActiveRuns()) {
            String id = "RUN-" + run.getId();
            boolean ack = acknowledgedById.getOrDefault(id, false);

            double passRate = run.getQualityMetrics() != null
                    ? run.getQualityMetrics().getPassRate()
                    : 100.0;

            if (passRate < 90.0) {
                Alert a = new Alert(
                        id,
                        "PRODUCTION",
                        "WARNING",
                        "Low pass rate",
                        "Run " + run.getId() + " on " + run.getLineName()
                                + " has pass rate " + String.format("%.1f", passRate) + "%.",
                        run.getId(),
                        now.minusMinutes(5)
                );
                a.setAcknowledged(ack);
                alerts.add(a);
            }
        }

        for (ProductionRun run : productionService.getCompletedRuns()) {
          if (!"FAILED".equalsIgnoreCase(run.getStatus())) continue;

          String id = "RUN-" + run.getId();
          boolean ack = acknowledgedById.getOrDefault(id, false);

          Alert a = new Alert(
                  id,
                  "PRODUCTION",
                  "CRITICAL",
                  "Run failed",
                  "Run " + run.getId() + " (" + run.getProduct() + ") failed.",
                  run.getId(),
                  run.getCompletedAt() != null ? run.getCompletedAt() : now.minusHours(1)
          );
          a.setAcknowledged(ack);
          alerts.add(a);
        }

        return alerts;
    }

    private List<Alert> warehouseAlerts() {
        List<Alert> alerts = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Low stock
        for (InventoryItem item : warehouseService.getLowStockItems()) {
            String id = "INV-" + item.getProductId();
            boolean ack = acknowledgedById.getOrDefault(id, false);

            Alert a = new Alert(
                    id,
                    "WAREHOUSE",
                    "WARNING",
                    "Low stock",
                    item.getProductName() + " is low on stock. Available: "
                            + item.getAvailableQuantity(),
                    item.getProductId(),
                    now.minusMinutes(20)
            );
            a.setAcknowledged(ack);
            alerts.add(a);
        }

        // Expiring soon batches
        warehouseService.getExpiringBatches(30).forEach(batch -> {
            String id = "BATCH-" + batch.getId();
            boolean ack = acknowledgedById.getOrDefault(id, false);

            Alert a = new Alert(
                    id,
                    "WAREHOUSE",
                    "INFO",
                    "Batch expiring soon",
                    "Batch " + batch.getId() + " (" + batch.getProductName()
                            + ") expiring on " + batch.getExpiryDate(),
                    batch.getId(),
                    now.minusMinutes(15)
            );
            a.setAcknowledged(ack);
            alerts.add(a);
        });

        return alerts;
    }
}
