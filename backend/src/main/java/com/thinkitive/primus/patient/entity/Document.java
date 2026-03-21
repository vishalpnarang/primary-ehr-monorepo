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
@Table(name = "documents")
public class Document extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private DocumentType type;

    @Column(name = "uploaded_by", length = 150)
    private String uploadedBy;

    @Column(name = "size")
    private Long size;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "url", length = 1000)
    private String url;

    public enum DocumentType {
        EXTERNAL_RECORD, IMAGING, CONSENT, INSURANCE_CARD, LAB_REPORT, OTHER
    }
}
