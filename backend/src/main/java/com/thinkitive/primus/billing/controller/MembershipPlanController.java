package com.thinkitive.primus.billing.controller;

import com.thinkitive.primus.billing.dto.*;
import com.thinkitive.primus.billing.service.MembershipPlanService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/plans")
@RequiredArgsConstructor
public class MembershipPlanController extends BaseController {

    private final MembershipPlanService membershipPlanService;

    // ── Plans ─────────────────────────────────────────────────────────────────

    /** GET /api/v1/plans */
    @GetMapping
    public ResponseEntity<ApiResponse> getPlans() {
        return ok(membershipPlanService.getPlans());
    }

    /** POST /api/v1/plans */
    @PostMapping
    public ResponseEntity<ApiResponse> createPlan(
            @Valid @RequestBody CreateMembershipPlanRequest request) {
        return created(membershipPlanService.createPlan(request), "Membership plan created");
    }

    // ── Enrollments ───────────────────────────────────────────────────────────

    /** POST /api/v1/plans/{planUuid}/enroll */
    @PostMapping("/{planUuid}/enroll")
    public ResponseEntity<ApiResponse> enrollPatient(
            @PathVariable String planUuid,
            @Valid @RequestBody EnrollPatientRequest request) {
        return created(membershipPlanService.enrollPatient(planUuid, request), "Patient enrolled");
    }

    /** POST /api/v1/plans/enrollments/{enrollmentUuid}/cancel */
    @PostMapping("/enrollments/{enrollmentUuid}/cancel")
    public ResponseEntity<ApiResponse> cancelEnrollment(@PathVariable String enrollmentUuid) {
        return ok(membershipPlanService.cancelEnrollment(enrollmentUuid), "Enrollment cancelled");
    }

    /** GET /api/v1/plans/enrollments/patient/{patientId} */
    @GetMapping("/enrollments/patient/{patientId}")
    public ResponseEntity<ApiResponse> getPatientEnrollment(@PathVariable Long patientId) {
        return ok(membershipPlanService.getPatientEnrollment(patientId));
    }
}
