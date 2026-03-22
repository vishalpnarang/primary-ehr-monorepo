package com.thinkitive.primus.order.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "imaging_results")
public class ImagingResult extends TenantAwareEntity {

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "modality", nullable = false, length = 50)
    private String modality;

    @Column(name = "study_description", length = 500)
    private String studyDescription;

    @Column(name = "radiologist", length = 255)
    private String radiologist;

    @Column(name = "report", columnDefinition = "TEXT")
    private String report;

    @Column(name = "impression", columnDefinition = "TEXT")
    private String impression;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ImagingStatus status = ImagingStatus.PENDING;

    @Column(name = "result_date")
    private Instant resultDate;

    public enum ImagingStatus {
        PENDING, PRELIMINARY, FINAL, AMENDED, CANCELLED
    }
}
