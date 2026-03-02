package com.inspire.backend.staff;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @GetMapping
    public List<Staff> listStaff(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "dept", required = false) String department,
            @RequestParam(value = "sort", required = false) String sortBy
    ) {
        return staffService.getStaff(query, department, sortBy);
    }

    @GetMapping("/{id}")
    public Staff getOne(@PathVariable String id) {
        return staffService.getById(id);
    }

    @PostMapping
    public Staff addStaff(@RequestBody StaffCreateRequest req) {
        return staffService.addStaff(req);
    }

    @DeleteMapping("/{id}")
    public void deleteStaff(@PathVariable String id) {
        staffService.deleteStaff(id);
    }

    @PostMapping("/{id}/department")
    public Staff changeDepartment(@PathVariable String id, @RequestBody DepartmentChangeRequest req) {
        return staffService.changeDepartment(id, req);
    }

    @PostMapping("/{id}/salary/hike")
    public Staff hikeSalary(@PathVariable String id, @RequestBody SalaryHikeRequest req) {
        return staffService.hikeSalary(id, req);
    }

    @PostMapping("/{id}/meetings")
    public Meeting scheduleMeeting(@PathVariable String id, @RequestBody MeetingCreateRequest req) {
        return staffService.scheduleMeeting(id, req);
    }

    @GetMapping("/{id}/meetings")
    public List<Meeting> meetings(@PathVariable String id) {
        return staffService.getMeetings(id);
    }
}
