package com.thinkitive.primus.inventory.service;

import com.thinkitive.primus.inventory.dto.*;
import com.thinkitive.primus.inventory.entity.InventoryItem;
import com.thinkitive.primus.inventory.entity.InventoryTransaction;
import com.thinkitive.primus.inventory.repository.InventoryItemRepository;
import com.thinkitive.primus.inventory.repository.InventoryTransactionRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryServiceImpl implements InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    // ── Items ─────────────────────────────────────────────────────────────────

    @Override
    public List<InventoryItemDto> getItems() {
        Long tenantId = TenantContext.getTenantId();
        return inventoryItemRepository.findByTenantIdAndArchiveFalse(tenantId)
                .stream()
                .map(this::toItemDto)
                .toList();
    }

    @Override
    @Transactional
    public InventoryItemDto createItem(CreateInventoryItemRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating inventory item tenant={} name={}", tenantId, request.getItemName());

        InventoryItem item = InventoryItem.builder()
                .tenantId(tenantId)
                .formularyId(request.getFormularyId())
                .itemName(request.getItemName())
                .sku(request.getSku())
                .category(request.getCategory())
                .quantityOnHand(request.getQuantityOnHand() != null ? request.getQuantityOnHand() : 0)
                .reorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10)
                .unitCost(request.getUnitCost())
                .locationId(request.getLocationId())
                .build();

        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("Inventory item created uuid={}", saved.getUuid());
        return toItemDto(saved);
    }

    @Override
    @Transactional
    public InventoryItemDto updateItem(String uuid, UpdateInventoryItemRequest request) {
        Long tenantId = TenantContext.getTenantId();
        InventoryItem item = requireItem(tenantId, uuid);

        if (request.getItemName()       != null) item.setItemName(request.getItemName());
        if (request.getSku()            != null) item.setSku(request.getSku());
        if (request.getCategory()       != null) item.setCategory(request.getCategory());
        if (request.getQuantityOnHand() != null) item.setQuantityOnHand(request.getQuantityOnHand());
        if (request.getReorderLevel()   != null) item.setReorderLevel(request.getReorderLevel());
        if (request.getUnitCost()       != null) item.setUnitCost(request.getUnitCost());
        if (request.getLocationId()     != null) item.setLocationId(request.getLocationId());

        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("Inventory item updated uuid={}", uuid);
        return toItemDto(saved);
    }

    // ── Transactions ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public InventoryTransactionDto recordTransaction(RecordTransactionRequest request) {
        Long tenantId = TenantContext.getTenantId();
        InventoryItem item = inventoryItemRepository.findById(request.getItemId())
                .filter(i -> i.getTenantId().equals(tenantId) && !i.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Inventory item not found: " + request.getItemId()));

        InventoryTransaction.TransactionType type = parseTransactionType(request.getTransactionType());

        // Adjust quantity on hand
        int delta = switch (type) {
            case RECEIPT -> Math.abs(request.getQuantity());
            case DISPENSE, TRANSFER -> -Math.abs(request.getQuantity());
            case ADJUSTMENT -> request.getQuantity();
        };
        item.setQuantityOnHand(item.getQuantityOnHand() + delta);
        inventoryItemRepository.save(item);

        InventoryTransaction tx = InventoryTransaction.builder()
                .tenantId(tenantId)
                .itemId(item.getId())
                .transactionType(type)
                .quantity(request.getQuantity())
                .referenceNumber(request.getReferenceNumber())
                .notes(request.getNotes())
                .performedBy(request.getPerformedBy())
                .build();

        InventoryTransaction saved = inventoryTransactionRepository.save(tx);
        log.info("Inventory transaction recorded uuid={} type={}", saved.getUuid(), type);
        return toTransactionDto(saved);
    }

    @Override
    public List<InventoryTransactionDto> getItemTransactions(String itemUuid) {
        Long tenantId = TenantContext.getTenantId();
        InventoryItem item = requireItem(tenantId, itemUuid);
        return inventoryTransactionRepository
                .findByItemIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(item.getId(), tenantId)
                .stream()
                .map(this::toTransactionDto)
                .toList();
    }

    @Override
    public List<InventoryItemDto> getLowStockItems() {
        Long tenantId = TenantContext.getTenantId();
        return inventoryItemRepository.findLowStockItems(tenantId)
                .stream()
                .map(this::toItemDto)
                .toList();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private InventoryItem requireItem(Long tenantId, String uuid) {
        return inventoryItemRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(i -> !i.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Inventory item not found: " + uuid));
    }

    private InventoryTransaction.TransactionType parseTransactionType(String value) {
        try {
            return InventoryTransaction.TransactionType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Invalid transaction type: " + value);
        }
    }

    private InventoryItemDto toItemDto(InventoryItem i) {
        boolean lowStock = i.getQuantityOnHand() <= i.getReorderLevel();
        return InventoryItemDto.builder()
                .uuid(i.getUuid())
                .formularyId(i.getFormularyId())
                .itemName(i.getItemName())
                .sku(i.getSku())
                .category(i.getCategory())
                .quantityOnHand(i.getQuantityOnHand())
                .reorderLevel(i.getReorderLevel())
                .unitCost(i.getUnitCost())
                .locationId(i.getLocationId())
                .lowStock(lowStock)
                .createdAt(i.getCreatedAt())
                .modifiedAt(i.getModifiedAt())
                .build();
    }

    private InventoryTransactionDto toTransactionDto(InventoryTransaction t) {
        return InventoryTransactionDto.builder()
                .uuid(t.getUuid())
                .itemId(t.getItemId())
                .transactionType(t.getTransactionType() != null ? t.getTransactionType().name() : null)
                .quantity(t.getQuantity())
                .referenceNumber(t.getReferenceNumber())
                .notes(t.getNotes())
                .performedBy(t.getPerformedBy())
                .createdAt(t.getCreatedAt())
                .modifiedAt(t.getModifiedAt())
                .build();
    }
}
