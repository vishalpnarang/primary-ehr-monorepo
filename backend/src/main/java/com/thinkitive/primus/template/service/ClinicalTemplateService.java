package com.thinkitive.primus.template.service;

import com.thinkitive.primus.template.dto.*;

import java.util.List;

public interface ClinicalTemplateService {

    // ── Macros ────────────────────────────────────────────────────────────────
    List<MacroDto> getMacros(String category);

    MacroDto createMacro(CreateMacroRequest request);

    MacroExpandResponse expandMacro(String abbreviation);

    void deleteMacro(String uuid);

    // ── SOAP Note Templates ───────────────────────────────────────────────────
    List<SoapNoteTemplateDto> getSoapNoteTemplates(String category);

    SoapNoteTemplateDto createSoapNoteTemplate(CreateSoapNoteTemplateRequest request);

    SoapNoteTemplateDto getSoapNoteTemplate(String uuid);

    void deleteSoapNoteTemplate(String uuid);

    // ── ROS Templates ─────────────────────────────────────────────────────────
    List<RosTemplateDto> getRosTemplates();

    RosTemplateDto createRosTemplate(CreateRosTemplateRequest request);

    RosTemplateDto getRosTemplate(String uuid);

    void deleteRosTemplate(String uuid);

    // ── Physical Exam Templates ───────────────────────────────────────────────
    List<PhysicalExamTemplateDto> getPhysicalExamTemplates();

    PhysicalExamTemplateDto createPhysicalExamTemplate(CreatePhysicalExamTemplateRequest request);

    PhysicalExamTemplateDto getPhysicalExamTemplate(String uuid);

    void deletePhysicalExamTemplate(String uuid);

    // ── Annotable Images ──────────────────────────────────────────────────────
    List<AnnotableImageDto> getAnnotableImages();

    AnnotableImagePinDto addPin(String imageUuid, AddPinRequest request);

    List<AnnotableImagePinDto> getPins(String imageUuid, String encounterUuid);
}
