package com.thinkitive.primus.employer.controller;

import com.thinkitive.primus.employer.dto.*;
import com.thinkitive.primus.employer.service.EmployerService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.thinkitive.primus.shared.security.Roles;

@RestController
@RequestMapping("/api/v1/employers")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_ADMIN_ROLE)
public class EmployerController extends BaseController {

    private final EmployerService employerService;

    // ── Employers ─────────────────────────────────────────────────────────────

    /** GET /api/v1/employers */
    @GetMapping
    public ResponseEntity<ApiResponse> getEmployers(
            @PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(employerService.getEmployers(pageable)));
    }

    /** GET /api/v1/employers/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getEmployer(@PathVariable String uuid) {
        return ok(employerService.getEmployer(uuid));
    }

    /** POST /api/v1/employers */
    @PostMapping
    public ResponseEntity<ApiResponse> createEmployer(
            @Valid @RequestBody CreateEmployerRequest request) {
        return created(employerService.createEmployer(request), "Employer created");
    }

    /** PUT /api/v1/employers/{uuid} */
    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse> updateEmployer(
            @PathVariable String uuid,
            @Valid @RequestBody UpdateEmployerRequest request) {
        return ok(employerService.updateEmployer(uuid, request), "Employer updated");
    }

    /** DELETE /api/v1/employers/{uuid} */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse> deleteEmployer(@PathVariable String uuid) {
        employerService.deleteEmployer(uuid);
        return noContent();
    }

    // ── Employees ─────────────────────────────────────────────────────────────

    /** GET /api/v1/employers/{uuid}/employees */
    @GetMapping("/{uuid}/employees")
    public ResponseEntity<ApiResponse> getEmployees(@PathVariable String uuid) {
        return ok(employerService.getEmployees(uuid));
    }

    /** POST /api/v1/employers/{uuid}/employees */
    @PostMapping("/{uuid}/employees")
    public ResponseEntity<ApiResponse> addEmployee(
            @PathVariable String uuid,
            @Valid @RequestBody AddEmployeeRequest request) {
        return created(employerService.addEmployee(uuid, request), "Employee added");
    }

    /** DELETE /api/v1/employers/{uuid}/employees/{employeeUuid} */
    @DeleteMapping("/{uuid}/employees/{employeeUuid}")
    public ResponseEntity<ApiResponse> removeEmployee(
            @PathVariable String uuid,
            @PathVariable String employeeUuid) {
        employerService.removeEmployee(uuid, employeeUuid);
        return noContent();
    }

    // ── Plans ─────────────────────────────────────────────────────────────────

    /** GET /api/v1/employers/{uuid}/plans */
    @GetMapping("/{uuid}/plans")
    public ResponseEntity<ApiResponse> getPlans(@PathVariable String uuid) {
        return ok(employerService.getPlans(uuid));
    }

    /** POST /api/v1/employers/{uuid}/plans */
    @PostMapping("/{uuid}/plans")
    public ResponseEntity<ApiResponse> addPlan(
            @PathVariable String uuid,
            @Valid @RequestBody AddEmployerPlanRequest request) {
        return created(employerService.addPlan(uuid, request), "Plan added");
    }
}
