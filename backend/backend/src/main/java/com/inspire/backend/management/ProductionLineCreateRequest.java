package com.inspire.backend.management;

import java.util.List;

public class ProductionLineCreateRequest {
    private String name;
    private String product;
    private List<String> machineIds;

    public String getName() { return name; }
    public String getProduct() { return product; }
    public List<String> getMachineIds() { return machineIds; }

    public void setName(String name) { this.name = name; }
    public void setProduct(String product) { this.product = product; }
    public void setMachineIds(List<String> machineIds) { this.machineIds = machineIds; }
}
