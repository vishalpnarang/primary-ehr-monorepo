package com.thinkitive.primus.billing.controller;

import com.thinkitive.primus.billing.dto.*;
import com.thinkitive.primus.billing.service.PaymentService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController extends BaseController {

    private final PaymentService paymentService;

    // ── Transactions ──────────────────────────────────────────────────────────

    /** POST /api/v1/payments */
    @PostMapping
    public ResponseEntity<ApiResponse> recordPayment(
            @Valid @RequestBody RecordPaymentRequest request) {
        return created(paymentService.recordPayment(request), "Payment recorded");
    }

    /** GET /api/v1/payments/history/patient/{patientId} */
    @GetMapping("/history/patient/{patientId}")
    public ResponseEntity<ApiResponse> getPaymentHistory(@PathVariable Long patientId) {
        return ok(paymentService.getPaymentHistory(patientId));
    }

    // ── Saved Methods ─────────────────────────────────────────────────────────

    /** POST /api/v1/payments/methods */
    @PostMapping("/methods")
    public ResponseEntity<ApiResponse> savePaymentMethod(
            @Valid @RequestBody SavePaymentMethodRequest request) {
        return created(paymentService.savePaymentMethod(request), "Payment method saved");
    }

    /** GET /api/v1/payments/methods/patient/{patientId} */
    @GetMapping("/methods/patient/{patientId}")
    public ResponseEntity<ApiResponse> getPatientMethods(@PathVariable Long patientId) {
        return ok(paymentService.getPatientMethods(patientId));
    }

    // ── Scheduled Payments ────────────────────────────────────────────────────

    /** POST /api/v1/payments/schedule */
    @PostMapping("/schedule")
    public ResponseEntity<ApiResponse> schedulePayment(
            @Valid @RequestBody SchedulePaymentRequest request) {
        return created(paymentService.schedulePayment(request), "Payment scheduled");
    }

    // ── Credits ───────────────────────────────────────────────────────────────

    /** POST /api/v1/payments/credits */
    @PostMapping("/credits")
    public ResponseEntity<ApiResponse> applyCredit(
            @Valid @RequestBody ApplyCreditRequest request) {
        return created(paymentService.applyCredit(request), "Credit applied");
    }

    /** GET /api/v1/payments/credits/patient/{patientId} */
    @GetMapping("/credits/patient/{patientId}")
    public ResponseEntity<ApiResponse> getPatientCredits(@PathVariable Long patientId) {
        return ok(paymentService.getPatientCredits(patientId));
    }
}
