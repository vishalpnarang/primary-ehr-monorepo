package com.thinkitive.primus.template.entity;

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
@Table(name = "annotable_images")
public class AnnotableImage extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "image_url", nullable = false, length = 1024)
    private String imageUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** True for platform-shipped images available to all tenants. */
    @Column(name = "is_system", nullable = false)
    private boolean isSystem = false;
}
