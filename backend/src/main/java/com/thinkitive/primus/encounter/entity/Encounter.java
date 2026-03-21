package com.thinkitive.primus.encounter.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "encounters")
public class Encounter extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private EncounterType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EncounterStatus status;

    @Column(name = "chief_complaint", length = 500)
    private String chiefComplaint;

    @Column(name = "hpi_text", columnDefinition = "TEXT")
    private String hpiText;

    @Column(name = "examination", columnDefinition = "TEXT")
    private String examination;

    @Column(name = "ros_data", columnDefinition = "TEXT")
    private String rosData;

    @Column(name = "em_code", length = 20)
    private String emCode;

    @Column(name = "em_level")
    private Integer emLevel;

    @Column(name = "signed_at")
    private Instant signedAt;

    @Column(name = "signed_by", length = 150)
    private String signedBy;

    public enum EncounterType {
        OFFICE_VISIT, TELEHEALTH, PHONE, PROCEDURE
    }

    public enum EncounterStatus {
        DRAFT, IN_PROGRESS, SIGNED, ADDENDUM
    }
}
