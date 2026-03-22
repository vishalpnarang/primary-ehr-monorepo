package com.thinkitive.primus.patient.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
    name = "patient_linked_pharmacies",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_patient_linked_pharmacies_patient_pharmacy",
        columnNames = {"patient_id", "pharmacy_id"}
    )
)
public class PatientLinkedPharmacy extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "pharmacy_id", nullable = false)
    private Long pharmacyId;

    @Column(name = "is_preferred")
    private boolean isPreferred = false;
}
