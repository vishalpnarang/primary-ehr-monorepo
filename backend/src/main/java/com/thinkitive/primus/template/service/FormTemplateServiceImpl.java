package com.thinkitive.primus.template.service;

import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import com.thinkitive.primus.template.dto.*;
import com.thinkitive.primus.template.entity.FormSubmission;
import com.thinkitive.primus.template.entity.FormSubmission.SubmissionStatus;
import com.thinkitive.primus.template.entity.FormTemplate;
import com.thinkitive.primus.template.entity.FormTemplate.TemplateCategory;
import com.thinkitive.primus.template.entity.FormTemplate.TemplateStatus;
import com.thinkitive.primus.template.repository.FormSubmissionRepository;
import com.thinkitive.primus.template.repository.FormTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * JPA-backed implementation of FormTemplateService.
 * All operations are tenant-scoped via TenantContext.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FormTemplateServiceImpl implements FormTemplateService {

    private final FormTemplateRepository templateRepository;
    private final FormSubmissionRepository submissionRepository;
    private final PatientRepository patientRepository;

    // ── Templates ──────────────────────────────────────────────────────────────

    @Override
    public List<FormTemplateDto> listTemplates(String category, String status) {
        Long tenantId = TenantContext.getTenantId();
        TemplateCategory categoryEnum = category != null ? parseCategory(category) : null;
        TemplateStatus statusEnum = status != null ? parseStatus(status) : null;

        return templateRepository.findFiltered(tenantId, categoryEnum, statusEnum)
                .stream()
                .map(this::toTemplateDto)
                .toList();
    }

    @Override
    public FormTemplateDto getTemplate(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        return toTemplateDto(findTemplateOrThrow(uuid, tenantId));
    }

    @Override
    @Transactional
    public FormTemplateDto createTemplate(CreateFormTemplateRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating form template tenant={} name={}", tenantId, request.getName());

        TemplateCategory category = parseCategory(request.getCategory());

        // Duplicate name check within same version
        if (templateRepository.existsByTenantIdAndNameAndVersion(tenantId, request.getName(), 1)) {
            throw new PrimusException(ResponseCode.CONFLICT,
                    "A form template with this name already exists for version 1");
        }

        FormTemplate template = FormTemplate.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .schemaData(request.getSchemaData())
                .version(1)
                .status(TemplateStatus.DRAFT)
                .build();

        FormTemplate saved = templateRepository.save(template);
        log.info("Form template created uuid={}", saved.getUuid());
        return toTemplateDto(saved);
    }

    @Override
    @Transactional
    public FormTemplateDto updateTemplate(String uuid, UpdateFormTemplateRequest request) {
        Long tenantId = TenantContext.getTenantId();
        FormTemplate template = findTemplateOrThrow(uuid, tenantId);

        if (template.getStatus() != TemplateStatus.DRAFT) {
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Only DRAFT templates can be updated. Current status: " + template.getStatus());
        }

        if (request.getName() != null) template.setName(request.getName());
        if (request.getDescription() != null) template.setDescription(request.getDescription());
        if (request.getCategory() != null) template.setCategory(parseCategory(request.getCategory()));
        if (request.getSchemaData() != null) template.setSchemaData(request.getSchemaData());

        return toTemplateDto(templateRepository.save(template));
    }

    @Override
    @Transactional
    public FormTemplateDto publishTemplate(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        FormTemplate template = findTemplateOrThrow(uuid, tenantId);

        if (template.getStatus() == TemplateStatus.PUBLISHED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Template is already published");
        }
        if (template.getStatus() == TemplateStatus.ARCHIVED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Archived templates cannot be published");
        }

        template.setStatus(TemplateStatus.PUBLISHED);
        log.info("Form template published uuid={} version={}", uuid, template.getVersion());
        return toTemplateDto(templateRepository.save(template));
    }

    @Override
    @Transactional
    public FormTemplateDto archiveTemplate(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        FormTemplate template = findTemplateOrThrow(uuid, tenantId);

        if (template.getStatus() == TemplateStatus.ARCHIVED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Template is already archived");
        }

        template.setStatus(TemplateStatus.ARCHIVED);
        log.info("Form template archived uuid={}", uuid);
        return toTemplateDto(templateRepository.save(template));
    }

    // ── Submissions ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public FormSubmissionDto submitForm(String templateUuid, SubmitFormRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Submitting form tenant={} template={} patient={}",
                tenantId, templateUuid, request.getPatientId());

        FormTemplate template = findTemplateOrThrow(templateUuid, tenantId);

        if (template.getStatus() != TemplateStatus.PUBLISHED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Form submissions are only accepted for PUBLISHED templates");
        }

        // Resolve patient by UUID
        Patient patient = patientRepository.findByTenantIdAndUuid(tenantId, request.getPatientId())
                .filter(p -> !p.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND));

        FormSubmission submission = FormSubmission.builder()
                .tenantId(tenantId)
                .templateId(template.getId())
                .patientId(patient.getId())
                .submittedBy(request.getPatientId()) // tracks who submitted (patient UUID / username)
                .submissionData(request.getSubmissionData())
                .status(SubmissionStatus.SUBMITTED)
                .build();

        FormSubmission saved = submissionRepository.save(submission);
        log.info("Form submission created uuid={}", saved.getUuid());
        return toSubmissionDto(saved, template.getName());
    }

    @Override
    public List<FormSubmissionDto> listSubmissionsForTemplate(String templateUuid) {
        Long tenantId = TenantContext.getTenantId();
        FormTemplate template = findTemplateOrThrow(templateUuid, tenantId);

        return submissionRepository
                .findByTemplateIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(template.getId(), tenantId)
                .stream()
                .map(s -> toSubmissionDto(s, template.getName()))
                .toList();
    }

    @Override
    public List<FormSubmissionDto> listSubmissionsForPatient(String patientUuid) {
        Long tenantId = TenantContext.getTenantId();

        Patient patient = patientRepository.findByTenantIdAndUuid(tenantId, patientUuid)
                .filter(p -> !p.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND));

        return submissionRepository
                .findByPatientIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(patient.getId(), tenantId)
                .stream()
                .map(s -> toSubmissionDto(s, null))
                .toList();
    }

    @Override
    @Transactional
    public FormSubmissionDto reviewSubmission(String submissionUuid, String reviewedBy) {
        Long tenantId = TenantContext.getTenantId();

        FormSubmission submission = submissionRepository.findByTenantIdAndUuid(tenantId, submissionUuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Submission not found"));

        if (submission.getStatus() == SubmissionStatus.ARCHIVED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Archived submissions cannot be reviewed");
        }

        submission.setStatus(SubmissionStatus.REVIEWED);
        submission.setReviewedBy(reviewedBy);
        submission.setReviewedAt(Instant.now());

        FormSubmission saved = submissionRepository.save(submission);

        // Resolve template name for response
        String templateName = templateRepository.findById(submission.getTemplateId())
                .map(FormTemplate::getName)
                .orElse(null);

        log.info("Submission reviewed uuid={} by={}", submissionUuid, reviewedBy);
        return toSubmissionDto(saved, templateName);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private FormTemplate findTemplateOrThrow(String uuid, Long tenantId) {
        return templateRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(t -> !t.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Form template not found"));
    }

    private TemplateCategory parseCategory(String value) {
        try {
            return TemplateCategory.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Invalid category: " + value + ". Must be one of: INTAKE, CONSENT, ASSESSMENT, CUSTOM");
        }
    }

    private TemplateStatus parseStatus(String value) {
        try {
            return TemplateStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Invalid status: " + value + ". Must be one of: DRAFT, PUBLISHED, ARCHIVED");
        }
    }

    private FormTemplateDto toTemplateDto(FormTemplate t) {
        return FormTemplateDto.builder()
                .uuid(t.getUuid())
                .name(t.getName())
                .description(t.getDescription())
                .category(t.getCategory() != null ? t.getCategory().name() : null)
                .schemaData(t.getSchemaData())
                .version(t.getVersion())
                .status(t.getStatus() != null ? t.getStatus().name() : null)
                .tenantId(t.getTenantId())
                .createdBy(t.getCreatedBy())
                .createdAt(t.getCreatedAt())
                .modifiedAt(t.getModifiedAt())
                .build();
    }

    private FormSubmissionDto toSubmissionDto(FormSubmission s, String templateName) {
        return FormSubmissionDto.builder()
                .uuid(s.getUuid())
                .templateId(s.getTemplateId())
                .templateName(templateName)
                .patientId(s.getPatientId())
                .submittedBy(s.getSubmittedBy())
                .submissionData(s.getSubmissionData())
                .status(s.getStatus() != null ? s.getStatus().name() : null)
                .reviewedBy(s.getReviewedBy())
                .reviewedAt(s.getReviewedAt())
                .createdAt(s.getCreatedAt())
                .modifiedAt(s.getModifiedAt())
                .build();
    }
}
