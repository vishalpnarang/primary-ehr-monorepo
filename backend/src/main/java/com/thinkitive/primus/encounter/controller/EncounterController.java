package com.thinkitive.primus.encounter.controller;

import com.thinkitive.primus.encounter.dto.*;
import com.thinkitive.primus.encounter.service.EncounterService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/encounters")
@RequiredArgsConstructor
public class EncounterController extends BaseController {

    private final EncounterService encounterService;

    /** POST /api/v1/encounters — start encounter (status = DRAFT) */
    @PostMapping
    public ResponseEntity<ApiResponse> createEncounter(@Valid @RequestBody CreateEncounterRequest request) {
        return created(encounterService.createEncounter(request), "Encounter started");
    }

    /** GET /api/v1/encounters/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getEncounter(@PathVariable String uuid) {
        return ok(encounterService.getEncounter(uuid));
    }

    /** PUT /api/v1/encounters/{uuid} — update SOAP note (only DRAFT or IN_PROGRESS) */
    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse> updateEncounter(
            @PathVariable String uuid,
            @Valid @RequestBody UpdateEncounterRequest request) {
        return ok(encounterService.updateEncounter(uuid, request), "Encounter updated");
    }

    /** POST /api/v1/encounters/{uuid}/sign — sign and lock encounter */
    @PostMapping("/{uuid}/sign")
    public ResponseEntity<ApiResponse> signEncounter(@PathVariable String uuid) {
        return ok(encounterService.signEncounter(uuid), "Encounter signed and locked");
    }

    /** POST /api/v1/encounters/{uuid}/addendum — add addendum to signed encounter */
    @PostMapping("/{uuid}/addendum")
    public ResponseEntity<ApiResponse> addAddendum(
            @PathVariable String uuid,
            @Valid @RequestBody AddendumRequest request) {
        return ok(encounterService.addAddendum(uuid, request), "Addendum added");
    }

    /** GET /api/v1/encounters/patient/{patientUuid} — all encounters for a patient */
    @GetMapping("/patient/{patientUuid}")
    public ResponseEntity<ApiResponse> getEncountersByPatient(@PathVariable String patientUuid) {
        return ok(encounterService.getEncountersByPatient(patientUuid));
    }
}
