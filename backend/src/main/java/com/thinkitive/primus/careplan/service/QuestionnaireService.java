package com.thinkitive.primus.careplan.service;

import com.thinkitive.primus.careplan.dto.*;

import java.util.List;

public interface QuestionnaireService {

    // ── Questionnaire Definitions ─────────────────────────────────────────────
    List<QuestionnaireDefinitionDto> getQuestionnaires(String category);

    QuestionnaireDefinitionDto getQuestionnaire(String uuid);

    QuestionnaireDefinitionDto createQuestionnaire(CreateQuestionnaireRequest request);

    void deleteQuestionnaire(String uuid);

    // ── Questionnaire Responses ───────────────────────────────────────────────
    QuestionnaireResponseDto submitResponse(String questionnaireUuid, SubmitQuestionnaireResponseRequest request);

    List<QuestionnaireResponseDto> getResponsesByPatient(String patientUuid);

    List<QuestionnaireResponseDto> getResponsesByQuestionnaire(String questionnaireUuid);
}
