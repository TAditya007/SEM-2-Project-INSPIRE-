package com.inspire.backend.warehouse;

public class InventoryItem {
    private String productId;
    private String productName;
    private int totalQuantity;
    private int reservedQuantity;
    private int availableQuantity;
    private int lowStockThreshold;
    private String category;

    public InventoryItem(String productId, String productName, String category, int lowStockThreshold) {
        this.productId = productId;
        this.productName = productName;
        this.category = category;
        this.lowStockThreshold = lowStockThreshold;
        this.totalQuantity = 0;
        this.reservedQuantity = 0;
        this.availableQuantity = 0;
    }

    public void updateQuantities(int total, int reserved) {
        this.totalQuantity = total;
        this.reservedQuantity = reserved;
        this.availableQuantity = total - reserved;
    }

    public boolean isLowStock() {
        return availableQuantity < lowStockThreshold;
    }

    // Getters & Setters
    public String getProductId() { return productId; }
    public String getProductName() { return productName; }
    public int getTotalQuantity() { return totalQuantity; }
    public int getReservedQuantity() { return reservedQuantity; }
    public int getAvailableQuantity() { return availableQuantity; }
    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int lowStockThreshold) { 
        this.lowStockThreshold = lowStockThreshold; 
    }
    public String getCategory() { return category; }
}
