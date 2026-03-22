package com.thinkitive.primus.crm.entity;

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
@Table(name = "tickets")
public class Ticket extends TenantAwareEntity {

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TicketStatus status = TicketStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private TicketPriority priority = TicketPriority.MEDIUM;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "assigned_to", length = 36)
    private String assignedTo;

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "reporter_id", length = 36)
    private String reporterId;

    public enum TicketStatus {
        OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED
    }

    public enum TicketPriority {
        LOW, MEDIUM, HIGH, URGENT
    }
}
