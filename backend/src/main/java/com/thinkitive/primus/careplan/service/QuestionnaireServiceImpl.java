package com.thinkitive.primus.careplan.service;

import com.thinkitive.primus.careplan.dto.*;
import com.thinkitive.primus.careplan.entity.QuestionnaireDefinition;
import com.thinkitive.primus.careplan.entity.QuestionnaireResponse;
import com.thinkitive.primus.careplan.repository.QuestionnaireDefinitionRepository;
import com.thinkitive.primus.careplan.repository.QuestionnaireResponseRepository;
import com.thinkitive.primus.encounter.repository.EncounterRepository;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionnaireServiceImpl implements QuestionnaireService {

    private final QuestionnaireDefinitionRepository questionnaireDefinitionRepository;
    private final QuestionnaireResponseRepository questionnaireResponseRepository;
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;

    // ── Definitions ───────────────────────────────────────────────────────────

    @Override
    public List<QuestionnaireDefinitionDto> getQuestionnaires(String category) {
        Long tenantId = TenantContext.getTenantId();

        List<QuestionnaireDefinition> tenantQuestionnaires =
                (category != null && !category.isBlank())
                        ? questionnaireDefinitionRepository.findByTenantIdAndCategoryAndArchiveFalse(
                                tenantId, parseCategory(category))
                        : questionnaireDefinitionRepository.findByTenantIdAndIsPublishedTrueAndArchiveFalse(tenantId);

        // Also include system-level questionnaires (no tenant) accessible to all tenants
        List<QuestionnaireDefinition> systemQuestionnaires =
                questionnaireDefinitionRepository.findByTenantIdIsNullAndIsPublishedTrueAndArchiveFalse();

        return Stream.concat(systemQuestionnaires.stream(), tenantQuestionnaires.stream())
                .distinct()
                .map(this::toDefinitionDto)
                .toList();
    }

    @Override
    public QuestionnaireDefinitionDto getQuestionnaire(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        QuestionnaireDefinition def = findDefinitionByUuid(tenantId, uuid);
        return toDefinitionDto(def);
    }

    @Override
    @Transactional
    public QuestionnaireDefinitionDto createQuestionnaire(CreateQuestionnaireRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating questionnaire tenant={} name={}", tenantId, request.getName());

        QuestionnaireDefinition def = QuestionnaireDefinition.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory() != null ? parseCategory(request.getCategory()) : null)
                .questions(request.getQuestions())
                .scoringLogic(request.getScoringLogic())
                .isPublished(request.isPublished())
                .build();

        QuestionnaireDefinition saved = questionnaireDefinitionRepository.save(def);
        log.info("Questionnaire created uuid={}", saved.getUuid());
        return toDefinitionDto(saved);
    }

    @Override
    @Transactional
    public void deleteQuestionnaire(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        QuestionnaireDefinition def = findDefinitionByUuid(tenantId, uuid);
        def.setArchive(true);
        questionnaireDefinitionRepository.save(def);
        log.info("Questionnaire archived uuid={}", uuid);
    }

    // ── Responses ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public QuestionnaireResponseDto submitResponse(
            String questionnaireUuid, SubmitQuestionnaireResponseRequest request) {
        Long tenantId = TenantContext.getTenantId();

        QuestionnaireDefinition def = findDefinitionByUuid(tenantId, questionnaireUuid);
        Patient patient = patientRepository.findByTenantIdAndUuid(tenantId, request.getPatientUuid())
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient not found: " + request.getPatientUuid()));

        Long encounterId = null;
        if (request.getEncounterUuid() != null && !request.getEncounterUuid().isBlank()) {
            encounterId = encounterRepository.findByTenantIdAndUuid(tenantId, request.getEncounterUuid())
                    .map(e -> e.getId())
                    .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                            "Encounter not found: " + request.getEncounterUuid()));
        }

        // Apply scoring logic if total score is not provided client-side.
        // Phase 4: implement full server-side scoring engine using scoringLogic JSON.
        Integer totalScore = request.getTotalScore();
        String riskLevel = computeRiskLevel(def, totalScore);

        QuestionnaireResponse response = QuestionnaireResponse.builder()
                .tenantId(tenantId)
                .questionnaireId(def.getId())
                .patientId(patient.getId())
                .encounterId(encounterId)
                .responses(request.getResponses())
                .totalScore(totalScore)
                .riskLevel(riskLevel)
                .completedBy(request.getCompletedBy())
                .completedAt(request.getCompletedAt() != null ? request.getCompletedAt() : Instant.now())
                .build();

        QuestionnaireResponse saved = questionnaireResponseRepository.save(response);
        log.info("Questionnaire response submitted questionnaire={} patient={} score={}",
                questionnaireUuid, request.getPatientUuid(), totalScore);
        return toResponseDto(saved, def, questionnaireUuid, request.getPatientUuid(),
                request.getEncounterUuid());
    }

    @Override
    public List<QuestionnaireResponseDto> getResponsesByPatient(String patientUuid) {
        Long tenantId = TenantContext.getTenantId();
        Patient patient = patientRepository.findByTenantIdAndUuid(tenantId, patientUuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient not found: " + patientUuid));

        return questionnaireResponseRepository
                .findByPatientIdAndTenantIdAndArchiveFalse(patient.getId(), tenantId)
                .stream()
                .map(r -> {
                    QuestionnaireDefinition def = questionnaireDefinitionRepository
                            .findById(r.getQuestionnaireId()).orElse(null);
                    String questionnaireUuid = def != null ? def.getUuid() : null;
                    return toResponseDto(r, def, questionnaireUuid, patientUuid, null);
                })
                .toList();
    }

    @Override
    public List<QuestionnaireResponseDto> getResponsesByQuestionnaire(String questionnaireUuid) {
        Long tenantId = TenantContext.getTenantId();
        QuestionnaireDefinition def = findDefinitionByUuid(tenantId, questionnaireUuid);

        return questionnaireResponseRepository
                .findByQuestionnaireIdAndTenantIdAndArchiveFalse(def.getId(), tenantId)
                .stream()
                .map(r -> {
                    Patient patient = patientRepository.findById(r.getPatientId()).orElse(null);
                    String patientUuid = patient != null ? patient.getUuid() : null;
                    return toResponseDto(r, def, questionnaireUuid, patientUuid, null);
                })
                .toList();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private QuestionnaireDefinition findDefinitionByUuid(Long tenantId, String uuid) {
        // Check tenant-scoped first, then fall back to system-level questionnaires
        return questionnaireDefinitionRepository.findByTenantIdAndUuid(tenantId, uuid)
                .or(() -> questionnaireDefinitionRepository.findByUuidAndArchiveFalse(uuid))
                .filter(d -> !d.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Questionnaire not found: " + uuid));
    }

    private QuestionnaireDefinition.QuestionnaireCategory parseCategory(String value) {
        try {
            return QuestionnaireDefinition.QuestionnaireCategory.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown questionnaire category '{}'", value);
            return null;
        }
    }

    /**
     * Stub scoring — Phase 4 will implement a proper JSON-path-based scoring engine
     * that evaluates the scoringLogic against the submitted answers.
     */
    private String computeRiskLevel(QuestionnaireDefinition def, Integer totalScore) {
        if (totalScore == null || def.getScoringLogic() == null) return null;
        // Placeholder: return MINIMAL for low scores, MODERATE for medium, SEVERE for high.
        // Real implementation will parse def.getScoringLogic() JSON.
        if (totalScore <= 4)  return "MINIMAL";
        if (totalScore <= 9)  return "MILD";
        if (totalScore <= 14) return "MODERATE";
        if (totalScore <= 19) return "MODERATELY_SEVERE";
        return "SEVERE";
    }

    private QuestionnaireDefinitionDto toDefinitionDto(QuestionnaireDefinition d) {
        return QuestionnaireDefinitionDto.builder()
                .uuid(d.getUuid())
                .name(d.getName())
                .description(d.getDescription())
                .category(d.getCategory() != null ? d.getCategory().name() : null)
                .questions(d.getQuestions())
                .scoringLogic(d.getScoringLogic())
                .isPublished(d.isPublished())
                .createdAt(d.getCreatedAt())
                .modifiedAt(d.getModifiedAt())
                .build();
    }

    private QuestionnaireResponseDto toResponseDto(
            QuestionnaireResponse r,
            QuestionnaireDefinition def,
            String questionnaireUuid,
            String patientUuid,
            String encounterUuid) {
        return QuestionnaireResponseDto.builder()
                .uuid(r.getUuid())
                .questionnaireUuid(questionnaireUuid)
                .questionnaireName(def != null ? def.getName() : null)
                .patientUuid(patientUuid)
                .encounterUuid(encounterUuid)
                .responses(r.getResponses())
                .totalScore(r.getTotalScore())
                .riskLevel(r.getRiskLevel())
                .completedBy(r.getCompletedBy())
                .completedAt(r.getCompletedAt())
                .createdAt(r.getCreatedAt())
                .modifiedAt(r.getModifiedAt())
                .build();
    }
}
