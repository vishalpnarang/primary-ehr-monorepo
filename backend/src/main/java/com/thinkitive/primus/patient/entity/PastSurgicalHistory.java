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
@Table(name = "past_surgical_history")
public class PastSurgicalHistory extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "procedure_name", nullable = false, length = 255)
    private String procedureName;

    @Column(name = "procedure_date")
    private LocalDate procedureDate;

    @Column(name = "cpt_code", length = 20)
    private String cptCode;

    @Column(name = "surgeon", length = 255)
    private String surgeon;

    @Column(name = "facility", length = 255)
    private String facility;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
