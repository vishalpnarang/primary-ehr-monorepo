package com.thinkitive.primus.patient.entity;

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
@Table(name = "allergies")
public class Allergy extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "substance", nullable = false, length = 255)
    private String substance;

    @Column(name = "reaction", length = 500)
    private String reaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private AllergySeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private AllergyType type;

    @Column(name = "onset_date")
    private LocalDate onsetDate;

    public enum AllergySeverity {
        MILD, MODERATE, SEVERE, UNKNOWN
    }

    public enum AllergyType {
        DRUG, FOOD, ENVIRONMENTAL
    }
}
