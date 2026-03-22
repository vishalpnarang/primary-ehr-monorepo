package com.thinkitive.primus.crm.controller;

import com.thinkitive.primus.crm.dto.*;
import com.thinkitive.primus.crm.service.LeadService;
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
@RequestMapping("/api/v1/crm/leads")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_ADMIN_ROLE)
public class LeadController extends BaseController {

    private final LeadService leadService;

    /** GET /api/v1/crm/leads */
    @GetMapping
    public ResponseEntity<ApiResponse> getLeads(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(leadService.getLeads(status, pageable)));
    }

    /** GET /api/v1/crm/leads/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getLead(@PathVariable String uuid) {
        return ok(leadService.getLead(uuid));
    }

    /** POST /api/v1/crm/leads */
    @PostMapping
    public ResponseEntity<ApiResponse> createLead(
            @Valid @RequestBody CreateLeadRequest request) {
        return created(leadService.createLead(request), "Lead created");
    }

    /** PUT /api/v1/crm/leads/{uuid} */
    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse> updateLead(
            @PathVariable String uuid,
            @Valid @RequestBody UpdateLeadRequest request) {
        return ok(leadService.updateLead(uuid, request), "Lead updated");
    }

    /** DELETE /api/v1/crm/leads/{uuid} */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse> deleteLead(@PathVariable String uuid) {
        leadService.deleteLead(uuid);
        return noContent();
    }
}
