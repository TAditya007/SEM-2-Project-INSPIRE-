package com.inspire.backend.warehouse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
@RequestMapping("/api/warehouse")
public class WarehouseController {

    @Autowired
    private WarehouseService service;

    @GetMapping("/batches")
    public List<Batch> getAllBatches(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {
        
        if (q != null || location != null || status != null) {
            return service.searchBatches(q, location, status);
        }
        return service.getAllBatches();
    }

    @GetMapping("/batches/{id}")
    public Batch getBatch(@PathVariable String id) {
        return service.getBatchById(id);
    }

    @GetMapping("/batches/product/{productId}")
    public List<Batch> getBatchesByProduct(@PathVariable String productId) {
        return service.getBatchesByProduct(productId);
    }

    @GetMapping("/batches/location/{location}")
    public List<Batch> getBatchesByLocation(@PathVariable String location) {
        return service.getBatchesByLocation(location);
    }

    @GetMapping("/batches/expiring/{days}")
    public List<Batch> getExpiringBatches(@PathVariable int days) {
        return service.getExpiringBatches(days);
    }

    @GetMapping("/batches/expired")
    public List<Batch> getExpiredBatches() {
        return service.getExpiredBatches();
    }

    @PostMapping("/batches")
    public Batch createBatch(@RequestBody BatchCreateRequest req) {
        return service.addBatch(req);
    }

    @PutMapping("/batches/{id}/move")
    public Batch moveBatch(@PathVariable String id, @RequestBody BatchMoveRequest req) {
        return service.moveBatch(id, req.getNewLocation());
    }

    @PutMapping("/batches/{id}/quantity")
    public Batch updateQuantity(@PathVariable String id, @RequestParam int quantity) {
        return service.updateBatchQuantity(id, quantity);
    }

    @DeleteMapping("/batches/{id}")
    public void deleteBatch(@PathVariable String id) {
        service.deleteBatch(id);
    }

    @GetMapping("/inventory")
    public List<InventoryItem> getInventorySummary() {
        return service.getInventorySummary();
    }

    @GetMapping("/inventory/low-stock")
    public List<InventoryItem> getLowStockItems() {
        return service.getLowStockItems();
    }

    @GetMapping("/locations")
    public List<String> getLocations() {
        return service.getLocations();
    }
}
