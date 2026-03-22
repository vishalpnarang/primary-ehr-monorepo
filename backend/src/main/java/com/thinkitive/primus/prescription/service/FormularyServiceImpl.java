package com.thinkitive.primus.prescription.service;

import com.thinkitive.primus.prescription.dto.*;
import com.thinkitive.primus.prescription.entity.DrugIntolerance;
import com.thinkitive.primus.prescription.entity.Formulary;
import com.thinkitive.primus.prescription.repository.DrugIntoleranceRepository;
import com.thinkitive.primus.prescription.repository.FormularyRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FormularyServiceImpl implements FormularyService {

    private final FormularyRepository formularyRepository;
    private final DrugIntoleranceRepository drugIntoleranceRepository;

    // ── Formulary ─────────────────────────────────────────────────────────────

    @Override
    public List<FormularyDto> getFormulary() {
        Long tenantId = TenantContext.getTenantId();
        return formularyRepository
                .findByTenantIdAndIsActiveTrueAndArchiveFalse(tenantId)
                .stream()
                .map(this::toFormularyDto)
                .toList();
    }

    @Override
    public List<FormularyDto> searchFormulary(String query) {
        Long tenantId = TenantContext.getTenantId();
        return formularyRepository
                .findByTenantIdAndDrugNameContainingIgnoreCaseAndArchiveFalse(tenantId, query)
                .stream()
                .map(this::toFormularyDto)
                .toList();
    }

    @Override
    @Transactional
    public FormularyDto createFormularyEntry(CreateFormularyRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating formulary entry tenant={} drug={}", tenantId, request.getDrugName());

        Formulary entry = Formulary.builder()
                .tenantId(tenantId)
                .drugName(request.getDrugName())
                .genericName(request.getGenericName())
                .ndc(request.getNdc())
                .rxnormCode(request.getRxnormCode())
                .strength(request.getStrength())
                .form(request.getForm())
                .route(request.getRoute())
                .drugClass(request.getDrugClass())
                .schedule(request.getSchedule())
                .requiresPa(request.isRequiresPa())
                .tier(request.getTier())
                .cost(request.getCost())
                .isActive(true)
                .build();

        Formulary saved = formularyRepository.save(entry);
        log.info("Formulary entry created uuid={}", saved.getUuid());
        return toFormularyDto(saved);
    }

    // ── Drug Intolerances ─────────────────────────────────────────────────────

    @Override
    public List<DrugIntoleranceDto> getPatientIntolerances(Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        return drugIntoleranceRepository
                .findByPatientIdAndTenantIdAndArchiveFalse(patientId, tenantId)
                .stream()
                .map(this::toIntoleranceDto)
                .toList();
    }

    @Override
    @Transactional
    public DrugIntoleranceDto addPatientIntolerance(Long patientId, AddDrugIntoleranceRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Adding drug intolerance tenant={} patient={} drug={}", tenantId, patientId, request.getDrugName());

        DrugIntolerance.Severity severity = parseSeverity(request.getSeverity());

        DrugIntolerance intolerance = DrugIntolerance.builder()
                .tenantId(tenantId)
                .patientId(patientId)
                .drugName(request.getDrugName())
                .rxnormCode(request.getRxnormCode())
                .reaction(request.getReaction())
                .severity(severity)
                .onsetDate(request.getOnsetDate())
                .build();

        DrugIntolerance saved = drugIntoleranceRepository.save(intolerance);
        log.info("Drug intolerance added uuid={}", saved.getUuid());
        return toIntoleranceDto(saved);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private DrugIntolerance.Severity parseSeverity(String value) {
        if (value == null) return null;
        try {
            return DrugIntolerance.Severity.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown severity '{}', ignoring", value);
            return null;
        }
    }

    private FormularyDto toFormularyDto(Formulary f) {
        return FormularyDto.builder()
                .uuid(f.getUuid())
                .drugName(f.getDrugName())
                .genericName(f.getGenericName())
                .ndc(f.getNdc())
                .rxnormCode(f.getRxnormCode())
                .strength(f.getStrength())
                .form(f.getForm())
                .route(f.getRoute())
                .drugClass(f.getDrugClass())
                .schedule(f.getSchedule())
                .requiresPa(f.isRequiresPa())
                .tier(f.getTier())
                .cost(f.getCost())
                .isActive(f.isActive())
                .createdAt(f.getCreatedAt())
                .modifiedAt(f.getModifiedAt())
                .build();
    }

    private DrugIntoleranceDto toIntoleranceDto(DrugIntolerance d) {
        return DrugIntoleranceDto.builder()
                .uuid(d.getUuid())
                .patientId(d.getPatientId())
                .drugName(d.getDrugName())
                .rxnormCode(d.getRxnormCode())
                .reaction(d.getReaction())
                .severity(d.getSeverity() != null ? d.getSeverity().name() : null)
                .onsetDate(d.getOnsetDate())
                .createdAt(d.getCreatedAt())
                .modifiedAt(d.getModifiedAt())
                .build();
    }
}
