package com.thinkitive.primus.order.service;

import com.thinkitive.primus.order.dto.*;
import com.thinkitive.primus.order.entity.*;
import com.thinkitive.primus.order.repository.*;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LabServiceImpl implements LabService {

    private final LabOrderSetRepository labOrderSetRepository;
    private final LabCatalogRepository labCatalogRepository;
    private final PocTestRepository pocTestRepository;
    private final PocResultRepository pocResultRepository;
    private final ImagingResultRepository imagingResultRepository;

    // ── Order Sets ────────────────────────────────────────────────────────────

    @Override
    public List<LabOrderSetDto> getOrderSets() {
        Long tenantId = TenantContext.getTenantId();
        return labOrderSetRepository
                .findByTenantIdAndIsActiveTrueAndArchiveFalse(tenantId)
                .stream()
                .map(this::toOrderSetDto)
                .toList();
    }

    @Override
    @Transactional
    public LabOrderSetDto createOrderSet(CreateLabOrderSetRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating lab order set tenant={} name={}", tenantId, request.getName());

        LabOrderSet set = LabOrderSet.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .tests(request.getTests())
                .defaultIcdCodes(request.getDefaultIcdCodes())
                .isActive(true)
                .build();

        LabOrderSet saved = labOrderSetRepository.save(set);
        log.info("Lab order set created uuid={}", saved.getUuid());
        return toOrderSetDto(saved);
    }

    // ── Lab Catalog ───────────────────────────────────────────────────────────

    @Override
    public List<LabCatalogDto> getLabCatalog() {
        Long tenantId = TenantContext.getTenantId();
        return labCatalogRepository
                .findByTenantIdAndIsActiveTrueAndArchiveFalse(tenantId)
                .stream()
                .map(this::toCatalogDto)
                .toList();
    }

    @Override
    public List<LabCatalogDto> searchCatalog(String query) {
        Long tenantId = TenantContext.getTenantId();
        return labCatalogRepository
                .findByTenantIdAndTestNameContainingIgnoreCaseAndArchiveFalse(tenantId, query)
                .stream()
                .map(this::toCatalogDto)
                .toList();
    }

    // ── POC Tests ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PocTestDto createPocTest(CreatePocTestRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating POC test tenant={} name={}", tenantId, request.getName());

        PocTest test = PocTest.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .category(request.getCategory())
                .resultFields(request.getResultFields())
                .normalRanges(request.getNormalRanges())
                .cptCode(request.getCptCode())
                .build();

        PocTest saved = pocTestRepository.save(test);
        log.info("POC test created uuid={}", saved.getUuid());
        return toPocTestDto(saved);
    }

    @Override
    public List<PocTestDto> getPocTests() {
        Long tenantId = TenantContext.getTenantId();
        return pocTestRepository
                .findByTenantIdAndArchiveFalse(tenantId)
                .stream()
                .map(this::toPocTestDto)
                .toList();
    }

    // ── POC Results ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PocResultDto recordPocResult(RecordPocResultRequest request) {
        Long tenantId = TenantContext.getTenantId();
        PocTest test = pocTestRepository.findByTenantIdAndUuid(tenantId, request.getPocTestUuid())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "POC test not found: " + request.getPocTestUuid()));

        Instant performedAt = request.getPerformedAt() != null ? request.getPerformedAt() : Instant.now();

        PocResult result = PocResult.builder()
                .tenantId(tenantId)
                .pocTestId(test.getId())
                .patientId(request.getPatientId())
                .encounterId(request.getEncounterId())
                .results(request.getResults())
                .performedBy(request.getPerformedBy())
                .performedAt(performedAt)
                .build();

        PocResult saved = pocResultRepository.save(result);
        log.info("POC result recorded uuid={} patient={}", saved.getUuid(), request.getPatientId());
        return toPocResultDto(saved, test.getUuid());
    }

    @Override
    public List<PocResultDto> getPatientPocResults(Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        return pocResultRepository
                .findByPatientIdAndTenantIdAndArchiveFalseOrderByPerformedAtDesc(patientId, tenantId)
                .stream()
                .map(r -> {
                    String testUuid = pocTestRepository.findById(r.getPocTestId())
                            .map(PocTest::getUuid).orElse(null);
                    return toPocResultDto(r, testUuid);
                })
                .toList();
    }

    // ── Imaging ───────────────────────────────────────────────────────────────

    @Override
    public List<ImagingResultDto> getImagingResults(Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        return imagingResultRepository
                .findByPatientIdAndTenantIdAndArchiveFalseOrderByResultDateDesc(patientId, tenantId)
                .stream()
                .map(this::toImagingResultDto)
                .toList();
    }

    @Override
    @Transactional
    public ImagingResultDto addImagingResult(AddImagingResultRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Adding imaging result tenant={} patient={} modality={}",
                tenantId, request.getPatientId(), request.getModality());

        ImagingResult.ImagingStatus status = parseImagingStatus(request.getStatus());

        ImagingResult result = ImagingResult.builder()
                .tenantId(tenantId)
                .orderId(request.getOrderId())
                .patientId(request.getPatientId())
                .modality(request.getModality())
                .studyDescription(request.getStudyDescription())
                .radiologist(request.getRadiologist())
                .report(request.getReport())
                .impression(request.getImpression())
                .status(status)
                .resultDate(request.getResultDate())
                .build();

        ImagingResult saved = imagingResultRepository.save(result);
        log.info("Imaging result added uuid={}", saved.getUuid());
        return toImagingResultDto(saved);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private ImagingResult.ImagingStatus parseImagingStatus(String value) {
        if (value == null) return ImagingResult.ImagingStatus.PENDING;
        try {
            return ImagingResult.ImagingStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown imaging status '{}', defaulting to PENDING", value);
            return ImagingResult.ImagingStatus.PENDING;
        }
    }

    private LabOrderSetDto toOrderSetDto(LabOrderSet s) {
        return LabOrderSetDto.builder()
                .uuid(s.getUuid())
                .name(s.getName())
                .description(s.getDescription())
                .tests(s.getTests())
                .defaultIcdCodes(s.getDefaultIcdCodes())
                .isActive(s.isActive())
                .createdAt(s.getCreatedAt())
                .modifiedAt(s.getModifiedAt())
                .build();
    }

    private LabCatalogDto toCatalogDto(LabCatalog c) {
        return LabCatalogDto.builder()
                .uuid(c.getUuid())
                .testCode(c.getTestCode())
                .testName(c.getTestName())
                .specimenType(c.getSpecimenType())
                .container(c.getContainer())
                .volume(c.getVolume())
                .stability(c.getStability())
                .cptCode(c.getCptCode())
                .loincCode(c.getLoincCode())
                .department(c.getDepartment())
                .isActive(c.isActive())
                .createdAt(c.getCreatedAt())
                .modifiedAt(c.getModifiedAt())
                .build();
    }

    private PocTestDto toPocTestDto(PocTest t) {
        return PocTestDto.builder()
                .uuid(t.getUuid())
                .name(t.getName())
                .category(t.getCategory())
                .resultFields(t.getResultFields())
                .normalRanges(t.getNormalRanges())
                .cptCode(t.getCptCode())
                .createdAt(t.getCreatedAt())
                .modifiedAt(t.getModifiedAt())
                .build();
    }

    private PocResultDto toPocResultDto(PocResult r, String pocTestUuid) {
        return PocResultDto.builder()
                .uuid(r.getUuid())
                .pocTestUuid(pocTestUuid)
                .patientId(r.getPatientId())
                .encounterId(r.getEncounterId())
                .results(r.getResults())
                .performedBy(r.getPerformedBy())
                .performedAt(r.getPerformedAt())
                .createdAt(r.getCreatedAt())
                .modifiedAt(r.getModifiedAt())
                .build();
    }

    private ImagingResultDto toImagingResultDto(ImagingResult r) {
        return ImagingResultDto.builder()
                .uuid(r.getUuid())
                .orderId(r.getOrderId())
                .patientId(r.getPatientId())
                .modality(r.getModality())
                .studyDescription(r.getStudyDescription())
                .radiologist(r.getRadiologist())
                .report(r.getReport())
                .impression(r.getImpression())
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .resultDate(r.getResultDate())
                .createdAt(r.getCreatedAt())
                .modifiedAt(r.getModifiedAt())
                .build();
    }
}
