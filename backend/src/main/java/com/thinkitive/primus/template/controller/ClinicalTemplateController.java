package com.thinkitive.primus.template.controller;

import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.template.dto.*;
import com.thinkitive.primus.template.service.ClinicalTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.thinkitive.primus.shared.security.Roles;

@RestController
@RequestMapping("/api/v1/clinical-templates")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_CLINICAL_ROLE)
public class ClinicalTemplateController extends BaseController {

    private final ClinicalTemplateService clinicalTemplateService;

    // ── Macros ────────────────────────────────────────────────────────────────

    /** GET /api/v1/clinical-templates/macros?category=SOAP */
    @GetMapping("/macros")
    public ResponseEntity<ApiResponse> getMacros(
            @RequestParam(required = false) String category) {
        return ok(clinicalTemplateService.getMacros(category));
    }

    /** POST /api/v1/clinical-templates/macros */
    @PostMapping("/macros")
    public ResponseEntity<ApiResponse> createMacro(
            @Valid @RequestBody CreateMacroRequest request) {
        return created(clinicalTemplateService.createMacro(request), "Macro created");
    }

    /** GET /api/v1/clinical-templates/macros/expand/{abbreviation} */
    @GetMapping("/macros/expand/{abbreviation}")
    public ResponseEntity<ApiResponse> expandMacro(@PathVariable String abbreviation) {
        return ok(clinicalTemplateService.expandMacro(abbreviation));
    }

    /** DELETE /api/v1/clinical-templates/macros/{uuid} */
    @DeleteMapping("/macros/{uuid}")
    public ResponseEntity<ApiResponse> deleteMacro(@PathVariable String uuid) {
        clinicalTemplateService.deleteMacro(uuid);
        return noContent();
    }

    // ── SOAP Note Templates ───────────────────────────────────────────────────

    /** GET /api/v1/clinical-templates/soap-templates?category=H_AND_P */
    @GetMapping("/soap-templates")
    public ResponseEntity<ApiResponse> getSoapNoteTemplates(
            @RequestParam(required = false) String category) {
        return ok(clinicalTemplateService.getSoapNoteTemplates(category));
    }

    /** POST /api/v1/clinical-templates/soap-templates */
    @PostMapping("/soap-templates")
    public ResponseEntity<ApiResponse> createSoapNoteTemplate(
            @Valid @RequestBody CreateSoapNoteTemplateRequest request) {
        return created(clinicalTemplateService.createSoapNoteTemplate(request), "SOAP note template created");
    }

    /** GET /api/v1/clinical-templates/soap-templates/{uuid} */
    @GetMapping("/soap-templates/{uuid}")
    public ResponseEntity<ApiResponse> getSoapNoteTemplate(@PathVariable String uuid) {
        return ok(clinicalTemplateService.getSoapNoteTemplate(uuid));
    }

    /** DELETE /api/v1/clinical-templates/soap-templates/{uuid} */
    @DeleteMapping("/soap-templates/{uuid}")
    public ResponseEntity<ApiResponse> deleteSoapNoteTemplate(@PathVariable String uuid) {
        clinicalTemplateService.deleteSoapNoteTemplate(uuid);
        return noContent();
    }

    // ── ROS Templates ─────────────────────────────────────────────────────────

    /** GET /api/v1/clinical-templates/ros-templates */
    @GetMapping("/ros-templates")
    public ResponseEntity<ApiResponse> getRosTemplates() {
        return ok(clinicalTemplateService.getRosTemplates());
    }

    /** POST /api/v1/clinical-templates/ros-templates */
    @PostMapping("/ros-templates")
    public ResponseEntity<ApiResponse> createRosTemplate(
            @Valid @RequestBody CreateRosTemplateRequest request) {
        return created(clinicalTemplateService.createRosTemplate(request), "ROS template created");
    }

    /** GET /api/v1/clinical-templates/ros-templates/{uuid} */
    @GetMapping("/ros-templates/{uuid}")
    public ResponseEntity<ApiResponse> getRosTemplate(@PathVariable String uuid) {
        return ok(clinicalTemplateService.getRosTemplate(uuid));
    }

    /** DELETE /api/v1/clinical-templates/ros-templates/{uuid} */
    @DeleteMapping("/ros-templates/{uuid}")
    public ResponseEntity<ApiResponse> deleteRosTemplate(@PathVariable String uuid) {
        clinicalTemplateService.deleteRosTemplate(uuid);
        return noContent();
    }

    // ── Physical Exam Templates ───────────────────────────────────────────────

    /** GET /api/v1/clinical-templates/pe-templates */
    @GetMapping("/pe-templates")
    public ResponseEntity<ApiResponse> getPhysicalExamTemplates() {
        return ok(clinicalTemplateService.getPhysicalExamTemplates());
    }

    /** POST /api/v1/clinical-templates/pe-templates */
    @PostMapping("/pe-templates")
    public ResponseEntity<ApiResponse> createPhysicalExamTemplate(
            @Valid @RequestBody CreatePhysicalExamTemplateRequest request) {
        return created(clinicalTemplateService.createPhysicalExamTemplate(request), "PE template created");
    }

    /** GET /api/v1/clinical-templates/pe-templates/{uuid} */
    @GetMapping("/pe-templates/{uuid}")
    public ResponseEntity<ApiResponse> getPhysicalExamTemplate(@PathVariable String uuid) {
        return ok(clinicalTemplateService.getPhysicalExamTemplate(uuid));
    }

    /** DELETE /api/v1/clinical-templates/pe-templates/{uuid} */
    @DeleteMapping("/pe-templates/{uuid}")
    public ResponseEntity<ApiResponse> deletePhysicalExamTemplate(@PathVariable String uuid) {
        clinicalTemplateService.deletePhysicalExamTemplate(uuid);
        return noContent();
    }

    // ── Annotable Images ──────────────────────────────────────────────────────

    /** GET /api/v1/clinical-templates/annotable-images */
    @GetMapping("/annotable-images")
    public ResponseEntity<ApiResponse> getAnnotableImages() {
        return ok(clinicalTemplateService.getAnnotableImages());
    }

    /** POST /api/v1/clinical-templates/annotable-images/{imageUuid}/pins */
    @PostMapping("/annotable-images/{imageUuid}/pins")
    public ResponseEntity<ApiResponse> addPin(
            @PathVariable String imageUuid,
            @Valid @RequestBody AddPinRequest request) {
        return created(clinicalTemplateService.addPin(imageUuid, request), "Pin added");
    }

    /** GET /api/v1/clinical-templates/annotable-images/{imageUuid}/pins?encounterId=... */
    @GetMapping("/annotable-images/{imageUuid}/pins")
    public ResponseEntity<ApiResponse> getPins(
            @PathVariable String imageUuid,
            @RequestParam(required = false) String encounterId) {
        return ok(clinicalTemplateService.getPins(imageUuid, encounterId));
    }
}
