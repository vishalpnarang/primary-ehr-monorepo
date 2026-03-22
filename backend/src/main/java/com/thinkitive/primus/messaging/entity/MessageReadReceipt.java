package com.thinkitive.primus.messaging.entity;

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
@Table(
    name = "message_read_receipts",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_msg_read_receipt_message_user",
        columnNames = {"message_id", "user_id"}
    )
)
public class MessageReadReceipt extends TenantAwareEntity {

    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "read_at", nullable = false)
    private Instant readAt;
}
