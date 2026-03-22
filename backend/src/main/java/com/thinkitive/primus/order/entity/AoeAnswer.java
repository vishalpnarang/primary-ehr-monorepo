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
@Table(name = "aoe_answers")
public class AoeAnswer extends TenantAwareEntity {

    @Column(name = "lab_order_id", nullable = false)
    private Long labOrderId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;
}
