package com.thinkitive.primus.order.repository;

import com.thinkitive.primus.order.entity.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {

    List<LabResult> findByOrderId(Long orderId);

    List<LabResult> findByPatientIdOrderByResultDateDesc(Long patientId);

    List<LabResult> findByPatientIdAndStatus(Long patientId, LabResult.LabResultStatus status);
}
