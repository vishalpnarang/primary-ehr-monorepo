package com.thinkitive.primus.scheduling.repository;

import com.thinkitive.primus.scheduling.entity.Cancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface CancellationRepository extends JpaRepository<Cancellation, Long> {

    Optional<Cancellation> findByAppointmentId(Long appointmentId);

    List<Cancellation> findByTenantId(Long tenantId);

    List<Cancellation> findByTenantIdAndIsNoShowTrue(Long tenantId);

    List<Cancellation> findByCancelledAtBetweenAndTenantId(
        Instant from,
        Instant to,
        Long tenantId
    );
}
