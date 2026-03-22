package com.thinkitive.primus.template.service;

import com.thinkitive.primus.encounter.repository.EncounterRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
import com.thinkitive.primus.template.dto.*;
import com.thinkitive.primus.template.entity.Macro;
import com.thinkitive.primus.template.entity.SoapNoteTemplate;
import com.thinkitive.primus.template.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClinicalTemplateServiceTest {

    @Mock MacroRepository macroRepository;
    @Mock SoapNoteTemplateRepository soapNoteTemplateRepository;
    @Mock RosTemplateRepository rosTemplateRepository;
    @Mock PhysicalExamTemplateRepository physicalExamTemplateRepository;
    @Mock AnnotableImageRepository annotableImageRepository;
    @Mock AnnotableImagePinRepository annotableImagePinRepository;
    @Mock EncounterRepository encounterRepository;

    @InjectMocks
    ClinicalTemplateServiceImpl clinicalTemplateService;

    private Macro testMacro;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testMacro = Macro.builder()
                .tenantId(1L)
                .name("Normal Exam")
                .abbreviation(".normexam")
                .expansion("Normal physical examination findings. No acute distress.")
                .isShared(true)
                .build();
        testMacro.setId(1L);
        testMacro.setUuid(UUID.randomUUID().toString());
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("createMacro saves macro and returns DTO with correct fields")
    void createMacro_persistsAndReturnsDto() {
        CreateMacroRequest request = new CreateMacroRequest();
        request.setName("Normal Exam");
        request.setAbbreviation(".normexam");
        request.setExpansion("Normal physical examination findings. No acute distress.");
        request.setShared(true);

        when(macroRepository.findByTenantIdAndAbbreviationAndArchiveFalse(1L, ".normexam"))
                .thenReturn(Optional.empty());
        when(macroRepository.save(any(Macro.class))).thenAnswer(inv -> {
            Macro m = inv.getArgument(0);
            m.setId(1L);
            m.setUuid(UUID.randomUUID().toString());
            return m;
        });

        MacroDto result = clinicalTemplateService.createMacro(request);

        assertThat(result).isNotNull();
        assertThat(result.getAbbreviation()).isEqualTo(".normexam");
        assertThat(result.getExpansion()).contains("Normal physical");
        verify(macroRepository).save(any(Macro.class));
    }

    @Test
    @DisplayName("expandMacro returns expansion text when abbreviation is found")
    void expandMacro_found_returnsExpansion() {
        when(macroRepository.findByTenantIdAndAbbreviationAndArchiveFalse(1L, ".normexam"))
                .thenReturn(Optional.of(testMacro));

        MacroExpandResponse result = clinicalTemplateService.expandMacro(".normexam");

        assertThat(result).isNotNull();
        assertThat(result.getAbbreviation()).isEqualTo(".normexam");
        assertThat(result.getExpansion()).isNotBlank();
    }

    @Test
    @DisplayName("expandMacro throws NOT_FOUND when abbreviation does not exist")
    void expandMacro_notFound_throws() {
        when(macroRepository.findByTenantIdAndAbbreviationAndArchiveFalse(1L, ".unknown"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> clinicalTemplateService.expandMacro(".unknown"))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("Macro abbreviation not found");
    }

    @Test
    @DisplayName("createSoapNoteTemplate saves template and returns DTO")
    void createSoapNoteTemplate_persistsAndReturnsDto() {
        CreateSoapNoteTemplateRequest request = new CreateSoapNoteTemplateRequest();
        request.setName("Annual Physical");
        request.setCategory("PREVENTIVE");
        request.setSubjectiveTemplate("Patient presents for annual physical exam.");
        request.setObjectiveTemplate("Vitals: {{vitals}}. General: Well-appearing.");
        request.setAssessmentTemplate("1. Annual physical exam - complete");
        request.setPlanTemplate("Continue current medications. Follow up in 1 year.");
        request.setDefault(false);

        SoapNoteTemplate saved = SoapNoteTemplate.builder()
                .tenantId(1L)
                .name("Annual Physical")
                .subjectiveTemplate(request.getSubjectiveTemplate())
                .objectiveTemplate(request.getObjectiveTemplate())
                .assessmentTemplate(request.getAssessmentTemplate())
                .planTemplate(request.getPlanTemplate())
                .build();
        saved.setId(1L);
        saved.setUuid(UUID.randomUUID().toString());

        when(soapNoteTemplateRepository.save(any(SoapNoteTemplate.class))).thenReturn(saved);

        SoapNoteTemplateDto result = clinicalTemplateService.createSoapNoteTemplate(request);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Annual Physical");
        assertThat(result.getSubjectiveTemplate()).isNotBlank();
        verify(soapNoteTemplateRepository).save(any(SoapNoteTemplate.class));
    }
}
