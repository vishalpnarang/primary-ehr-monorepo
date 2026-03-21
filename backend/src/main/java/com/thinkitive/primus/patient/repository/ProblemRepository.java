package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    List<Problem> findByPatientIdAndArchiveFalse(Long patientId);

    List<Problem> findByPatientIdAndStatus(Long patientId, Problem.ProblemStatus status);
}
