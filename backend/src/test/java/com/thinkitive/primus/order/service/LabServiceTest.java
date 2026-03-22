package com.thinkitive.primus.order.service;

import com.thinkitive.primus.order.dto.*;
import com.thinkitive.primus.order.entity.*;
import com.thinkitive.primus.order.repository.*;
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

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LabServiceTest {

    @Mock LabOrderSetRepository labOrderSetRepository;
    @Mock LabCatalogRepository labCatalogRepository;
    @Mock PocTestRepository pocTestRepository;
    @Mock PocResultRepository pocResultRepository;
    @Mock ImagingResultRepository imagingResultRepository;

    @InjectMocks
    LabServiceImpl labService;

    private PocTest testPocTest;
    private final String pocTestUuid = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testPocTest = PocTest.builder()
                .tenantId(1L)
                .name("Blood Glucose")
                .category("GLUCOSE")
                .resultFields("{\"glucose\":{\"unit\":\"mg/dL\",\"type\":\"numeric\"}}")
                .normalRanges("{\"glucose\":{\"min\":70,\"max\":100}}")
                .cptCode("82947")
                .build();
        testPocTest.setId(1L);
        testPocTest.setUuid(pocTestUuid);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("createOrderSet persists lab order set and returns DTO")
    void createOrderSet_persistsAndReturnsDto() {
        CreateLabOrderSetRequest request = new CreateLabOrderSetRequest();
        request.setName("Comprehensive Metabolic Panel");
        request.setDescription("CMP - standard metabolic workup");
        request.setTests("[\"CMP\",\"CBC\",\"LFT\"]");
        request.setDefaultIcdCodes("[\"Z00.00\"]");

        when(labOrderSetRepository.save(any(LabOrderSet.class))).thenAnswer(inv -> {
            LabOrderSet s = inv.getArgument(0);
            s.setId(1L);
            s.setUuid(UUID.randomUUID().toString());
            return s;
        });

        LabOrderSetDto result = labService.createOrderSet(request);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Comprehensive Metabolic Panel");
        assertThat(result.isActive()).isTrue();
        verify(labOrderSetRepository).save(any(LabOrderSet.class));
    }

    @Test
    @DisplayName("recordPocResult saves result linked to existing POC test")
    void recordPocResult_success() {
        RecordPocResultRequest request = new RecordPocResultRequest();
        request.setPocTestUuid(pocTestUuid);
        request.setPatientId(100L);
        request.setEncounterId(200L);
        request.setResults("{\"glucose\":95}");
        request.setPerformedBy("nurse-uuid-001");
        request.setPerformedAt(Instant.now());

        PocResult savedResult = PocResult.builder()
                .tenantId(1L)
                .pocTestId(1L)
                .patientId(100L)
                .encounterId(200L)
                .results("{\"glucose\":95}")
                .performedBy("nurse-uuid-001")
                .performedAt(request.getPerformedAt())
                .build();
        savedResult.setId(50L);
        savedResult.setUuid(UUID.randomUUID().toString());

        when(pocTestRepository.findByTenantIdAndUuid(1L, pocTestUuid))
                .thenReturn(Optional.of(testPocTest));
        when(pocResultRepository.save(any(PocResult.class))).thenReturn(savedResult);

        PocResultDto result = labService.recordPocResult(request);

        assertThat(result).isNotNull();
        assertThat(result.getPatientId()).isEqualTo(100L);
        assertThat(result.getPocTestUuid()).isEqualTo(pocTestUuid);
        verify(pocResultRepository).save(any(PocResult.class));
    }

    @Test
    @DisplayName("recordPocResult throws NOT_FOUND when POC test UUID is invalid")
    void recordPocResult_pocTestNotFound_throws() {
        RecordPocResultRequest request = new RecordPocResultRequest();
        request.setPocTestUuid(pocTestUuid);
        request.setPatientId(100L);
        request.setResults("{\"glucose\":95}");

        when(pocTestRepository.findByTenantIdAndUuid(1L, pocTestUuid))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> labService.recordPocResult(request))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("POC test not found");
    }

    @Test
    @DisplayName("getOrderSets returns active order sets for tenant")
    void getOrderSets_returnsList() {
        LabOrderSet orderSet = LabOrderSet.builder()
                .tenantId(1L)
                .name("Comprehensive Metabolic Panel")
                .description("CMP workup")
                .tests("[\"CMP\",\"CBC\"]")
                .isActive(true)
                .build();
        orderSet.setId(1L);
        orderSet.setUuid(UUID.randomUUID().toString());

        when(labOrderSetRepository.findByTenantIdAndIsActiveTrueAndArchiveFalse(1L))
                .thenReturn(List.of(orderSet));

        List<LabOrderSetDto> result = labService.getOrderSets();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Comprehensive Metabolic Panel");
        assertThat(result.get(0).isActive()).isTrue();
        verify(labOrderSetRepository).findByTenantIdAndIsActiveTrueAndArchiveFalse(1L);
    }

    @Test
    @DisplayName("searchCatalog returns catalog entries matching query string")
    void searchCatalog_withQuery_returnsMatches() {
        LabCatalog catalogEntry = LabCatalog.builder()
                .tenantId(1L)
                .testCode("CBC001")
                .testName("Complete Blood Count")
                .specimenType("Whole Blood")
                .container("EDTA tube")
                .cptCode("85025")
                .loincCode("58410-2")
                .isActive(true)
                .build();
        catalogEntry.setId(1L);
        catalogEntry.setUuid(UUID.randomUUID().toString());

        when(labCatalogRepository.findByTenantIdAndTestNameContainingIgnoreCaseAndArchiveFalse(
                1L, "blood"))
                .thenReturn(List.of(catalogEntry));

        List<LabCatalogDto> result = labService.searchCatalog("blood");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTestName()).isEqualTo("Complete Blood Count");
        assertThat(result.get(0).getCptCode()).isEqualTo("85025");
        verify(labCatalogRepository)
                .findByTenantIdAndTestNameContainingIgnoreCaseAndArchiveFalse(1L, "blood");
    }

    @Test
    @DisplayName("getPatientPocResults returns POC results ordered by performed date desc")
    void getPatientPocResults_returnsList() {
        PocResult result1 = PocResult.builder()
                .tenantId(1L)
                .pocTestId(1L)
                .patientId(100L)
                .results("{\"glucose\":95}")
                .performedBy("nurse-001")
                .performedAt(Instant.now().minusSeconds(3600))
                .build();
        result1.setId(1L);
        result1.setUuid(UUID.randomUUID().toString());

        PocResult result2 = PocResult.builder()
                .tenantId(1L)
                .pocTestId(1L)
                .patientId(100L)
                .results("{\"glucose\":102}")
                .performedBy("nurse-001")
                .performedAt(Instant.now())
                .build();
        result2.setId(2L);
        result2.setUuid(UUID.randomUUID().toString());

        when(pocResultRepository.findByPatientIdAndTenantIdAndArchiveFalseOrderByPerformedAtDesc(
                100L, 1L))
                .thenReturn(List.of(result2, result1));
        when(pocTestRepository.findById(1L)).thenReturn(Optional.of(testPocTest));

        List<PocResultDto> results = labService.getPatientPocResults(100L);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getPocTestUuid()).isEqualTo(pocTestUuid);
        verify(pocResultRepository)
                .findByPatientIdAndTenantIdAndArchiveFalseOrderByPerformedAtDesc(100L, 1L);
    }

    @Test
    @DisplayName("getImagingResults returns imaging results ordered by result date desc")
    void getImagingResults_returnsList() {
        ImagingResult imaging = ImagingResult.builder()
                .tenantId(1L)
                .patientId(100L)
                .modality("MRI")
                .studyDescription("MRI Brain without contrast")
                .radiologist("Dr. Nguyen")
                .report("No acute intracranial abnormality.")
                .impression("Normal MRI brain.")
                .status(ImagingResult.ImagingStatus.FINAL)
                .resultDate(Instant.now())
                .build();
        imaging.setId(1L);
        imaging.setUuid(UUID.randomUUID().toString());

        when(imagingResultRepository.findByPatientIdAndTenantIdAndArchiveFalseOrderByResultDateDesc(
                100L, 1L))
                .thenReturn(List.of(imaging));

        List<ImagingResultDto> results = labService.getImagingResults(100L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getModality()).isEqualTo("MRI");
        assertThat(results.get(0).getStatus()).isEqualTo("FINAL");
        verify(imagingResultRepository)
                .findByPatientIdAndTenantIdAndArchiveFalseOrderByResultDateDesc(100L, 1L);
    }

    @Test
    @DisplayName("addImagingResult persists imaging result and returns DTO")
    void addImagingResult_persistsAndReturnsDto() {
        AddImagingResultRequest request = new AddImagingResultRequest();
        request.setPatientId(100L);
        request.setModality("X-RAY");
        request.setStudyDescription("Chest X-Ray PA and Lateral");
        request.setRadiologist("Dr. Emily Chen");
        request.setReport("No acute cardiopulmonary process identified.");
        request.setImpression("Normal chest radiograph.");
        request.setStatus("FINAL");
        request.setResultDate(Instant.now());

        ImagingResult savedResult = ImagingResult.builder()
                .tenantId(1L)
                .patientId(100L)
                .modality("X-RAY")
                .studyDescription("Chest X-Ray PA and Lateral")
                .radiologist("Dr. Emily Chen")
                .report("No acute cardiopulmonary process identified.")
                .impression("Normal chest radiograph.")
                .status(ImagingResult.ImagingStatus.FINAL)
                .resultDate(Instant.now())
                .build();
        savedResult.setId(1L);
        savedResult.setUuid(UUID.randomUUID().toString());

        when(imagingResultRepository.save(any(ImagingResult.class))).thenReturn(savedResult);

        ImagingResultDto result = labService.addImagingResult(request);

        assertThat(result).isNotNull();
        assertThat(result.getModality()).isEqualTo("X-RAY");
        assertThat(result.getStatus()).isEqualTo("FINAL");
        verify(imagingResultRepository).save(any(ImagingResult.class));
    }
}
