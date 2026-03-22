package com.thinkitive.primus.scheduling.repository;

import com.thinkitive.primus.scheduling.entity.AppointmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentTypeRepository extends JpaRepository<AppointmentType, Long> {

    List<AppointmentType> findByTenantId(Long tenantId);

    List<AppointmentType> findByTenantIdAndArchiveFalse(Long tenantId);

    Optional<AppointmentType> findByNameAndTenantId(String name, Long tenantId);

    List<AppointmentType> findByTenantIdAndAllowOnlineBookingTrue(Long tenantId);
}
