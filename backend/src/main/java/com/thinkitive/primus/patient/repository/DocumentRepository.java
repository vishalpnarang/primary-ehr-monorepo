package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByPatientIdAndArchiveFalseOrderByCreatedAtDesc(Long patientId);

    List<Document> findByPatientIdAndType(Long patientId, Document.DocumentType type);
}
