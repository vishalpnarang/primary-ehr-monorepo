package com.thinkitive.primus.scheduling.repository;

import com.thinkitive.primus.scheduling.entity.RecurringAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringAppointmentRepository extends JpaRepository<RecurringAppointment, Long> {

    List<RecurringAppointment> findByPatientIdAndStatusAndTenantId(
        Long patientId,
        RecurringAppointment.RecurringStatus status,
        Long tenantId
    );

    List<RecurringAppointment> findByPatientIdAndTenantId(Long patientId, Long tenantId);

    List<RecurringAppointment> findByProviderIdAndStatusAndTenantId(
        String providerId,
        RecurringAppointment.RecurringStatus status,
        Long tenantId
    );
}
