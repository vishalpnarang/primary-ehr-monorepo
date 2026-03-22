package com.thinkitive.primus.careplan.entity;

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
@Table(name = "care_plan_goals")
public class CarePlanGoal extends TenantAwareEntity {

    @Column(name = "care_plan_id", nullable = false)
    private Long carePlanId;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    /** Numeric or descriptive target, e.g. "HbA1c < 7.0" or "120/80 mmHg". */
    @Column(name = "target_value", length = 100)
    private String targetValue;

    /** Most recent observed value, updated by care team. */
    @Column(name = "current_value", length = 100)
    private String currentValue;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private GoalStatus status = GoalStatus.IN_PROGRESS;

    public enum GoalStatus {
        IN_PROGRESS, MET, NOT_MET, CANCELLED
    }
}
