package com.thinkitive.primus.inventory.service;

import com.thinkitive.primus.inventory.dto.*;

import java.util.List;

public interface InventoryService {

    List<InventoryItemDto> getItems();

    InventoryItemDto createItem(CreateInventoryItemRequest request);

    InventoryItemDto updateItem(String uuid, UpdateInventoryItemRequest request);

    InventoryTransactionDto recordTransaction(RecordTransactionRequest request);

    List<InventoryTransactionDto> getItemTransactions(String itemUuid);

    List<InventoryItemDto> getLowStockItems();
}
