package com.thinkitive.primus.inventory.repository;

import com.thinkitive.primus.inventory.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByTenantIdAndArchiveFalse(Long tenantId);

    List<InventoryItem> findByTenantIdAndCategoryAndArchiveFalse(Long tenantId, String category);

    Optional<InventoryItem> findByTenantIdAndUuid(Long tenantId, String uuid);

    @Query("SELECT i FROM InventoryItem i WHERE i.tenantId = :tenantId AND i.archive = false " +
           "AND i.quantityOnHand <= i.reorderLevel")
    List<InventoryItem> findLowStockItems(Long tenantId);
}
