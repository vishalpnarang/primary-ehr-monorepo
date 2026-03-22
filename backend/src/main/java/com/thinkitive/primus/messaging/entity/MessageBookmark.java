package com.thinkitive.primus.messaging.entity;

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
@Table(
    name = "message_bookmarks",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_msg_bookmark_message_user",
        columnNames = {"message_id", "user_id"}
    )
)
public class MessageBookmark extends TenantAwareEntity {

    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;
}
