package com.thinkitive.primus.messaging.repository;

import com.thinkitive.primus.messaging.entity.MessageReadReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReadReceiptRepository extends JpaRepository<MessageReadReceipt, Long> {

    Optional<MessageReadReceipt> findByMessageIdAndUserId(Long messageId, String userId);

    List<MessageReadReceipt> findByMessageIdAndArchiveFalse(Long messageId);

    long countByUserIdAndArchiveFalse(String userId);
}
