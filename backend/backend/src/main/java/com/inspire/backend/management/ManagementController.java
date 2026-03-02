package com.inspire.backend.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
@RequestMapping("/api/management")
public class ManagementController {

    @Autowired
    private ManagementService service;

    @GetMapping("/machines")
    public List<Machine> getMachines(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "sort", required = false) String sortBy) {
        return service.getMachines(query, sortBy);
    }

    @GetMapping("/machines/{id}")
    public Machine getMachine(@PathVariable String id) {
        return service.getMachineById(id);
    }

    @PostMapping("/machines")
    public Machine addMachine(@RequestBody MachineCreateRequest request) {
        return service.addMachine(request);
    }

    @GetMapping("/lines")
    public List<ProductionLine> getLines() {
        return service.getLines();
    }

    @PostMapping("/lines")
    public ProductionLine createLine(@RequestBody ProductionLineCreateRequest request) {
        return service.createLine(request);
    }

    @PostMapping("/lines/undo")
    public ProductionLine undoLine() {
        return service.undoLastLine();
    }

    @GetMapping("/maintenance/next")
    public MaintenanceTicket getNextTicket() {
        return service.getNextMaintenance();
    }

    @GetMapping("/maintenance/urgent")
    public MaintenanceTicket getUrgentTicket() {
        return service.getUrgentMaintenance();
    }
    @DeleteMapping("/machines/{id}")
public void deleteMachine(@PathVariable String id) {
    service.deleteMachine(id);
}

}
