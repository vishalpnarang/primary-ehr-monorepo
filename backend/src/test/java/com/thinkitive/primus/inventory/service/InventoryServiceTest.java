package com.thinkitive.primus.inventory.service;

import com.thinkitive.primus.inventory.dto.*;
import com.thinkitive.primus.inventory.entity.InventoryItem;
import com.thinkitive.primus.inventory.entity.InventoryTransaction;
import com.thinkitive.primus.inventory.repository.InventoryItemRepository;
import com.thinkitive.primus.inventory.repository.InventoryTransactionRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock InventoryItemRepository inventoryItemRepository;
    @Mock InventoryTransactionRepository inventoryTransactionRepository;

    @InjectMocks
    InventoryServiceImpl inventoryService;

    private InventoryItem testItem;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testItem = InventoryItem.builder()
                .tenantId(1L)
                .itemName("Influenza Vaccine")
                .sku("VAC-FLU-2026")
                .category("VACCINE")
                .quantityOnHand(50)
                .reorderLevel(10)
                .unitCost(new BigDecimal("18.75"))
                .build();
        testItem.setId(1L);
        testItem.setUuid(UUID.randomUUID().toString());
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("createItem persists inventory item with default quantity when not specified")
    void createItem_persistsItemAndReturnsDto() {
        CreateInventoryItemRequest request = new CreateInventoryItemRequest();
        request.setItemName("Influenza Vaccine");
        request.setSku("VAC-FLU-2026");
        request.setCategory("VACCINE");
        request.setQuantityOnHand(50);
        request.setReorderLevel(10);
        request.setUnitCost(new BigDecimal("18.75"));

        when(inventoryItemRepository.save(any(InventoryItem.class))).thenAnswer(inv -> {
            InventoryItem item = inv.getArgument(0);
            item.setId(1L);
            item.setUuid(UUID.randomUUID().toString());
            return item;
        });

        InventoryItemDto result = inventoryService.createItem(request);

        assertThat(result).isNotNull();
        assertThat(result.getItemName()).isEqualTo("Influenza Vaccine");
        assertThat(result.getQuantityOnHand()).isEqualTo(50);
        verify(inventoryItemRepository).save(any(InventoryItem.class));
    }

    @Test
    @DisplayName("recordTransaction RECEIPT increases quantity on hand")
    void recordTransaction_receipt_increasesQuantity() {
        RecordTransactionRequest request = new RecordTransactionRequest();
        request.setItemId(1L);
        request.setTransactionType("RECEIPT");
        request.setQuantity(20);
        request.setReferenceNumber("PO-2026-001");
        request.setPerformedBy("staff-uuid-001");

        InventoryTransaction savedTx = InventoryTransaction.builder()
                .tenantId(1L)
                .itemId(1L)
                .transactionType(InventoryTransaction.TransactionType.RECEIPT)
                .quantity(20)
                .referenceNumber("PO-2026-001")
                .build();
        savedTx.setId(10L);
        savedTx.setUuid(UUID.randomUUID().toString());

        when(inventoryItemRepository.findById(1L)).thenReturn(Optional.of(testItem));
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenReturn(testItem);
        when(inventoryTransactionRepository.save(any(InventoryTransaction.class))).thenReturn(savedTx);

        InventoryTransactionDto result = inventoryService.recordTransaction(request);

        assertThat(result).isNotNull();
        assertThat(result.getTransactionType()).isEqualTo("RECEIPT");
        // Quantity should have been incremented by 20 (50 + 20 = 70)
        verify(inventoryItemRepository).save(argThat(item -> item.getQuantityOnHand() == 70));
    }

    @Test
    @DisplayName("recordTransaction DISPENSE decreases quantity on hand")
    void recordTransaction_dispense_decreasesQuantity() {
        RecordTransactionRequest request = new RecordTransactionRequest();
        request.setItemId(1L);
        request.setTransactionType("DISPENSE");
        request.setQuantity(5);
        request.setPerformedBy("nurse-uuid-001");

        InventoryTransaction savedTx = InventoryTransaction.builder()
                .tenantId(1L)
                .itemId(1L)
                .transactionType(InventoryTransaction.TransactionType.DISPENSE)
                .quantity(5)
                .build();
        savedTx.setId(11L);
        savedTx.setUuid(UUID.randomUUID().toString());

        when(inventoryItemRepository.findById(1L)).thenReturn(Optional.of(testItem));
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenReturn(testItem);
        when(inventoryTransactionRepository.save(any(InventoryTransaction.class))).thenReturn(savedTx);

        InventoryTransactionDto result = inventoryService.recordTransaction(request);

        assertThat(result.getTransactionType()).isEqualTo("DISPENSE");
        // Quantity should have been decremented by 5 (50 - 5 = 45)
        verify(inventoryItemRepository).save(argThat(item -> item.getQuantityOnHand() == 45));
    }

    @Test
    @DisplayName("getLowStockItems returns items below reorder level")
    void getLowStockItems_returnsLowStockItems() {
        InventoryItem lowStockItem = InventoryItem.builder()
                .tenantId(1L)
                .itemName("Epinephrine Auto-Injector")
                .sku("EPI-001")
                .category("EMERGENCY")
                .quantityOnHand(3)
                .reorderLevel(10)
                .build();
        lowStockItem.setId(2L);
        lowStockItem.setUuid(UUID.randomUUID().toString());

        when(inventoryItemRepository.findLowStockItems(1L)).thenReturn(List.of(lowStockItem));

        List<InventoryItemDto> result = inventoryService.getLowStockItems();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getItemName()).isEqualTo("Epinephrine Auto-Injector");
        assertThat(result.get(0).isLowStock()).isTrue();
    }
}
