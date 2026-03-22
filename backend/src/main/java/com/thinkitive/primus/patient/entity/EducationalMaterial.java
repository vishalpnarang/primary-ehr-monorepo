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
@Table(name = "educational_materials")
public class EducationalMaterial extends TenantAwareEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "content_url", length = 1024)
    private String contentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", length = 50)
    private ContentType contentType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    public enum ContentType {
        PDF, VIDEO, LINK
    }
}
