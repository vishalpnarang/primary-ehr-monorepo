package com.thinkitive.primus.order.repository;

import com.thinkitive.primus.order.entity.LabOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {

    Page<LabOrder> findByTenantIdAndPatientIdOrderByOrderedAtDesc(Long tenantId, Long patientId, Pageable pageable);

    List<LabOrder> findByTenantIdAndStatus(Long tenantId, LabOrder.LabOrderStatus status);

    List<LabOrder> findByTenantIdAndProviderIdAndStatus(Long tenantId, Long providerId, LabOrder.LabOrderStatus status);
}
