package com.thinkitive.primus.crm.repository;

import com.thinkitive.primus.crm.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    List<TicketComment> findByTicketIdAndArchiveFalseOrderByCreatedAtAsc(Long ticketId);

    List<TicketComment> findByTicketIdAndIsInternalFalseAndArchiveFalseOrderByCreatedAtAsc(Long ticketId);

    Optional<TicketComment> findByTenantIdAndUuid(Long tenantId, String uuid);
}
