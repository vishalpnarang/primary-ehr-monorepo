package com.thinkitive.primus.careplan.service;

import com.thinkitive.primus.careplan.dto.*;

import java.util.List;

public interface CarePlanService {

    // ── Care Plans ────────────────────────────────────────────────────────────
    List<CarePlanDto> getCarePlansByPatient(String patientUuid);

    CarePlanDto getCarePlan(String uuid);

    CarePlanDto createCarePlan(CreateCarePlanRequest request);

    CarePlanDto updateCarePlan(String uuid, UpdateCarePlanRequest request);

    void deleteCarePlan(String uuid);

    // ── Goals ─────────────────────────────────────────────────────────────────
    List<CarePlanGoalDto> getGoals(String carePlanUuid);

    CarePlanGoalDto addGoal(String carePlanUuid, AddGoalRequest request);

    CarePlanGoalDto updateGoal(String goalUuid, UpdateGoalRequest request);

    void deleteGoal(String goalUuid);

    // ── Activities ────────────────────────────────────────────────────────────
    List<CarePlanActivityDto> getActivities(String goalUuid);

    CarePlanActivityDto addActivity(String goalUuid, AddActivityRequest request);

    CarePlanActivityDto updateActivity(String activityUuid, UpdateActivityRequest request);

    void deleteActivity(String activityUuid);
}
