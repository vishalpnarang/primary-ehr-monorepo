package com.thinkitive.primus.inventory.repository;

import com.thinkitive.primus.inventory.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    List<InventoryTransaction> findByItemIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(
            Long itemId, Long tenantId);

    List<InventoryTransaction> findByTenantIdAndArchiveFalse(Long tenantId);

    Optional<InventoryTransaction> findByTenantIdAndUuid(Long tenantId, String uuid);
}
