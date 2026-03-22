package com.thinkitive.primus.inventory.controller;

import com.thinkitive.primus.inventory.dto.*;
import com.thinkitive.primus.inventory.service.InventoryService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.thinkitive.primus.shared.security.Roles;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_ADMIN_ROLE)
public class InventoryController extends BaseController {

    private final InventoryService inventoryService;

    // ── Items ─────────────────────────────────────────────────────────────────

    /** GET /api/v1/inventory/items */
    @GetMapping("/items")
    public ResponseEntity<ApiResponse> getItems() {
        return ok(inventoryService.getItems());
    }

    /** POST /api/v1/inventory/items */
    @PostMapping("/items")
    public ResponseEntity<ApiResponse> createItem(
            @Valid @RequestBody CreateInventoryItemRequest request) {
        return created(inventoryService.createItem(request), "Inventory item created");
    }

    /** PUT /api/v1/inventory/items/{uuid} */
    @PutMapping("/items/{uuid}")
    public ResponseEntity<ApiResponse> updateItem(
            @PathVariable String uuid,
            @Valid @RequestBody UpdateInventoryItemRequest request) {
        return ok(inventoryService.updateItem(uuid, request), "Inventory item updated");
    }

    /** GET /api/v1/inventory/low-stock */
    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse> getLowStockItems() {
        return ok(inventoryService.getLowStockItems());
    }

    // ── Transactions ──────────────────────────────────────────────────────────

    /** POST /api/v1/inventory/transactions */
    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse> recordTransaction(
            @Valid @RequestBody RecordTransactionRequest request) {
        return created(inventoryService.recordTransaction(request), "Transaction recorded");
    }

    /** GET /api/v1/inventory/items/{uuid}/transactions */
    @GetMapping("/items/{uuid}/transactions")
    public ResponseEntity<ApiResponse> getItemTransactions(@PathVariable String uuid) {
        return ok(inventoryService.getItemTransactions(uuid));
    }
}
