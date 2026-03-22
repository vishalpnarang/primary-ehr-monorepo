package com.thinkitive.primus.careplan.controller;

import com.thinkitive.primus.careplan.dto.*;
import com.thinkitive.primus.careplan.service.CarePlanService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.thinkitive.primus.shared.security.Roles;

@RestController
@RequestMapping("/api/v1/care-plans")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_CLINICAL_ROLE)
public class CarePlanController extends BaseController {

    private final CarePlanService carePlanService;

    // ── Care Plans ────────────────────────────────────────────────────────────

    /** GET /api/v1/care-plans/patient/{patientUuid} */
    @GetMapping("/patient/{patientUuid}")
    public ResponseEntity<ApiResponse> getCarePlansByPatient(@PathVariable String patientUuid) {
        return ok(carePlanService.getCarePlansByPatient(patientUuid));
    }

    /** GET /api/v1/care-plans/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getCarePlan(@PathVariable String uuid) {
        return ok(carePlanService.getCarePlan(uuid));
    }

    /** POST /api/v1/care-plans */
    @PostMapping
    public ResponseEntity<ApiResponse> createCarePlan(
            @Valid @RequestBody CreateCarePlanRequest request) {
        return created(carePlanService.createCarePlan(request), "Care plan created");
    }

    /** PUT /api/v1/care-plans/{uuid} */
    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse> updateCarePlan(
            @PathVariable String uuid,
            @Valid @RequestBody UpdateCarePlanRequest request) {
        return ok(carePlanService.updateCarePlan(uuid, request), "Care plan updated");
    }

    /** DELETE /api/v1/care-plans/{uuid} */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse> deleteCarePlan(@PathVariable String uuid) {
        carePlanService.deleteCarePlan(uuid);
        return noContent();
    }

    // ── Goals ─────────────────────────────────────────────────────────────────

    /** GET /api/v1/care-plans/{uuid}/goals */
    @GetMapping("/{uuid}/goals")
    public ResponseEntity<ApiResponse> getGoals(@PathVariable String uuid) {
        return ok(carePlanService.getGoals(uuid));
    }

    /** POST /api/v1/care-plans/{uuid}/goals */
    @PostMapping("/{uuid}/goals")
    public ResponseEntity<ApiResponse> addGoal(
            @PathVariable String uuid,
            @Valid @RequestBody AddGoalRequest request) {
        return created(carePlanService.addGoal(uuid, request), "Goal added");
    }

    /** PUT /api/v1/care-plans/goals/{goalUuid} */
    @PutMapping("/goals/{goalUuid}")
    public ResponseEntity<ApiResponse> updateGoal(
            @PathVariable String goalUuid,
            @Valid @RequestBody UpdateGoalRequest request) {
        return ok(carePlanService.updateGoal(goalUuid, request), "Goal updated");
    }

    /** DELETE /api/v1/care-plans/goals/{goalUuid} */
    @DeleteMapping("/goals/{goalUuid}")
    public ResponseEntity<ApiResponse> deleteGoal(@PathVariable String goalUuid) {
        carePlanService.deleteGoal(goalUuid);
        return noContent();
    }

    // ── Activities ────────────────────────────────────────────────────────────

    /** GET /api/v1/care-plans/goals/{goalUuid}/activities */
    @GetMapping("/goals/{goalUuid}/activities")
    public ResponseEntity<ApiResponse> getActivities(@PathVariable String goalUuid) {
        return ok(carePlanService.getActivities(goalUuid));
    }

    /** POST /api/v1/care-plans/goals/{goalUuid}/activities */
    @PostMapping("/goals/{goalUuid}/activities")
    public ResponseEntity<ApiResponse> addActivity(
            @PathVariable String goalUuid,
            @Valid @RequestBody AddActivityRequest request) {
        return created(carePlanService.addActivity(goalUuid, request), "Activity added");
    }

    /** PUT /api/v1/care-plans/activities/{activityUuid} */
    @PutMapping("/activities/{activityUuid}")
    public ResponseEntity<ApiResponse> updateActivity(
            @PathVariable String activityUuid,
            @Valid @RequestBody UpdateActivityRequest request) {
        return ok(carePlanService.updateActivity(activityUuid, request), "Activity updated");
    }

    /** DELETE /api/v1/care-plans/activities/{activityUuid} */
    @DeleteMapping("/activities/{activityUuid}")
    public ResponseEntity<ApiResponse> deleteActivity(@PathVariable String activityUuid) {
        carePlanService.deleteActivity(activityUuid);
        return noContent();
    }
}
