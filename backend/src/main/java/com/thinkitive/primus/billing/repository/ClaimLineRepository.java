package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.ClaimLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimLineRepository extends JpaRepository<ClaimLine, Long> {

    List<ClaimLine> findByClaimId(Long claimId);

    void deleteByClaimId(Long claimId);
}
