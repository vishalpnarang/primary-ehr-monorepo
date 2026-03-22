package com.thinkitive.primus.careplan.controller;

import com.thinkitive.primus.careplan.dto.*;
import com.thinkitive.primus.careplan.service.QuestionnaireService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/questionnaires")
@RequiredArgsConstructor
public class QuestionnaireController extends BaseController {

    private final QuestionnaireService questionnaireService;

    // ── Definitions ───────────────────────────────────────────────────────────

    /** GET /api/v1/questionnaires?category=PHQ9 */
    @GetMapping
    public ResponseEntity<ApiResponse> getQuestionnaires(
            @RequestParam(required = false) String category) {
        return ok(questionnaireService.getQuestionnaires(category));
    }

    /** GET /api/v1/questionnaires/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getQuestionnaire(@PathVariable String uuid) {
        return ok(questionnaireService.getQuestionnaire(uuid));
    }

    /** POST /api/v1/questionnaires */
    @PostMapping
    public ResponseEntity<ApiResponse> createQuestionnaire(
            @Valid @RequestBody CreateQuestionnaireRequest request) {
        return created(questionnaireService.createQuestionnaire(request), "Questionnaire created");
    }

    /** DELETE /api/v1/questionnaires/{uuid} */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse> deleteQuestionnaire(@PathVariable String uuid) {
        questionnaireService.deleteQuestionnaire(uuid);
        return noContent();
    }

    // ── Responses ─────────────────────────────────────────────────────────────

    /** POST /api/v1/questionnaires/{uuid}/respond */
    @PostMapping("/{uuid}/respond")
    public ResponseEntity<ApiResponse> submitResponse(
            @PathVariable String uuid,
            @Valid @RequestBody SubmitQuestionnaireResponseRequest request) {
        return created(questionnaireService.submitResponse(uuid, request), "Response submitted");
    }

    /** GET /api/v1/questionnaires/patient/{patientUuid}/responses */
    @GetMapping("/patient/{patientUuid}/responses")
    public ResponseEntity<ApiResponse> getResponsesByPatient(@PathVariable String patientUuid) {
        return ok(questionnaireService.getResponsesByPatient(patientUuid));
    }

    /** GET /api/v1/questionnaires/{uuid}/responses */
    @GetMapping("/{uuid}/responses")
    public ResponseEntity<ApiResponse> getResponsesByQuestionnaire(@PathVariable String uuid) {
        return ok(questionnaireService.getResponsesByQuestionnaire(uuid));
    }
}
