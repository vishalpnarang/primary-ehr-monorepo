package com.thinkitive.primus.affiliate.controller;

import com.thinkitive.primus.affiliate.dto.*;
import com.thinkitive.primus.affiliate.service.BrokerService;
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
@RequestMapping("/api/v1/brokers")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_TENANT_MGMT_ROLE)
public class BrokerController extends BaseController {

    private final BrokerService brokerService;

    /** GET /api/v1/brokers */
    @GetMapping
    public ResponseEntity<ApiResponse> getBrokers(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(brokerService.getBrokers(status, pageable)));
    }

    /** GET /api/v1/brokers/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getBroker(@PathVariable String uuid) {
        return ok(brokerService.getBroker(uuid));
    }

    /** POST /api/v1/brokers */
    @PostMapping
    public ResponseEntity<ApiResponse> createBroker(
            @Valid @RequestBody CreateBrokerRequest request) {
        return created(brokerService.createBroker(request), "Broker created");
    }

    /** PUT /api/v1/brokers/{uuid} */
    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse> updateBroker(
            @PathVariable String uuid,
            @Valid @RequestBody UpdateBrokerRequest request) {
        return ok(brokerService.updateBroker(uuid, request), "Broker updated");
    }

    /** DELETE /api/v1/brokers/{uuid} */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse> deleteBroker(@PathVariable String uuid) {
        brokerService.deleteBroker(uuid);
        return noContent();
    }
}
