package com.thinkitive.primus.template.service;

import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
import com.thinkitive.primus.template.dto.CreateFormTemplateRequest;
import com.thinkitive.primus.template.dto.FormSubmissionDto;
import com.thinkitive.primus.template.dto.FormTemplateDto;
import com.thinkitive.primus.template.dto.SubmitFormRequest;
import com.thinkitive.primus.template.entity.FormSubmission;
import com.thinkitive.primus.template.entity.FormTemplate;
import com.thinkitive.primus.template.entity.FormTemplate.TemplateStatus;
import com.thinkitive.primus.template.repository.FormSubmissionRepository;
import com.thinkitive.primus.template.repository.FormTemplateRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FormTemplateServiceTest {

    @Mock FormTemplateRepository templateRepository;
    @Mock FormSubmissionRepository submissionRepository;
    @Mock PatientRepository patientRepository;

    @InjectMocks
    FormTemplateServiceImpl formTemplateService;

    private FormTemplate draftTemplate;
    private FormTemplate publishedTemplate;
    private Patient testPatient;
    private final String templateUuid = UUID.randomUUID().toString();
    private final String patientUuid  = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        draftTemplate = FormTemplate.builder()
                .tenantId(1L)
                .name("Intake Form")
                .description("New patient intake")
                .category(FormTemplate.TemplateCategory.INTAKE)
                .version(1)
                .status(TemplateStatus.DRAFT)
                .build();
        draftTemplate.setId(1L);
        draftTemplate.setUuid(templateUuid);

        publishedTemplate = FormTemplate.builder()
                .tenantId(1L)
                .name("Consent Form")
                .description("Informed consent")
                .category(FormTemplate.TemplateCategory.CONSENT)
                .version(1)
                .status(TemplateStatus.PUBLISHED)
                .build();
        publishedTemplate.setId(2L);
        publishedTemplate.setUuid(UUID.randomUUID().toString());

        testPatient = Patient.builder()
                .tenantId(1L)
                .mrn("PAT-20001")
                .firstName("Robert")
                .lastName("Johnson")
                .dob(LocalDate.of(1975, 4, 10))
                .sex("MALE")
                .status(Patient.PatientStatus.ACTIVE)
                .build();
        testPatient.setId(100L);
        testPatient.setUuid(patientUuid);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("createTemplate saves a DRAFT template and returns DTO")
    void createTemplate_persistsDraftAndReturnsDto() {
        CreateFormTemplateRequest request = new CreateFormTemplateRequest();
        request.setName("Intake Form");
        request.setDescription("New patient intake");
        request.setCategory("INTAKE");
        request.setSchemaData("{\"fields\":[]}");

        when(templateRepository.existsByTenantIdAndNameAndVersion(1L, "Intake Form", 1)).thenReturn(false);
        when(templateRepository.save(any(FormTemplate.class))).thenAnswer(inv -> {
            FormTemplate t = inv.getArgument(0);
            t.setId(1L);
            t.setUuid(UUID.randomUUID().toString());
            return t;
        });

        FormTemplateDto result = formTemplateService.createTemplate(request);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Intake Form");
        assertThat(result.getStatus()).isEqualTo("DRAFT");
        verify(templateRepository).save(any(FormTemplate.class));
    }

    @Test
    @DisplayName("publishTemplate transitions DRAFT to PUBLISHED")
    void publishTemplate_success() {
        when(templateRepository.findByTenantIdAndUuid(1L, templateUuid))
                .thenReturn(Optional.of(draftTemplate));
        when(templateRepository.save(any(FormTemplate.class))).thenAnswer(inv -> inv.getArgument(0));

        FormTemplateDto result = formTemplateService.publishTemplate(templateUuid);

        assertThat(result.getStatus()).isEqualTo("PUBLISHED");
    }

    @Test
    @DisplayName("publishTemplate throws BAD_REQUEST when template is already PUBLISHED")
    void publishTemplate_alreadyPublished_throws() {
        String pubUuid = publishedTemplate.getUuid();
        when(templateRepository.findByTenantIdAndUuid(1L, pubUuid))
                .thenReturn(Optional.of(publishedTemplate));

        assertThatThrownBy(() -> formTemplateService.publishTemplate(pubUuid))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("already published");
    }

    @Test
    @DisplayName("submitForm creates submission for a PUBLISHED template")
    void submitForm_success() {
        String pubUuid = publishedTemplate.getUuid();

        SubmitFormRequest request = new SubmitFormRequest();
        request.setPatientId(patientUuid);
        request.setSubmissionData("{\"answer\":\"yes\"}");

        when(templateRepository.findByTenantIdAndUuid(1L, pubUuid))
                .thenReturn(Optional.of(publishedTemplate));
        when(patientRepository.findByTenantIdAndUuid(1L, patientUuid))
                .thenReturn(Optional.of(testPatient));
        when(submissionRepository.save(any(FormSubmission.class))).thenAnswer(inv -> {
            FormSubmission s = inv.getArgument(0);
            s.setId(50L);
            s.setUuid(UUID.randomUUID().toString());
            return s;
        });

        FormSubmissionDto result = formTemplateService.submitForm(pubUuid, request);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("SUBMITTED");
        verify(submissionRepository).save(any(FormSubmission.class));
    }

    @Test
    @DisplayName("submitForm throws BAD_REQUEST when template is not PUBLISHED")
    void submitForm_templateNotPublished_throws() {
        SubmitFormRequest request = new SubmitFormRequest();
        request.setPatientId(patientUuid);
        request.setSubmissionData("{\"answer\":\"no\"}");

        when(templateRepository.findByTenantIdAndUuid(1L, templateUuid))
                .thenReturn(Optional.of(draftTemplate));

        assertThatThrownBy(() -> formTemplateService.submitForm(templateUuid, request))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("PUBLISHED");
    }

    @Test
    @DisplayName("listTemplates returns templates filtered by category")
    void listTemplates_filtersByCategory() {
        when(templateRepository.findFiltered(1L,
                com.thinkitive.primus.template.entity.FormTemplate.TemplateCategory.INTAKE, null))
                .thenReturn(java.util.List.of(draftTemplate));

        java.util.List<FormTemplateDto> result = formTemplateService.listTemplates("INTAKE", null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo("INTAKE");
        verify(templateRepository).findFiltered(1L,
                com.thinkitive.primus.template.entity.FormTemplate.TemplateCategory.INTAKE, null);
    }

    @Test
    @DisplayName("getTemplate throws NOT_FOUND when UUID does not exist for tenant")
    void getTemplate_notFound_throws() {
        String unknownUuid = UUID.randomUUID().toString();
        when(templateRepository.findByTenantIdAndUuid(1L, unknownUuid))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> formTemplateService.getTemplate(unknownUuid))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("Form template not found");
    }

    @Test
    @DisplayName("updateTemplate throws BAD_REQUEST when template is already PUBLISHED")
    void updateTemplate_onPublished_throws() {
        String pubUuid = publishedTemplate.getUuid();
        when(templateRepository.findByTenantIdAndUuid(1L, pubUuid))
                .thenReturn(Optional.of(publishedTemplate));

        com.thinkitive.primus.template.dto.UpdateFormTemplateRequest update =
                new com.thinkitive.primus.template.dto.UpdateFormTemplateRequest();
        update.setName("Updated Name");

        assertThatThrownBy(() -> formTemplateService.updateTemplate(pubUuid, update))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("Only DRAFT templates can be updated");
    }

    @Test
    @DisplayName("listSubmissionsForPatient returns submissions for a known patient")
    void listSubmissionsForPatient_returnsSubmissions() {
        FormSubmission submission = FormSubmission.builder()
                .tenantId(1L)
                .templateId(2L)
                .patientId(100L)
                .submittedBy(patientUuid)
                .submissionData("{\"answer\":\"yes\"}")
                .status(FormSubmission.SubmissionStatus.SUBMITTED)
                .build();
        submission.setId(50L);
        submission.setUuid(UUID.randomUUID().toString());

        when(patientRepository.findByTenantIdAndUuid(1L, patientUuid))
                .thenReturn(Optional.of(testPatient));
        when(submissionRepository.findByPatientIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(100L, 1L))
                .thenReturn(java.util.List.of(submission));

        java.util.List<FormSubmissionDto> result =
                formTemplateService.listSubmissionsForPatient(patientUuid);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo("SUBMITTED");
        assertThat(result.get(0).getPatientId()).isEqualTo(100L);
    }
}
