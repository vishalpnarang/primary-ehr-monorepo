package com.thinkitive.primus.order.entity;

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
@Table(name = "aoe_questions")
public class AoeQuestion extends TenantAwareEntity {

    @Column(name = "lab_catalog_id", nullable = false)
    private Long labCatalogId;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Enumerated(EnumType.STRING)
    @Column(name = "answer_type", nullable = false, length = 20)
    private AnswerType answerType;

    /** JSON array of option strings when answerType is SELECT */
    @Column(name = "options", columnDefinition = "JSONB")
    private String options;

    @Column(name = "required", nullable = false)
    private boolean required = false;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    public enum AnswerType {
        TEXT, SELECT, BOOLEAN, DATE
    }
}
