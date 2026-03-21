package com.thinkitive.primus.messaging.repository;

import com.thinkitive.primus.messaging.entity.ThreadParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ThreadParticipantRepository extends JpaRepository<ThreadParticipant, Long> {

    List<ThreadParticipant> findByThreadId(Long threadId);

    Optional<ThreadParticipant> findByThreadIdAndUserId(Long threadId, Long userId);

    List<ThreadParticipant> findByUserIdAndUnreadCountGreaterThan(Long userId, int count);
}
