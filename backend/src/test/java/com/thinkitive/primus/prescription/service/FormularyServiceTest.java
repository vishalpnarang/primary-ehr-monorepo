package com.thinkitive.primus.prescription.service;

import com.thinkitive.primus.prescription.dto.AddDrugIntoleranceRequest;
import com.thinkitive.primus.prescription.dto.DrugIntoleranceDto;
import com.thinkitive.primus.prescription.dto.FormularyDto;
import com.thinkitive.primus.prescription.entity.DrugIntolerance;
import com.thinkitive.primus.prescription.entity.Formulary;
import com.thinkitive.primus.prescription.repository.DrugIntoleranceRepository;
import com.thinkitive.primus.prescription.repository.FormularyRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FormularyServiceTest {

    @Mock FormularyRepository formularyRepository;
    @Mock DrugIntoleranceRepository drugIntoleranceRepository;

    @InjectMocks
    FormularyServiceImpl formularyService;

    private Formulary testFormulary;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testFormulary = Formulary.builder()
                .tenantId(1L)
                .drugName("Metformin")
                .genericName("Metformin HCl")
                .ndc("00093-7267-98")
                .rxnormCode("860975")
                .strength("500mg")
                .form("TABLET")
                .route("ORAL")
                .drugClass("BIGUANIDE")
                .schedule("NONE")
                .requiresPa(false)
                .tier(1)
                .cost(new BigDecimal("12.50"))
                .isActive(true)
                .build();
        testFormulary.setId(1L);
        testFormulary.setUuid(UUID.randomUUID().toString());
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("searchFormulary returns matching drugs by name")
    void searchFormulary_returnsMatchingDrugs() {
        when(formularyRepository.findByTenantIdAndDrugNameContainingIgnoreCaseAndArchiveFalse(1L, "metformin"))
                .thenReturn(List.of(testFormulary));

        List<FormularyDto> result = formularyService.searchFormulary("metformin");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDrugName()).isEqualTo("Metformin");
        assertThat(result.get(0).getStrength()).isEqualTo("500mg");
        assertThat(result.get(0).isRequiresPa()).isFalse();
    }

    @Test
    @DisplayName("searchFormulary returns empty list when no match found")
    void searchFormulary_noMatch_returnsEmpty() {
        when(formularyRepository.findByTenantIdAndDrugNameContainingIgnoreCaseAndArchiveFalse(1L, "unknown"))
                .thenReturn(List.of());

        List<FormularyDto> result = formularyService.searchFormulary("unknown");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("addDrugIntolerance saves intolerance record and returns DTO")
    void addDrugIntolerance_persistsAndReturnsDto() {
        AddDrugIntoleranceRequest request = new AddDrugIntoleranceRequest();
        request.setDrugName("Penicillin");
        request.setRxnormCode("7980");
        request.setReaction("Urticaria and angioedema");
        request.setSeverity("SEVERE");
        request.setOnsetDate(LocalDate.of(2010, 6, 15));

        DrugIntolerance savedIntolerance = DrugIntolerance.builder()
                .tenantId(1L)
                .patientId(100L)
                .drugName("Penicillin")
                .rxnormCode("7980")
                .reaction("Urticaria and angioedema")
                .severity(DrugIntolerance.Severity.SEVERE)
                .onsetDate(LocalDate.of(2010, 6, 15))
                .build();
        savedIntolerance.setId(1L);
        savedIntolerance.setUuid(UUID.randomUUID().toString());

        when(drugIntoleranceRepository.save(any(DrugIntolerance.class))).thenReturn(savedIntolerance);

        DrugIntoleranceDto result = formularyService.addPatientIntolerance(100L, request);

        assertThat(result).isNotNull();
        assertThat(result.getDrugName()).isEqualTo("Penicillin");
        assertThat(result.getSeverity()).isEqualTo("SEVERE");
        assertThat(result.getReaction()).contains("Urticaria");
        verify(drugIntoleranceRepository).save(any(DrugIntolerance.class));
    }
}
