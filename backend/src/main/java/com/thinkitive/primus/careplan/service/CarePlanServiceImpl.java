package com.thinkitive.primus.careplan.service;

import com.thinkitive.primus.careplan.dto.*;
import com.thinkitive.primus.careplan.entity.*;
import com.thinkitive.primus.careplan.repository.*;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
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
public class CarePlanServiceImpl implements CarePlanService {

    private final CarePlanRepository carePlanRepository;
    private final CarePlanGoalRepository carePlanGoalRepository;
    private final CarePlanActivityRepository carePlanActivityRepository;
    private final PatientRepository patientRepository;

    // ── Care Plans ────────────────────────────────────────────────────────────

    @Override
    public List<CarePlanDto> getCarePlansByPatient(String patientUuid) {
        Long tenantId = TenantContext.getTenantId();
        Patient patient = requirePatient(tenantId, patientUuid);
        return carePlanRepository
                .findByPatientIdAndTenantIdAndArchiveFalse(patient.getId(), tenantId)
                .stream()
                .map(p -> toCarePlanDto(p, patientUuid))
                .toList();
    }

    @Override
    public CarePlanDto getCarePlan(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        CarePlan plan = requireCarePlan(tenantId, uuid);
        Patient patient = patientRepository.findById(plan.getPatientId())
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient not found for care plan: " + uuid));
        return toCarePlanDto(plan, patient.getUuid());
    }

