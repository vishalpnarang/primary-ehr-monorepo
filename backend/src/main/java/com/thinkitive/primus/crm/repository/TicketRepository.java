package com.thinkitive.primus.crm.repository;

import com.thinkitive.primus.crm.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Page<Ticket> findByTenantIdAndArchiveFalse(Long tenantId, Pageable pageable);

    Page<Ticket> findByTenantIdAndStatusAndArchiveFalse(
            Long tenantId, Ticket.TicketStatus status, Pageable pageable);

    Page<Ticket> findByTenantIdAndAssignedToAndArchiveFalse(
            Long tenantId, String assignedTo, Pageable pageable);

    Optional<Ticket> findByTenantIdAndUuid(Long tenantId, String uuid);
}
