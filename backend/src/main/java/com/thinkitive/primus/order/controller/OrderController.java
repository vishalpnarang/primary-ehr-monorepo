package com.thinkitive.primus.order.controller;

import com.thinkitive.primus.order.dto.*;
import com.thinkitive.primus.order.service.OrderService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController extends BaseController {

    private final OrderService orderService;

    /** POST /api/v1/orders/lab */
    @PostMapping("/lab")
    public ResponseEntity<ApiResponse> createLabOrder(@Valid @RequestBody LabOrderRequest request) {
        return created(orderService.createLabOrder(request), "Lab order created");
    }

    /** POST /api/v1/orders/imaging */
    @PostMapping("/imaging")
    public ResponseEntity<ApiResponse> createImagingOrder(@Valid @RequestBody ImagingOrderRequest request) {
        return created(orderService.createImagingOrder(request), "Imaging order created");
    }

    /** POST /api/v1/orders/referral */
    @PostMapping("/referral")
    public ResponseEntity<ApiResponse> createReferral(@Valid @RequestBody ReferralRequest request) {
        return created(orderService.createReferral(request), "Referral created");
    }

    /** GET /api/v1/orders/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getOrder(@PathVariable UUID uuid) {
        return ok(orderService.getOrder(uuid));
    }

    /** GET /api/v1/orders/patient/{patientUuid} */
    @GetMapping("/patient/{patientUuid}")
    public ResponseEntity<ApiResponse> getOrdersByPatient(@PathVariable UUID patientUuid) {
        return ok(orderService.getOrdersByPatient(patientUuid));
    }

    /** POST /api/v1/orders/lab/{uuid}/result — receive lab result (webhook from Quest/LabCorp) */
    @PostMapping("/lab/{uuid}/result")
    public ResponseEntity<ApiResponse> receiveLabResult(
            @PathVariable UUID uuid,
            @Valid @RequestBody LabResultRequest request) {
        return ok(orderService.receiveLabResult(uuid, request), "Lab result received");
    }

    /** POST /api/v1/orders/lab/{uuid}/review — provider reviews result */
    @PostMapping("/lab/{uuid}/review")
    public ResponseEntity<ApiResponse> reviewResult(
            @PathVariable UUID uuid,
            @Valid @RequestBody OrderReviewRequest request) {
        return ok(orderService.reviewResult(uuid, request), "Result reviewed");
    }
}
