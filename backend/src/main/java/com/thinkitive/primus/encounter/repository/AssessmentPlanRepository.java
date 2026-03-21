package com.thinkitive.primus.encounter.repository;

import com.thinkitive.primus.encounter.entity.AssessmentPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentPlanRepository extends JpaRepository<AssessmentPlan, Long> {

    List<AssessmentPlan> findByEncounterIdOrderBySortOrder(Long encounterId);

    void deleteByEncounterId(Long encounterId);
}
