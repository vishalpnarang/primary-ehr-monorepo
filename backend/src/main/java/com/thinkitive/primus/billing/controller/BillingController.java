package com.thinkitive.primus.billing.controller;

import com.thinkitive.primus.billing.dto.*;
import com.thinkitive.primus.billing.service.BillingService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController extends BaseController {

    private final BillingService billingService;

    /** GET /api/v1/billing/claims?status= */
    @GetMapping("/claims")
    public ResponseEntity<ApiResponse> listClaims(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(billingService.listClaims(status, pageable)));
    }

    /** GET /api/v1/billing/claims/{uuid} */
    @GetMapping("/claims/{uuid}")
    public ResponseEntity<ApiResponse> getClaim(@PathVariable String uuid) {
        return ok(billingService.getClaim(uuid));
    }

    /** POST /api/v1/billing/claims/{uuid}/submit */
    @PostMapping("/claims/{uuid}/submit")
    public ResponseEntity<ApiResponse> submitClaim(@PathVariable String uuid) {
        return ok(billingService.submitClaim(uuid), "Claim submitted to clearinghouse");
    }

    /** POST /api/v1/billing/claims/{uuid}/deny */
    @PostMapping("/claims/{uuid}/deny")
    public ResponseEntity<ApiResponse> denyClaim(
            @PathVariable String uuid,
            @Valid @RequestBody ClaimDenyRequest request) {
        return ok(billingService.denyClaim(uuid, request), "Claim denial recorded");
    }

    /** POST /api/v1/billing/claims/{uuid}/appeal */
    @PostMapping("/claims/{uuid}/appeal")
    public ResponseEntity<ApiResponse> appealClaim(
            @PathVariable String uuid,
            @Valid @RequestBody ClaimAppealRequest request) {
        return ok(billingService.appealClaim(uuid, request), "Appeal filed");
    }

    /** GET /api/v1/billing/kpi */
    @GetMapping("/kpi")
    public ResponseEntity<ApiResponse> getBillingKpi() {
        return ok(billingService.getBillingKpi());
    }

    /** POST /api/v1/billing/payments */
    @PostMapping("/payments")
    public ResponseEntity<ApiResponse> recordPayment(@Valid @RequestBody PaymentRequest request) {
        return created(billingService.recordPayment(request), "Payment recorded");
    }

    /** GET /api/v1/billing/patient/{patientUuid}/balance */
    @GetMapping("/patient/{patientUuid}/balance")
    public ResponseEntity<ApiResponse> getPatientBalance(@PathVariable String patientUuid) {
        return ok(billingService.getPatientBalance(patientUuid));
    }

    /** GET /api/v1/billing/ar-aging */
    @GetMapping("/ar-aging")
    public ResponseEntity<ApiResponse> getArAging() {
        return ok(billingService.getArAging());
    }
}
