package com.thinkitive.primus.billing.controller;

import com.thinkitive.primus.billing.dto.*;
import com.thinkitive.primus.billing.service.InvoiceService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.thinkitive.primus.shared.security.Roles;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_BILLING_ROLE)
public class InvoiceController extends BaseController {

    private final InvoiceService invoiceService;

    /** POST /api/v1/invoices */
    @PostMapping
    public ResponseEntity<ApiResponse> createInvoice(
            @Valid @RequestBody CreateInvoiceRequest request) {
        return created(invoiceService.create(request), "Invoice created");
    }

    /** GET /api/v1/invoices/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getInvoice(@PathVariable String uuid) {
        return ok(invoiceService.getByUuid(uuid));
    }

    /** GET /api/v1/invoices/patient/{patientId} */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse> getPatientInvoices(@PathVariable Long patientId) {
        return ok(invoiceService.getByPatient(patientId));
    }

    /** POST /api/v1/invoices/{uuid}/line-items */
    @PostMapping("/{uuid}/line-items")
    public ResponseEntity<ApiResponse> addLineItem(
            @PathVariable String uuid,
            @Valid @RequestBody AddLineItemRequest request) {
        return created(invoiceService.addLineItem(uuid, request), "Line item added");
    }

    /** POST /api/v1/invoices/{uuid}/send */
    @PostMapping("/{uuid}/send")
    public ResponseEntity<ApiResponse> sendInvoice(@PathVariable String uuid) {
        return ok(invoiceService.send(uuid), "Invoice sent");
    }

    /** POST /api/v1/invoices/{uuid}/mark-paid */
    @PostMapping("/{uuid}/mark-paid")
    public ResponseEntity<ApiResponse> markPaid(@PathVariable String uuid) {
        return ok(invoiceService.markPaid(uuid), "Invoice marked as paid");
    }

    /** POST /api/v1/invoices/{uuid}/void */
    @PostMapping("/{uuid}/void")
    public ResponseEntity<ApiResponse> voidInvoice(@PathVariable String uuid) {
        return ok(invoiceService.voidInvoice(uuid), "Invoice voided");
    }

    /** POST /api/v1/invoices/generate/encounter/{encounterId} */
    @PostMapping("/generate/encounter/{encounterId}")
    public ResponseEntity<ApiResponse> generateFromEncounter(@PathVariable Long encounterId) {
        return created(invoiceService.generateFromEncounter(encounterId), "Invoice generated from encounter");
    }
}
