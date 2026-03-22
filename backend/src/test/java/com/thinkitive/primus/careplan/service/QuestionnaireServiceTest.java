package com.thinkitive.primus.careplan.service;

import com.thinkitive.primus.careplan.dto.CreateQuestionnaireRequest;
import com.thinkitive.primus.careplan.dto.QuestionnaireDefinitionDto;
import com.thinkitive.primus.careplan.dto.QuestionnaireResponseDto;
import com.thinkitive.primus.careplan.dto.SubmitQuestionnaireResponseRequest;
import com.thinkitive.primus.careplan.entity.QuestionnaireDefinition;
import com.thinkitive.primus.careplan.entity.QuestionnaireResponse;
import com.thinkitive.primus.careplan.repository.QuestionnaireDefinitionRepository;
import com.thinkitive.primus.careplan.repository.QuestionnaireResponseRepository;
import com.thinkitive.primus.encounter.repository.EncounterRepository;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
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
class QuestionnaireServiceTest {

    @Mock QuestionnaireDefinitionRepository questionnaireDefinitionRepository;
    @Mock QuestionnaireResponseRepository questionnaireResponseRepository;
    @Mock PatientRepository patientRepository;
    @Mock EncounterRepository encounterRepository;

    @InjectMocks
    QuestionnaireServiceImpl questionnaireService;

    private QuestionnaireDefinition testDefinition;
    private Patient testPatient;
    private final String questionnaireUuid = UUID.randomUUID().toString();
    private final String patientUuid       = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testDefinition = QuestionnaireDefinition.builder()
                .tenantId(1L)
                .name("PHQ-9")
                .description("Patient Health Questionnaire - Depression Screening")
                .category(QuestionnaireDefinition.QuestionnaireCategory.PHQ9)
                .isPublished(true)
                .build();
        testDefinition.setId(1L);
        testDefinition.setUuid(questionnaireUuid);

        testPatient = Patient.builder()
                .tenantId(1L)
                .mrn("PAT-40001")
                .firstName("Sarah")
                .lastName("Williams")
                .dob(LocalDate.of(1985, 2, 14))
                .sex("FEMALE")
                .status(Patient.PatientStatus.ACTIVE)
                .build();
        testPatient.setId(300L);
        testPatient.setUuid(patientUuid);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("createQuestionnaire persists definition and returns DTO")
    void createQuestionnaire_persistsAndReturnsDto() {
        CreateQuestionnaireRequest request = new CreateQuestionnaireRequest();
        request.setName("GAD-7");
        request.setDescription("Generalized Anxiety Disorder Screening");
        request.setCategory("ANXIETY");
        request.setQuestions("{\"items\":[]}");
        request.setPublished(false);

        when(questionnaireDefinitionRepository.save(any(QuestionnaireDefinition.class)))
                .thenAnswer(inv -> {
                    QuestionnaireDefinition d = inv.getArgument(0);
                    d.setId(2L);
                    d.setUuid(UUID.randomUUID().toString());
                    return d;
                });

        QuestionnaireDefinitionDto result = questionnaireService.createQuestionnaire(request);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("GAD-7");
        assertThat(result.isPublished()).isFalse();
        verify(questionnaireDefinitionRepository).save(any(QuestionnaireDefinition.class));
    }

    @Test
    @DisplayName("submitResponse creates response with risk level based on score")
    void submitResponse_createsResponseWithRiskLevel() {
        SubmitQuestionnaireResponseRequest request = new SubmitQuestionnaireResponseRequest();
        request.setPatientUuid(patientUuid);
        request.setResponses("{\"q1\":2,\"q2\":1,\"q3\":3}");
        request.setTotalScore(12);
        request.setCompletedBy("provider-uuid-001");

        QuestionnaireResponse savedResponse = QuestionnaireResponse.builder()
                .tenantId(1L)
                .questionnaireId(1L)
                .patientId(300L)
                .responses(request.getResponses())
                .totalScore(12)
                .riskLevel("MODERATE")
                .completedBy("provider-uuid-001")
                .build();
        savedResponse.setId(50L);
        savedResponse.setUuid(UUID.randomUUID().toString());

        when(questionnaireDefinitionRepository.findByTenantIdAndUuid(1L, questionnaireUuid))
                .thenReturn(Optional.of(testDefinition));
        when(patientRepository.findByTenantIdAndUuid(1L, patientUuid))
                .thenReturn(Optional.of(testPatient));
        when(questionnaireResponseRepository.save(any(QuestionnaireResponse.class)))
                .thenReturn(savedResponse);

        QuestionnaireResponseDto result = questionnaireService.submitResponse(questionnaireUuid, request);

        assertThat(result).isNotNull();
        assertThat(result.getTotalScore()).isEqualTo(12);
        assertThat(result.getRiskLevel()).isEqualTo("MODERATE");
        verify(questionnaireResponseRepository).save(any(QuestionnaireResponse.class));
    }

    @Test
    @DisplayName("submitResponse throws PATIENT_NOT_FOUND when patient UUID is invalid")
    void submitResponse_patientNotFound_throws() {
        SubmitQuestionnaireResponseRequest request = new SubmitQuestionnaireResponseRequest();
        request.setPatientUuid(patientUuid);
        request.setResponses("{\"q1\":1}");
        request.setTotalScore(3);

        when(questionnaireDefinitionRepository.findByTenantIdAndUuid(1L, questionnaireUuid))
                .thenReturn(Optional.of(testDefinition));
        when(patientRepository.findByTenantIdAndUuid(1L, patientUuid))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> questionnaireService.submitResponse(questionnaireUuid, request))
                .isInstanceOf(PrimusException.class);
    }
}
