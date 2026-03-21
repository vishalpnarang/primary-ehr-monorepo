package com.thinkitive.primus.messaging.repository;

import com.thinkitive.primus.messaging.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByThreadIdOrderBySentAtAsc(Long threadId, Pageable pageable);

    long countByThreadIdAndReadAtIsNull(Long threadId);
}
