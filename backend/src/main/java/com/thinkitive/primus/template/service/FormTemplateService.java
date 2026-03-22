package com.thinkitive.primus.template.service;

import com.thinkitive.primus.template.dto.*;

import java.util.List;

/**
 * Service interface for form template and submission management.
 * All operations are automatically tenant-scoped via TenantContext.
 */
public interface FormTemplateService {

    // ── Templates ──────────────────────────────────────────────────────────

    /**
     * List all templates for the current tenant, optionally filtered.
     *
     * @param category optional category filter (INTAKE/CONSENT/ASSESSMENT/CUSTOM)
     * @param status   optional status filter (DRAFT/PUBLISHED/ARCHIVED)
     */
    List<FormTemplateDto> listTemplates(String category, String status);

    /**
     * Get a single template by UUID.
     *
     * @param uuid template UUID
     */
    FormTemplateDto getTemplate(String uuid);

    /**
     * Create a new form template in DRAFT status.
     *
     * @param request creation payload
     */
    FormTemplateDto createTemplate(CreateFormTemplateRequest request);

    /**
     * Update an existing template. Only DRAFT templates can be updated.
     *
     * @param uuid    template UUID
     * @param request update payload — null fields are ignored
     */
    FormTemplateDto updateTemplate(String uuid, UpdateFormTemplateRequest request);

    /**
     * Publish a DRAFT template, making it available for submissions.
     * Increments version if a published version already exists.
     *
     * @param uuid template UUID
     */
    FormTemplateDto publishTemplate(String uuid);

    /**
     * Archive a template. Archived templates are read-only and no new submissions are accepted.
     *
     * @param uuid template UUID
     */
    FormTemplateDto archiveTemplate(String uuid);

    // ── Submissions ────────────────────────────────────────────────────────

    /**
     * Submit a patient's filled form response.
     *
     * @param templateUuid UUID of the form template
     * @param request      submission payload containing patient ID and form values JSON
     */
    FormSubmissionDto submitForm(String templateUuid, SubmitFormRequest request);

    /**
     * List all submissions for a given template (within the current tenant).
     *
     * @param templateUuid template UUID
     */
    List<FormSubmissionDto> listSubmissionsForTemplate(String templateUuid);

    /**
     * List all submissions for a given patient (within the current tenant).
     *
     * @param patientUuid patient UUID
     */
    List<FormSubmissionDto> listSubmissionsForPatient(String patientUuid);

    /**
     * Mark a submission as reviewed.
     *
     * @param submissionUuid submission UUID
     * @param reviewedBy     name/email of the reviewer
     */
    FormSubmissionDto reviewSubmission(String submissionUuid, String reviewedBy);
}
