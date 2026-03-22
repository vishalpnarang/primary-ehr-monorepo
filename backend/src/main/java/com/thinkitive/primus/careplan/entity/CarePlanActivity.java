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
@Table(name = "care_plan_activities")
public class CarePlanActivity extends TenantAwareEntity {

    @Column(name = "goal_id", nullable = false)
    private Long goalId;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    /** Human-readable frequency, e.g. "Daily", "3x per week". */
    @Column(name = "frequency", length = 100)
    private String frequency;

    /** UUID of the staff member or patient responsible for completing this activity. */
    @Column(name = "assigned_to", length = 36)
    private String assignedTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ActivityStatus status = ActivityStatus.PENDING;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    public enum ActivityStatus {
        PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
