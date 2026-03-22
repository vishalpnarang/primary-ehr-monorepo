package com.thinkitive.primus.template.service;

import com.thinkitive.primus.encounter.repository.EncounterRepository;
import com.thinkitive.primus.template.dto.*;
import com.thinkitive.primus.template.entity.*;
import com.thinkitive.primus.template.repository.*;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClinicalTemplateServiceImpl implements ClinicalTemplateService {

    private final MacroRepository macroRepository;
    private final SoapNoteTemplateRepository soapNoteTemplateRepository;
    private final RosTemplateRepository rosTemplateRepository;
    private final PhysicalExamTemplateRepository physicalExamTemplateRepository;
    private final AnnotableImageRepository annotableImageRepository;
    private final AnnotableImagePinRepository annotableImagePinRepository;
    private final EncounterRepository encounterRepository;

    // ── Macros ────────────────────────────────────────────────────────────────

    @Override
    public List<MacroDto> getMacros(String category) {
        Long tenantId = TenantContext.getTenantId();
        List<Macro> macros = (category != null && !category.isBlank())
                ? macroRepository.findByTenantIdAndCategoryAndArchiveFalse(
                        tenantId, parseMacroCategory(category))
                : macroRepository.findByTenantIdAndArchiveFalse(tenantId);
        return macros.stream().map(this::toMacroDto).toList();
    }

    @Override
    @Transactional
    public MacroDto createMacro(CreateMacroRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating macro tenant={} abbreviation={}", tenantId, request.getAbbreviation());

        macroRepository.findByTenantIdAndAbbreviationAndArchiveFalse(tenantId, request.getAbbreviation())
                .ifPresent(m -> {
                    throw new PrimusException(ResponseCode.CONFLICT,
                            "Abbreviation already in use: " + request.getAbbreviation());
                });

        Macro macro = Macro.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .abbreviation(request.getAbbreviation())
                .expansion(request.getExpansion())
                .category(request.getCategory() != null ? parseMacroCategory(request.getCategory()) : null)
                .isShared(request.isShared())
                .createdByProvider(request.getCreatedByProvider())
                .build();

        Macro saved = macroRepository.save(macro);
        log.info("Macro created uuid={}", saved.getUuid());
        return toMacroDto(saved);
    }

    @Override
    public MacroExpandResponse expandMacro(String abbreviation) {
        Long tenantId = TenantContext.getTenantId();
        Macro macro = macroRepository.findByTenantIdAndAbbreviationAndArchiveFalse(tenantId, abbreviation)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Macro abbreviation not found: " + abbreviation));
        return MacroExpandResponse.builder()
                .abbreviation(macro.getAbbreviation())
                .expansion(macro.getExpansion())
                .category(macro.getCategory() != null ? macro.getCategory().name() : null)
                .build();
    }

    @Override
    @Transactional
    public void deleteMacro(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Macro macro = macroRepository.findByTenantIdAndUuid(tenantId, uuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Macro not found: " + uuid));
        macro.setArchive(true);
        macroRepository.save(macro);
        log.info("Macro archived uuid={}", uuid);
    }

    // ── SOAP Note Templates ───────────────────────────────────────────────────

    @Override
    public List<SoapNoteTemplateDto> getSoapNoteTemplates(String category) {
        Long tenantId = TenantContext.getTenantId();
        List<SoapNoteTemplate> templates = (category != null && !category.isBlank())
                ? soapNoteTemplateRepository.findByTenantIdAndCategoryAndArchiveFalse(
                        tenantId, parseSoapCategory(category))
                : soapNoteTemplateRepository.findByTenantIdAndArchiveFalse(tenantId);
        return templates.stream().map(this::toSoapTemplateDto).toList();
    }

    @Override
    @Transactional
    public SoapNoteTemplateDto createSoapNoteTemplate(CreateSoapNoteTemplateRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating SOAP note template tenant={} name={}", tenantId, request.getName());

        SoapNoteTemplate template = SoapNoteTemplate.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .category(request.getCategory() != null ? parseSoapCategory(request.getCategory()) : null)
                .subjectiveTemplate(request.getSubjectiveTemplate())
                .objectiveTemplate(request.getObjectiveTemplate())
                .assessmentTemplate(request.getAssessmentTemplate())
                .planTemplate(request.getPlanTemplate())
                .isDefault(request.isDefault())
                .build();

        SoapNoteTemplate saved = soapNoteTemplateRepository.save(template);
        log.info("SOAP template created uuid={}", saved.getUuid());
        return toSoapTemplateDto(saved);
    }

    @Override
    public SoapNoteTemplateDto getSoapNoteTemplate(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        SoapNoteTemplate template = soapNoteTemplateRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(t -> !t.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "SOAP template not found: " + uuid));
        return toSoapTemplateDto(template);
    }

    @Override
    @Transactional
    public void deleteSoapNoteTemplate(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        SoapNoteTemplate t = soapNoteTemplateRepository.findByTenantIdAndUuid(tenantId, uuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "SOAP template not found: " + uuid));
        t.setArchive(true);
        soapNoteTemplateRepository.save(t);
    }

    // ── ROS Templates ─────────────────────────────────────────────────────────

    @Override
    public List<RosTemplateDto> getRosTemplates() {
        Long tenantId = TenantContext.getTenantId();
        return rosTemplateRepository.findByTenantIdAndArchiveFalse(tenantId)
                .stream().map(this::toRosTemplateDto).toList();
    }

    @Override
    @Transactional
    public RosTemplateDto createRosTemplate(CreateRosTemplateRequest request) {
        Long tenantId = TenantContext.getTenantId();
        RosTemplate template = RosTemplate.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .systems(request.getSystems())
                .isDefault(request.isDefault())
                .build();
        RosTemplate saved = rosTemplateRepository.save(template);
        log.info("ROS template created uuid={}", saved.getUuid());
        return toRosTemplateDto(saved);
    }

    @Override
    public RosTemplateDto getRosTemplate(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        RosTemplate t = rosTemplateRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(r -> !r.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "ROS template not found: " + uuid));
        return toRosTemplateDto(t);
    }

    @Override
    @Transactional
    public void deleteRosTemplate(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        RosTemplate t = rosTemplateRepository.findByTenantIdAndUuid(tenantId, uuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "ROS template not found: " + uuid));
        t.setArchive(true);
        rosTemplateRepository.save(t);
    }

    // ── Physical Exam Templates ───────────────────────────────────────────────

    @Override
    public List<PhysicalExamTemplateDto> getPhysicalExamTemplates() {
        Long tenantId = TenantContext.getTenantId();
        return physicalExamTemplateRepository.findByTenantIdAndArchiveFalse(tenantId)
                .stream().map(this::toPeTemplateDto).toList();
    }

    @Override
    @Transactional
    public PhysicalExamTemplateDto createPhysicalExamTemplate(CreatePhysicalExamTemplateRequest request) {
        Long tenantId = TenantContext.getTenantId();
        PhysicalExamTemplate template = PhysicalExamTemplate.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .sections(request.getSections())
                .isDefault(request.isDefault())
                .build();
        PhysicalExamTemplate saved = physicalExamTemplateRepository.save(template);
        log.info("PE template created uuid={}", saved.getUuid());
        return toPeTemplateDto(saved);
    }

    @Override
    public PhysicalExamTemplateDto getPhysicalExamTemplate(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        PhysicalExamTemplate t = physicalExamTemplateRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(p -> !p.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "PE template not found: " + uuid));
        return toPeTemplateDto(t);
    }

    @Override
    @Transactional
    public void deletePhysicalExamTemplate(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        PhysicalExamTemplate t = physicalExamTemplateRepository.findByTenantIdAndUuid(tenantId, uuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "PE template not found: " + uuid));
        t.setArchive(true);
        physicalExamTemplateRepository.save(t);
    }

    // ── Annotable Images ──────────────────────────────────────────────────────

    @Override
    public List<AnnotableImageDto> getAnnotableImages() {
        Long tenantId = TenantContext.getTenantId();
        List<AnnotableImage> tenantImages = annotableImageRepository.findByTenantIdAndArchiveFalse(tenantId);
        List<AnnotableImage> systemImages = annotableImageRepository.findByIsSystemTrueAndArchiveFalse();

        // Merge — system images visible to all tenants; tenant images are custom uploads
        return java.util.stream.Stream.concat(systemImages.stream(), tenantImages.stream())
                .distinct()
                .map(this::toAnnotableImageDto)
                .toList();
    }

    @Override
    @Transactional
    public AnnotableImagePinDto addPin(String imageUuid, AddPinRequest request) {
        Long tenantId = TenantContext.getTenantId();

        AnnotableImage image = annotableImageRepository.findByUuidAndArchiveFalse(imageUuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Annotable image not found: " + imageUuid));

        // Resolve optional encounter ID from uuid
        Long encounterId = null;
        if (request.getEncounterUuid() != null && !request.getEncounterUuid().isBlank()) {
            encounterId = encounterRepository.findByTenantIdAndUuid(tenantId, request.getEncounterUuid())
                    .map(e -> e.getId())
                    .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                            "Encounter not found: " + request.getEncounterUuid()));
        }

        AnnotableImagePin pin = AnnotableImagePin.builder()
                .tenantId(tenantId)
                .imageId(image.getId())
                .encounterId(encounterId)
                .xPosition(request.getXPosition())
                .yPosition(request.getYPosition())
                .label(request.getLabel())
                .notes(request.getNotes())
                .color(request.getColor() != null ? request.getColor() : "#FF0000")
                .build();

        AnnotableImagePin saved = annotableImagePinRepository.save(pin);
        log.info("Image pin created uuid={} imageId={}", saved.getUuid(), image.getId());
        return toPinDto(saved, imageUuid, request.getEncounterUuid());
    }

    @Override
    public List<AnnotableImagePinDto> getPins(String imageUuid, String encounterUuid) {
        Long tenantId = TenantContext.getTenantId();

        AnnotableImage image = annotableImageRepository.findByUuidAndArchiveFalse(imageUuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Annotable image not found: " + imageUuid));

        List<AnnotableImagePin> pins;
        if (encounterUuid != null && !encounterUuid.isBlank()) {
            Long encounterId = encounterRepository.findByTenantIdAndUuid(tenantId, encounterUuid)
                    .map(e -> e.getId())
                    .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                            "Encounter not found: " + encounterUuid));
            pins = annotableImagePinRepository.findByImageIdAndEncounterIdAndArchiveFalse(
                    image.getId(), encounterId);
        } else {
            pins = annotableImagePinRepository.findByImageIdAndArchiveFalse(image.getId());
        }

        return pins.stream()
                .map(p -> toPinDto(p, imageUuid, encounterUuid))
                .toList();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Macro.MacroCategory parseMacroCategory(String value) {
        try {
            return Macro.MacroCategory.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown macro category '{}' — ignoring filter", value);
            return null;
        }
    }

    private SoapNoteTemplate.TemplateCategory parseSoapCategory(String value) {
        try {
            return SoapNoteTemplate.TemplateCategory.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown SOAP template category '{}'", value);
            return null;
        }
    }

    private MacroDto toMacroDto(Macro m) {
        return MacroDto.builder()
                .uuid(m.getUuid())
                .name(m.getName())
                .abbreviation(m.getAbbreviation())
                .expansion(m.getExpansion())
                .category(m.getCategory() != null ? m.getCategory().name() : null)
                .isShared(m.isShared())
                .createdByProvider(m.getCreatedByProvider())
                .createdAt(m.getCreatedAt())
                .modifiedAt(m.getModifiedAt())
                .build();
    }

    private SoapNoteTemplateDto toSoapTemplateDto(SoapNoteTemplate t) {
        return SoapNoteTemplateDto.builder()
                .uuid(t.getUuid())
                .name(t.getName())
                .category(t.getCategory() != null ? t.getCategory().name() : null)
                .subjectiveTemplate(t.getSubjectiveTemplate())
                .objectiveTemplate(t.getObjectiveTemplate())
                .assessmentTemplate(t.getAssessmentTemplate())
                .planTemplate(t.getPlanTemplate())
                .isDefault(t.isDefault())
                .createdAt(t.getCreatedAt())
                .modifiedAt(t.getModifiedAt())
                .build();
    }

    private RosTemplateDto toRosTemplateDto(RosTemplate t) {
        return RosTemplateDto.builder()
                .uuid(t.getUuid())
                .name(t.getName())
                .systems(t.getSystems())
                .isDefault(t.isDefault())
                .createdAt(t.getCreatedAt())
                .modifiedAt(t.getModifiedAt())
                .build();
    }

    private PhysicalExamTemplateDto toPeTemplateDto(PhysicalExamTemplate t) {
        return PhysicalExamTemplateDto.builder()
                .uuid(t.getUuid())
                .name(t.getName())
                .sections(t.getSections())
                .isDefault(t.isDefault())
                .createdAt(t.getCreatedAt())
                .modifiedAt(t.getModifiedAt())
                .build();
    }

    private AnnotableImageDto toAnnotableImageDto(AnnotableImage i) {
        return AnnotableImageDto.builder()
                .uuid(i.getUuid())
                .name(i.getName())
                .category(i.getCategory())
                .imageUrl(i.getImageUrl())
                .description(i.getDescription())
                .isSystem(i.isSystem())
                .createdAt(i.getCreatedAt())
                .modifiedAt(i.getModifiedAt())
                .build();
    }

    private AnnotableImagePinDto toPinDto(AnnotableImagePin p, String imageUuid, String encounterUuid) {
        return AnnotableImagePinDto.builder()
                .uuid(p.getUuid())
                .imageUuid(imageUuid)
                .encounterUuid(encounterUuid)
                .xPosition(p.getXPosition())
                .yPosition(p.getYPosition())
                .label(p.getLabel())
                .notes(p.getNotes())
                .color(p.getColor())
                .createdAt(p.getCreatedAt())
                .modifiedAt(p.getModifiedAt())
                .build();
    }
}
