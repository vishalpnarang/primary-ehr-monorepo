package com.thinkitive.primus.employer.repository;

import com.thinkitive.primus.employer.entity.EmployerEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployerEmployeeRepository extends JpaRepository<EmployerEmployee, Long> {

    List<EmployerEmployee> findByEmployerIdAndArchiveFalse(Long employerId);

    List<EmployerEmployee> findByPatientIdAndArchiveFalse(Long patientId);

    Optional<EmployerEmployee> findByEmployerIdAndPatientIdAndArchiveFalse(Long employerId, Long patientId);

    Optional<EmployerEmployee> findByTenantIdAndUuid(Long tenantId, String uuid);
}
