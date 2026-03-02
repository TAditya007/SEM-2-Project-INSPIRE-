package com.inspire.backend.management;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ManagementService {

    // HashMap for O(1) machine lookup by ID
    private final HashMap<String, Machine> machinesById = new HashMap<>();
    
    // ArrayList for ordered machine list (supports sorting)
    private final List<Machine> machinesOrdered = new ArrayList<>();
    
    // LinkedList Queue for maintenance tickets (FIFO)
    private final Queue<MaintenanceTicket> maintenanceQueue = new LinkedList<>();
    
    // PriorityQueue for urgent maintenance (by priority)
    private final PriorityQueue<MaintenanceTicket> urgentQueue = new PriorityQueue<>();
    
    // HashMap for production lines
    private final HashMap<String, ProductionLine> linesById = new HashMap<>();
    private final List<ProductionLine> linesOrdered = new ArrayList<>();
    
    // Stack for undo operations (line design)
    private final Stack<ProductionLine> lineHistory = new Stack<>();

    private int nextMachineNum = 1;
    private int nextLineNum = 1;
    private int nextTicketNum = 1;

    public ManagementService() {
        seedCarFactoryData();
    }

    // Seed realistic car factory data
    private void seedCarFactoryData() {
        // Body Shop Machines
        addInitialMachine("WELD-01", "Robotic Welder A", "Welder", "Body Shop", "RUNNING", 92);
        addInitialMachine("WELD-02", "Robotic Welder B", "Welder", "Body Shop", "RUNNING", 88);
        addInitialMachine("STAMP-01", "Body Stamping Press", "Press", "Body Shop", "IDLE", 85);
        
        // Paint Shop Machines
        addInitialMachine("PAINT-01", "Auto Paint Sprayer A", "Painter", "Paint Shop", "RUNNING", 90);
        addInitialMachine("PAINT-02", "Auto Paint Sprayer B", "Painter", "Paint Shop", "RUNNING", 87);
        addInitialMachine("CURE-01", "Paint Curing Oven", "Oven", "Paint Shop", "RUNNING", 95);
        
        // Assembly Line Machines
        addInitialMachine("ASM-ENGINE-01", "Engine Install Robot", "Assembler", "Assembly", "RUNNING", 91);
        addInitialMachine("ASM-DASH-01", "Dashboard Assembly", "Assembler", "Assembly", "RUNNING", 89);
        addInitialMachine("ASM-SEATS-01", "Seat Installation", "Assembler", "Assembly", "IDLE", 86);
        addInitialMachine("ASM-WHEELS-01", "Wheel Mounting Robot", "Assembler", "Assembly", "RUNNING", 93);
        
        // Quality Control
        addInitialMachine("QC-01", "Vision Inspection System", "Inspector", "QC", "RUNNING", 96);
        addInitialMachine("QC-02", "Leak Testing Station", "Tester", "QC", "MAINTENANCE", 78);

        // Production Lines
        ProductionLine sedanLine = new ProductionLine(
            "LINE-SEDAN",
            "Sedan Production Line",
            "Compact Sedan",
            Arrays.asList("STAMP-01", "WELD-01", "PAINT-01", "CURE-01", 
                         "ASM-ENGINE-01", "ASM-DASH-01", "ASM-SEATS-01", 
                         "ASM-WHEELS-01", "QC-01")
        );
        linesById.put(sedanLine.getId(), sedanLine);
        linesOrdered.add(sedanLine);

        ProductionLine suvLine = new ProductionLine(
            "LINE-SUV",
            "SUV Production Line",
            "Luxury SUV",
            Arrays.asList("STAMP-01", "WELD-02", "PAINT-02", "CURE-01",
                         "ASM-ENGINE-01", "ASM-DASH-01", "ASM-SEATS-01",
                         "ASM-WHEELS-01", "QC-02")
        );
        linesById.put(suvLine.getId(), suvLine);
        linesOrdered.add(suvLine);

        // Maintenance tickets
        addMaintenanceTicket("QC-02", "Hydraulic leak detected in testing chamber", 4);
        addMaintenanceTicket("STAMP-01", "Calibration needed for precision", 2);
        addMaintenanceTicket("ASM-SEATS-01", "Sensor misalignment", 3);
    }

    private void addInitialMachine(String id, String name, String type,
                                   String dept, String status, int eff) {
        int daysAgo = (int)(Math.random() * 365);
        Machine m = new Machine(id, name, type, dept, status, eff, 
                               LocalDateTime.now().minusDays(daysAgo));
        machinesById.put(id, m);
        machinesOrdered.add(m);
    }

    private void addMaintenanceTicket(String machineId, String desc, int priority) {
        String id = String.format("TICKET-%03d", nextTicketNum++);
        MaintenanceTicket ticket = new MaintenanceTicket(id, machineId, desc, priority);
        maintenanceQueue.add(ticket);
        if (priority >= 3) {
            urgentQueue.add(ticket);
        }
    }

    // ========== SEARCHING ALGORITHMS ==========
    
    // Linear search (O(n)) - for unsorted, partial matches
    public List<Machine> searchMachinesLinear(String query) {
        if (query == null || query.isBlank()) {
            return new ArrayList<>(machinesOrdered);
        }
        String q = query.toLowerCase();
        List<Machine> results = new ArrayList<>();
        for (Machine m : machinesOrdered) {
            if (m.getId().toLowerCase().contains(q) ||
                m.getName().toLowerCase().contains(q) ||
                m.getStatus().toLowerCase().contains(q) ||
                m.getDepartment().toLowerCase().contains(q)) {
                results.add(m);
            }
        }
        return results;
    }

    // Binary search (O(log n)) - requires sorted array by ID
    public Machine binarySearchById(String id) {
        List<Machine> sorted = new ArrayList<>(machinesOrdered);
        sorted.sort(Comparator.comparing(Machine::getId));
        
        int left = 0, right = sorted.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int cmp = sorted.get(mid).getId().compareTo(id);
            if (cmp == 0) return sorted.get(mid);
            if (cmp < 0) left = mid + 1;
            else right = mid - 1;
        }
        return null;
    }

    // HashMap lookup (O(1)) - fastest for exact ID
    public Machine getMachineById(String id) {
        return machinesById.get(id);
    }

    // ========== SORTING ALGORITHMS ==========
    
    // QuickSort by efficiency (in-place, O(n log n) average)
    public List<Machine> getMachinesSortedByEfficiency() {
        List<Machine> sorted = new ArrayList<>(machinesOrdered);
        quickSortByEfficiency(sorted, 0, sorted.size() - 1);
        return sorted;
    }

    private void quickSortByEfficiency(List<Machine> list, int low, int high) {
        if (low < high) {
            int pi = partition(list, low, high);
            quickSortByEfficiency(list, low, pi - 1);
            quickSortByEfficiency(list, pi + 1, high);
        }
    }

    private int partition(List<Machine> list, int low, int high) {
        int pivot = list.get(high).getEfficiency();
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (list.get(j).getEfficiency() >= pivot) { // descending
                i++;
                Collections.swap(list, i, j);
            }
        }
        Collections.swap(list, i + 1, high);
        return i + 1;
    }

    // MergeSort by name (stable, O(n log n))
    public List<Machine> getMachinesSortedByName() {
        List<Machine> sorted = new ArrayList<>(machinesOrdered);
        mergeSortByName(sorted, 0, sorted.size() - 1);
        return sorted;
    }

    private void mergeSortByName(List<Machine> list, int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSortByName(list, left, mid);
            mergeSortByName(list, mid + 1, right);
            merge(list, left, mid, right);
        }
    }

    private void merge(List<Machine> list, int left, int mid, int right) {
        List<Machine> temp = new ArrayList<>(list.subList(left, right + 1));
        int i = 0, j = mid - left + 1, k = left;
        
        while (i <= mid - left && j < temp.size()) {
            if (temp.get(i).getName().compareTo(temp.get(j).getName()) <= 0) {
                list.set(k++, temp.get(i++));
            } else {
                list.set(k++, temp.get(j++));
            }
        }
        while (i <= mid - left) list.set(k++, temp.get(i++));
        while (j < temp.size()) list.set(k++, temp.get(j++));
    }

    // ========== CRUD OPERATIONS ==========
    
    public List<Machine> getMachines(String query, String sortBy) {
        List<Machine> result;
        
        // Search phase
        if (query != null && !query.isBlank()) {
            result = searchMachinesLinear(query); // O(n)
        } else {
            result = new ArrayList<>(machinesOrdered);
        }
        
        // Sort phase
        if ("efficiency".equals(sortBy)) {
            quickSortByEfficiency(result, 0, result.size() - 1);
        } else if ("name".equals(sortBy)) {
            result.sort(Comparator.comparing(Machine::getName));
        }
        
        return result;
    }

    public Machine addMachine(MachineCreateRequest req) {
        String id = String.format("M-%03d", nextMachineNum++);
        Machine m = new Machine(id, req.getName(), req.getType(), req.getDepartment(),
                               req.getStatus(), req.getEfficiency(), LocalDateTime.now());
        machinesById.put(id, m); // O(1)
        machinesOrdered.add(m);   // O(1) amortized
        return m;
    }

    public ProductionLine createLine(ProductionLineCreateRequest req) {
        String id = String.format("LINE-%03d", nextLineNum++);
        ProductionLine line = new ProductionLine(id, req.getName(), req.getProduct(), req.getMachineIds());
        linesById.put(id, line);
        linesOrdered.add(line);
        lineHistory.push(line); // Stack for undo
        return line;
    }

    public List<ProductionLine> getLines() {
        return new ArrayList<>(linesOrdered);
    }

    public ProductionLine undoLastLine() {
        if (!lineHistory.isEmpty()) {
            ProductionLine last = lineHistory.pop();
            linesById.remove(last.getId());
            linesOrdered.remove(last);
            return last;
        }
        return null;
    }
    public boolean deleteMachine(String id) {
    Machine removed = machinesById.remove(id);
    if (removed != null) {
        machinesOrdered.removeIf(m -> m.getId().equals(id));
        return true;
    }
    return false;
}


    // ========== MAINTENANCE QUEUE ==========
    
    public MaintenanceTicket getNextMaintenance() {
        return maintenanceQueue.poll(); // FIFO
    }

    public MaintenanceTicket getUrgentMaintenance() {
        return urgentQueue.poll(); // Priority queue
    }

    public List<MaintenanceTicket> getAllMaintenanceTickets() {
        return new ArrayList<>(maintenanceQueue);
    }
}