    @Override
    @Transactional
    public CarePlanDto createCarePlan(CreateCarePlanRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Patient patient = requirePatient(tenantId, request.getPatientUuid());
        log.info("Creating care plan tenant={} patient={}", tenantId, request.getPatientUuid());

        CarePlan plan = CarePlan.builder()
                .tenantId(tenantId)
                .patientId(patient.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(parseCarePlanStatus(request.getStatus()))
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdByProvider(request.getCreatedByProvider())
                .build();

        CarePlan saved = carePlanRepository.save(plan);
        log.info("Care plan created uuid={}", saved.getUuid());
        return toCarePlanDto(saved, request.getPatientUuid());
    }

    @Override
    @Transactional
    public CarePlanDto updateCarePlan(String uuid, UpdateCarePlanRequest request) {
        Long tenantId = TenantContext.getTenantId();
        CarePlan plan = requireCarePlan(tenantId, uuid);

        if (request.getTitle()       != null) plan.setTitle(request.getTitle());
        if (request.getDescription() != null) plan.setDescription(request.getDescription());
        if (request.getStatus()      != null) plan.setStatus(parseCarePlanStatus(request.getStatus()));
        if (request.getEndDate()     != null) plan.setEndDate(request.getEndDate());

        CarePlan saved = carePlanRepository.save(plan);
        Patient patient = patientRepository.findById(saved.getPatientId())
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient not found"));
        log.info("Care plan updated uuid={}", uuid);
        return toCarePlanDto(saved, patient.getUuid());
    }

    @Override
    @Transactional
    public void deleteCarePlan(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        CarePlan plan = requireCarePlan(tenantId, uuid);
        plan.setArchive(true);
        carePlanRepository.save(plan);
        log.info("Care plan archived uuid={}", uuid);
    }

    // ── Goals ─────────────────────────────────────────────────────────────────

    @Override
    public List<CarePlanGoalDto> getGoals(String carePlanUuid) {
        Long tenantId = TenantContext.getTenantId();
        CarePlan plan = requireCarePlan(tenantId, carePlanUuid);
        return carePlanGoalRepository
                .findByCarePlanIdAndTenantIdAndArchiveFalse(plan.getId(), tenantId)
                .stream()
                .map(g -> toGoalDto(g, carePlanUuid, true))
                .toList();
    }

    @Override
    @Transactional
    public CarePlanGoalDto addGoal(String carePlanUuid, AddGoalRequest request) {
        Long tenantId = TenantContext.getTenantId();
        CarePlan plan = requireCarePlan(tenantId, carePlanUuid);

        CarePlanGoal goal = CarePlanGoal.builder()
                .tenantId(tenantId)
                .carePlanId(plan.getId())
                .description(request.getDescription())
                .targetValue(request.getTargetValue())
                .currentValue(request.getCurrentValue())
                .targetDate(request.getTargetDate())
                .status(parseGoalStatus(request.getStatus()))
                .build();

        CarePlanGoal saved = carePlanGoalRepository.save(goal);
        log.info("Goal added care_plan={} uuid={}", carePlanUuid, saved.getUuid());
        return toGoalDto(saved, carePlanUuid, false);
    }

    @Override
    @Transactional
    public CarePlanGoalDto updateGoal(String goalUuid, UpdateGoalRequest request) {
        Long tenantId = TenantContext.getTenantId();
        CarePlanGoal goal = requireGoal(tenantId, goalUuid);

        if (request.getDescription()  != null) goal.setDescription(request.getDescription());
        if (request.getTargetValue()  != null) goal.setTargetValue(request.getTargetValue());
        if (request.getCurrentValue() != null) goal.setCurrentValue(request.getCurrentValue());
        if (request.getTargetDate()   != null) goal.setTargetDate(request.getTargetDate());
        if (request.getStatus()       != null) goal.setStatus(parseGoalStatus(request.getStatus()));

        CarePlanGoal saved = carePlanGoalRepository.save(goal);
        CarePlan plan = carePlanRepository.findById(saved.getCarePlanId())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Care plan not found"));
        log.info("Goal updated uuid={}", goalUuid);
        return toGoalDto(saved, plan.getUuid(), false);
    }

    @Override
    @Transactional
    public void deleteGoal(String goalUuid) {
        Long tenantId = TenantContext.getTenantId();
        CarePlanGoal goal = requireGoal(tenantId, goalUuid);
        goal.setArchive(true);
        carePlanGoalRepository.save(goal);
        log.info("Goal archived uuid={}", goalUuid);
    }

    // ── Activities ────────────────────────────────────────────────────────────

    @Override
    public List<CarePlanActivityDto> getActivities(String goalUuid) {
        Long tenantId = TenantContext.getTenantId();
        CarePlanGoal goal = requireGoal(tenantId, goalUuid);
        return carePlanActivityRepository
                .findByGoalIdAndTenantIdAndArchiveFalse(goal.getId(), tenantId)
                .stream()
                .map(a -> toActivityDto(a, goalUuid))
                .toList();
    }

    @Override
    @Transactional
    public CarePlanActivityDto addActivity(String goalUuid, AddActivityRequest request) {
        Long tenantId = TenantContext.getTenantId();
        CarePlanGoal goal = requireGoal(tenantId, goalUuid);

        CarePlanActivity activity = CarePlanActivity.builder()
                .tenantId(tenantId)
                .goalId(goal.getId())
                .description(request.getDescription())
                .frequency(request.getFrequency())
                .assignedTo(request.getAssignedTo())
                .status(parseActivityStatus(request.getStatus()))
                .dueDate(request.getDueDate())
                .build();

        CarePlanActivity saved = carePlanActivityRepository.save(activity);
        log.info("Activity added goal={} uuid={}", goalUuid, saved.getUuid());
        return toActivityDto(saved, goalUuid);
    }

    @Override
    @Transactional
    public CarePlanActivityDto updateActivity(String activityUuid, UpdateActivityRequest request) {
        Long tenantId = TenantContext.getTenantId();
        CarePlanActivity activity = requireActivity(tenantId, activityUuid);

        if (request.getDescription()   != null) activity.setDescription(request.getDescription());
        if (request.getFrequency()     != null) activity.setFrequency(request.getFrequency());
        if (request.getAssignedTo()    != null) activity.setAssignedTo(request.getAssignedTo());
        if (request.getStatus()        != null) activity.setStatus(parseActivityStatus(request.getStatus()));
        if (request.getDueDate()       != null) activity.setDueDate(request.getDueDate());
        if (request.getCompletedDate() != null) activity.setCompletedDate(request.getCompletedDate());

        CarePlanActivity saved = carePlanActivityRepository.save(activity);
        CarePlanGoal goal = carePlanGoalRepository.findById(saved.getGoalId())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Goal not found"));
        log.info("Activity updated uuid={}", activityUuid);
        return toActivityDto(saved, goal.getUuid());
    }

    @Override
    @Transactional
    public void deleteActivity(String activityUuid) {
        Long tenantId = TenantContext.getTenantId();
        CarePlanActivity activity = requireActivity(tenantId, activityUuid);
        activity.setArchive(true);
        carePlanActivityRepository.save(activity);
        log.info("Activity archived uuid={}", activityUuid);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Patient requirePatient(Long tenantId, String uuid) {
        return patientRepository.findByTenantIdAndUuid(tenantId, uuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient not found: " + uuid));
    }

    private CarePlan requireCarePlan(Long tenantId, String uuid) {
        return carePlanRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(p -> !p.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Care plan not found: " + uuid));
    }

    private CarePlanGoal requireGoal(Long tenantId, String uuid) {
        return carePlanGoalRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(g -> !g.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Care plan goal not found: " + uuid));
    }

    private CarePlanActivity requireActivity(Long tenantId, String uuid) {
        return carePlanActivityRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(a -> !a.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Care plan activity not found: " + uuid));
    }

    private CarePlan.CarePlanStatus parseCarePlanStatus(String value) {
        if (value == null) return CarePlan.CarePlanStatus.ACTIVE;
        try {
            return CarePlan.CarePlanStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown care plan status '{}', defaulting to ACTIVE", value);
            return CarePlan.CarePlanStatus.ACTIVE;
        }
    }

    private CarePlanGoal.GoalStatus parseGoalStatus(String value) {
        if (value == null) return CarePlanGoal.GoalStatus.IN_PROGRESS;
        try {
            return CarePlanGoal.GoalStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown goal status '{}', defaulting to IN_PROGRESS", value);
            return CarePlanGoal.GoalStatus.IN_PROGRESS;
        }
    }

    private CarePlanActivity.ActivityStatus parseActivityStatus(String value) {
        if (value == null) return CarePlanActivity.ActivityStatus.PENDING;
        try {
            return CarePlanActivity.ActivityStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown activity status '{}', defaulting to PENDING", value);
            return CarePlanActivity.ActivityStatus.PENDING;
        }
    }

    private CarePlanDto toCarePlanDto(CarePlan p, String patientUuid) {
        List<CarePlanGoalDto> goals = carePlanGoalRepository
                .findByCarePlanIdAndArchiveFalse(p.getId())
                .stream()
                .map(g -> toGoalDto(g, p.getUuid(), true))
                .toList();

        return CarePlanDto.builder()
                .uuid(p.getUuid())
                .patientUuid(patientUuid)
                .title(p.getTitle())
                .description(p.getDescription())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .createdByProvider(p.getCreatedByProvider())
                .goals(goals)
                .createdAt(p.getCreatedAt())
                .modifiedAt(p.getModifiedAt())
                .build();
    }

    private CarePlanGoalDto toGoalDto(CarePlanGoal g, String carePlanUuid, boolean includeActivities) {
        List<CarePlanActivityDto> activities = includeActivities
                ? carePlanActivityRepository.findByGoalIdAndArchiveFalse(g.getId())
                        .stream()
                        .map(a -> toActivityDto(a, g.getUuid()))
                        .toList()
                : List.of();

        return CarePlanGoalDto.builder()
                .uuid(g.getUuid())
                .carePlanUuid(carePlanUuid)
                .description(g.getDescription())
                .targetValue(g.getTargetValue())
                .currentValue(g.getCurrentValue())
                .targetDate(g.getTargetDate())
                .status(g.getStatus() != null ? g.getStatus().name() : null)
                .activities(activities)
                .createdAt(g.getCreatedAt())
                .modifiedAt(g.getModifiedAt())
                .build();
    }

    private CarePlanActivityDto toActivityDto(CarePlanActivity a, String goalUuid) {
        return CarePlanActivityDto.builder()
                .uuid(a.getUuid())
                .goalUuid(goalUuid)
                .description(a.getDescription())
                .frequency(a.getFrequency())
                .assignedTo(a.getAssignedTo())
                .status(a.getStatus() != null ? a.getStatus().name() : null)
                .dueDate(a.getDueDate())
                .completedDate(a.getCompletedDate())
                .createdAt(a.getCreatedAt())
                .modifiedAt(a.getModifiedAt())
                .build();
    }
}
