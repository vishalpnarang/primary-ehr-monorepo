package com.thinkitive.primus.messaging.repository;

import com.thinkitive.primus.messaging.entity.MessageThread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageThreadRepository extends JpaRepository<MessageThread, Long> {

    @Query("""
        SELECT mt FROM MessageThread mt
        JOIN ThreadParticipant tp ON tp.threadId = mt.id
        WHERE mt.tenantId = :tenantId
          AND tp.userId = :userId
          AND mt.archive = false
        ORDER BY mt.lastMessageAt DESC
        """)
    Page<MessageThread> findThreadsByParticipant(
        @Param("tenantId") Long tenantId,
        @Param("userId") Long userId,
        Pageable pageable
    );
}
