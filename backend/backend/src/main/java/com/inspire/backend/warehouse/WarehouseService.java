package com.inspire.backend.warehouse;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    // Fast batch lookup by ID - O(1)
    private final HashMap<String, Batch> batchesById = new HashMap<>();
    
    // Batches grouped by product - O(1) product access
    private final HashMap<String, LinkedList<Batch>> batchesByProduct = new HashMap<>();
    
    // Batches grouped by location - O(1) location access
    private final HashMap<String, LinkedList<Batch>> batchesByLocation = new HashMap<>();
    
    // Inventory summary by product
    private final HashMap<String, InventoryItem> inventoryByProduct = new HashMap<>();
    
    // Expiry tracking (sorted by date)
    private final TreeMap<LocalDate, List<Batch>> batchesByExpiry = new TreeMap<>();

    private int nextBatchNum = 1;

    public WarehouseService() {
        seedData();
    }

    private void seedData() {
        // Seed products
        inventoryByProduct.put("SEDAN-001", 
            new InventoryItem("SEDAN-001", "Luxury Sedan", "Vehicles", 10));
        inventoryByProduct.put("SUV-001", 
            new InventoryItem("SUV-001", "Premium SUV", "Vehicles", 5));
        inventoryByProduct.put("ENGINE-001", 
            new InventoryItem("ENGINE-001", "V6 Engine", "Parts", 15));

        // Seed batches
        addBatch(new BatchCreateRequest() {{
            setProductId("SEDAN-001");
            setProductName("Luxury Sedan");
            setQuantity(25);
            setLocation("WAREHOUSE-A");
            setManufacturedDate(LocalDate.now().minusDays(10));
            setExpiryDate(LocalDate.now().plusMonths(12));
        }});

        addBatch(new BatchCreateRequest() {{
            setProductId("SUV-001");
            setProductName("Premium SUV");
            setQuantity(15);
            setLocation("WAREHOUSE-B");
            setManufacturedDate(LocalDate.now().minusDays(5));
            setExpiryDate(LocalDate.now().plusMonths(18));
        }});

        addBatch(new BatchCreateRequest() {{
            setProductId("ENGINE-001");
            setProductName("V6 Engine");
            setQuantity(40);
            setLocation("WAREHOUSE-A");
            setManufacturedDate(LocalDate.now().minusDays(20));
            setExpiryDate(LocalDate.now().plusMonths(24));
        }});
    }

    // Add batch - O(1) for all data structures
    public Batch addBatch(BatchCreateRequest req) {
        String id = String.format("BATCH-%04d", nextBatchNum++);
        Batch batch = new Batch(id, req.getProductId(), req.getProductName(),
                req.getQuantity(), req.getLocation(),
                req.getManufacturedDate(), req.getExpiryDate());

        batchesById.put(id, batch);
        
        batchesByProduct.computeIfAbsent(req.getProductId(), k -> new LinkedList<>()).add(batch);
        batchesByLocation.computeIfAbsent(req.getLocation(), k -> new LinkedList<>()).add(batch);
        
        if (req.getExpiryDate() != null) {
            batchesByExpiry.computeIfAbsent(req.getExpiryDate(), k -> new ArrayList<>()).add(batch);
        }

        updateInventory(req.getProductId());
        return batch;
    }

    // Get all batches
    public List<Batch> getAllBatches() {
        return new ArrayList<>(batchesById.values());
    }

    // Get batch by ID - O(1)
    public Batch getBatchById(String id) {
        return batchesById.get(id);
    }

    // Get batches by product - O(1)
    public List<Batch> getBatchesByProduct(String productId) {
        return new ArrayList<>(batchesByProduct.getOrDefault(productId, new LinkedList<>()));
    }

    // Get batches by location - O(1)
    public List<Batch> getBatchesByLocation(String location) {
        return new ArrayList<>(batchesByLocation.getOrDefault(location, new LinkedList<>()));
    }

    // Get expiring batches (within N days) - O(log n) TreeMap range query
    public List<Batch> getExpiringBatches(int days) {
        LocalDate cutoff = LocalDate.now().plusDays(days);
        return batchesByExpiry.headMap(cutoff, true).values().stream()
                .flatMap(List::stream)
                .filter(b -> !b.isExpired())
                .sorted(Comparator.comparing(Batch::getExpiryDate))
                .collect(Collectors.toList());
    }

    // Get expired batches
    public List<Batch> getExpiredBatches() {
        return batchesById.values().stream()
                .filter(Batch::isExpired)
                .sorted(Comparator.comparing(Batch::getExpiryDate))
                .collect(Collectors.toList());
    }

    // Move batch to new location - O(1) for HashMaps, O(n) for LinkedList removal
    public Batch moveBatch(String id, String newLocation) {
        Batch batch = batchesById.get(id);
        if (batch == null) return null;

        String oldLocation = batch.getLocation();
        batchesByLocation.get(oldLocation).remove(batch);
        
        batch.setLocation(newLocation);
        batchesByLocation.computeIfAbsent(newLocation, k -> new LinkedList<>()).add(batch);

        return batch;
    }

    // Update batch quantity
    public Batch updateBatchQuantity(String id, int newQuantity) {
        Batch batch = batchesById.get(id);
        if (batch == null) return null;

        batch.setQuantity(newQuantity);
        updateInventory(batch.getProductId());
        return batch;
    }

    // Delete batch
    public boolean deleteBatch(String id) {
        Batch batch = batchesById.remove(id);
        if (batch == null) return false;

        batchesByProduct.get(batch.getProductId()).remove(batch);
        batchesByLocation.get(batch.getLocation()).remove(batch);
        
        if (batch.getExpiryDate() != null) {
            List<Batch> expiryList = batchesByExpiry.get(batch.getExpiryDate());
            if (expiryList != null) {
                expiryList.remove(batch);
                if (expiryList.isEmpty()) {
                    batchesByExpiry.remove(batch.getExpiryDate());
                }
            }
        }

        updateInventory(batch.getProductId());
        return true;
    }

    // Get inventory summary
    public List<InventoryItem> getInventorySummary() {
        return new ArrayList<>(inventoryByProduct.values());
    }

    // Get low stock items
    public List<InventoryItem> getLowStockItems() {
        return inventoryByProduct.values().stream()
                .filter(InventoryItem::isLowStock)
                .collect(Collectors.toList());
    }

    // Update inventory totals for a product
    private void updateInventory(String productId) {
        InventoryItem item = inventoryByProduct.get(productId);
        if (item == null) return;

        int total = batchesByProduct.getOrDefault(productId, new LinkedList<>()).stream()
                .filter(b -> b.getStatus().equals("AVAILABLE"))
                .mapToInt(Batch::getQuantity)
                .sum();

        int reserved = batchesByProduct.getOrDefault(productId, new LinkedList<>()).stream()
                .filter(b -> b.getStatus().equals("RESERVED"))
                .mapToInt(Batch::getQuantity)
                .sum();

        item.updateQuantities(total, reserved);
    }

    // Search batches
    public List<Batch> searchBatches(String query, String location, String status) {
        return batchesById.values().stream()
                .filter(b -> {
                    boolean matchQuery = query == null || query.isEmpty() ||
                            b.getId().toLowerCase().contains(query.toLowerCase()) ||
                            b.getProductName().toLowerCase().contains(query.toLowerCase());
                    
                    boolean matchLocation = location == null || location.isEmpty() ||
                            b.getLocation().equalsIgnoreCase(location);
                    
                    boolean matchStatus = status == null || status.isEmpty() ||
                            b.getStatus().equalsIgnoreCase(status);

                    return matchQuery && matchLocation && matchStatus;
                })
                .collect(Collectors.toList());
    }

    // Get available locations
    public List<String> getLocations() {
        return new ArrayList<>(batchesByLocation.keySet());
    }
}
