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
@Table(name = "immunizations")
public class Immunization extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "vaccine_name", nullable = false, length = 255)
    private String vaccineName;

    @Column(name = "cvx_code", length = 10)
    private String cvxCode;

    @Column(name = "dose_number")
    private Integer doseNumber;

    @Column(name = "dose_in_series")
    private Integer doseInSeries;

    @Column(name = "administered_date")
    private LocalDate administeredDate;

    @Column(name = "administered_by", length = 150)
    private String administeredBy;

    @Column(name = "site", length = 50)
    private String site;

    @Column(name = "lot_number", length = 50)
    private String lotNumber;

    @Column(name = "manufacturer", length = 100)
    private String manufacturer;
}
