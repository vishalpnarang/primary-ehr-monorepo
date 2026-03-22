package com.thinkitive.primus.employer.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
    name = "employer_employees",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_employer_employees_employer_patient",
        columnNames = {"employer_id", "patient_id"}
    )
)
public class EmployerEmployee extends TenantAwareEntity {

    @Column(name = "employer_id", nullable = false)
    private Long employerId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";
}
