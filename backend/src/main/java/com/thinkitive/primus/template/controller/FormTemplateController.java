package com.thinkitive.primus.template.controller;

import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.template.dto.CreateFormTemplateRequest;
import com.thinkitive.primus.template.dto.SubmitFormRequest;
import com.thinkitive.primus.template.dto.UpdateFormTemplateRequest;
import com.thinkitive.primus.template.service.FormTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for form template and submission management.
 *
 * Base path: /api/v1/form-templates
 *
 * All endpoints are automatically tenant-scoped via the TenantFilter
 * reading the X-Tenant-ID header and setting TenantContext.
 */
@RestController
@RequestMapping("/api/v1/form-templates")
@RequiredArgsConstructor
public class FormTemplateController extends BaseController {

    private final FormTemplateService formTemplateService;

    // ── Template CRUD ─────────────────────────────────────────────────────────

    /**
     * GET /api/v1/form-templates
     * List all templates for the current tenant.
     * Optional query params: category (INTAKE|CONSENT|ASSESSMENT|CUSTOM), status (DRAFT|PUBLISHED|ARCHIVED)
     */
    @GetMapping
    public ResponseEntity<ApiResponse> listTemplates(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return ok(formTemplateService.listTemplates(category, status));
    }

    /**
     * GET /api/v1/form-templates/{uuid}
     * Get a single template by UUID.
     */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getTemplate(@PathVariable String uuid) {
        return ok(formTemplateService.getTemplate(uuid));
    }

    /**
     * POST /api/v1/form-templates
     * Create a new form template in DRAFT status.
     */
    @PostMapping
    public ResponseEntity<ApiResponse> createTemplate(
            @Valid @RequestBody CreateFormTemplateRequest request) {
        return created(formTemplateService.createTemplate(request), "Form template created");
    }

    /**
     * PUT /api/v1/form-templates/{uuid}
     * Update a DRAFT template. Null fields in the request body are ignored.
     */
    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse> updateTemplate(
            @PathVariable String uuid,
            @RequestBody UpdateFormTemplateRequest request) {
        return ok(formTemplateService.updateTemplate(uuid, request), "Form template updated");
    }

    /**
     * POST /api/v1/form-templates/{uuid}/publish
     * Publish a DRAFT template, making it available for submissions.
     */
    @PostMapping("/{uuid}/publish")
    public ResponseEntity<ApiResponse> publishTemplate(@PathVariable String uuid) {
        return ok(formTemplateService.publishTemplate(uuid), "Form template published");
    }

    /**
     * POST /api/v1/form-templates/{uuid}/archive
     * Archive a template — no new submissions accepted after archival.
     */
    @PostMapping("/{uuid}/archive")
    public ResponseEntity<ApiResponse> archiveTemplate(@PathVariable String uuid) {
        return ok(formTemplateService.archiveTemplate(uuid), "Form template archived");
    }

    // ── Submissions ───────────────────────────────────────────────────────────

    /**
     * POST /api/v1/form-templates/{uuid}/submit
     * Submit a patient's filled form response.
     * The template must be in PUBLISHED status.
     */
    @PostMapping("/{uuid}/submit")
    public ResponseEntity<ApiResponse> submitForm(
            @PathVariable String uuid,
            @Valid @RequestBody SubmitFormRequest request) {
        return created(formTemplateService.submitForm(uuid, request), "Form submitted successfully");
    }

    /**
     * GET /api/v1/form-templates/{uuid}/submissions
     * List all submissions for a given template within the current tenant.
     */
    @GetMapping("/{uuid}/submissions")
    public ResponseEntity<ApiResponse> listSubmissionsForTemplate(@PathVariable String uuid) {
        return ok(formTemplateService.listSubmissionsForTemplate(uuid));
    }

    /**
     * GET /api/v1/form-templates/submissions/patient/{patientUuid}
     * List all form submissions for a given patient within the current tenant.
     */
    @GetMapping("/submissions/patient/{patientUuid}")
    public ResponseEntity<ApiResponse> listSubmissionsForPatient(@PathVariable String patientUuid) {
        return ok(formTemplateService.listSubmissionsForPatient(patientUuid));
    }

    /**
     * PATCH /api/v1/form-templates/submissions/{submissionUuid}/review
     * Mark a submission as reviewed.
     * Query param: reviewedBy — name or email of the reviewer.
     */
    @PatchMapping("/submissions/{submissionUuid}/review")
    public ResponseEntity<ApiResponse> reviewSubmission(
            @PathVariable String submissionUuid,
            @RequestParam String reviewedBy) {
        return ok(formTemplateService.reviewSubmission(submissionUuid, reviewedBy), "Submission marked as reviewed");
    }
}
