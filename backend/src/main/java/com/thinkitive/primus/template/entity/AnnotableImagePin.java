package com.thinkitive.primus.template.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "annotable_image_pins")
public class AnnotableImagePin extends TenantAwareEntity {

    @Column(name = "image_id", nullable = false)
    private Long imageId;

    /** Nullable — pin may be encounter-scoped or patient-level only. */
    @Column(name = "encounter_id")
    private Long encounterId;

    @Column(name = "patient_id")
    private Long patientId;

    /** X coordinate as a percentage of image width (0–100). */
    @Column(name = "x_position", nullable = false, precision = 5, scale = 2)
    private BigDecimal xPosition;

    /** Y coordinate as a percentage of image height (0–100). */
    @Column(name = "y_position", nullable = false, precision = 5, scale = 2)
    private BigDecimal yPosition;

    @Column(name = "label", length = 255)
    private String label;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /** Hex color string, e.g. #FF0000. */
    @Column(name = "color", length = 7)
    private String color = "#FF0000";
}
