package com.thinkitive.primus.careplan.service;

import com.thinkitive.primus.careplan.dto.*;
import com.thinkitive.primus.careplan.entity.CarePlan;
import com.thinkitive.primus.careplan.entity.CarePlanGoal;
import com.thinkitive.primus.careplan.repository.CarePlanActivityRepository;
import com.thinkitive.primus.careplan.repository.CarePlanGoalRepository;
import com.thinkitive.primus.careplan.repository.CarePlanRepository;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class CarePlanServiceTest {

    @Mock CarePlanRepository carePlanRepository;
    @Mock CarePlanGoalRepository carePlanGoalRepository;
    @Mock CarePlanActivityRepository carePlanActivityRepository;
    @Mock PatientRepository patientRepository;

    @InjectMocks
    CarePlanServiceImpl carePlanService;

    private Patient testPatient;
    private CarePlan testCarePlan;
    private CarePlanGoal testGoal;
    private final String patientUuid  = UUID.randomUUID().toString();
    private final String carePlanUuid = UUID.randomUUID().toString();
    private final String goalUuid     = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testPatient = Patient.builder()
                .tenantId(1L)
                .mrn("PAT-30001")
                .firstName("Maria")
                .lastName("Garcia")
                .dob(LocalDate.of(1968, 8, 22))
                .sex("FEMALE")
                .status(Patient.PatientStatus.ACTIVE)
                .build();
        testPatient.setId(200L);
        testPatient.setUuid(patientUuid);

        testCarePlan = CarePlan.builder()
                .tenantId(1L)
                .patientId(200L)
                .title("Diabetes Management Plan")
                .description("Comprehensive plan for T2DM management")
                .status(CarePlan.CarePlanStatus.ACTIVE)
                .startDate(LocalDate.now())
                .build();
        testCarePlan.setId(10L);
        testCarePlan.setUuid(carePlanUuid);

        testGoal = CarePlanGoal.builder()
                .tenantId(1L)
                .carePlanId(10L)
                .description("Reduce HbA1c below 7%")
                .targetValue("7.0")
                .currentValue("8.5")
                .targetDate(LocalDate.now().plusMonths(3))
                .status(CarePlanGoal.GoalStatus.IN_PROGRESS)
                .build();
        testGoal.setId(20L);
        testGoal.setUuid(goalUuid);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("createCarePlan saves plan and returns DTO with patient UUID")
    void createCarePlan_persistsAndReturnsDto() {
        CreateCarePlanRequest request = new CreateCarePlanRequest();
        request.setPatientUuid(patientUuid);
        request.setTitle("Diabetes Management Plan");
        request.setDescription("Comprehensive plan for T2DM management");
        request.setStatus("ACTIVE");
        request.setStartDate(LocalDate.now());

        when(patientRepository.findByTenantIdAndUuid(1L, patientUuid)).thenReturn(Optional.of(testPatient));
        when(carePlanRepository.save(any(CarePlan.class))).thenAnswer(inv -> {
            CarePlan cp = inv.getArgument(0);
            cp.setId(10L);
            cp.setUuid(carePlanUuid);
            return cp;
        });
        when(carePlanGoalRepository.findByCarePlanIdAndArchiveFalse(10L)).thenReturn(List.of());

        CarePlanDto result = carePlanService.createCarePlan(request);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Diabetes Management Plan");
        assertThat(result.getPatientUuid()).isEqualTo(patientUuid);
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
        verify(carePlanRepository).save(any(CarePlan.class));
    }

    @Test
    @DisplayName("addGoal creates a goal linked to the care plan")
    void addGoal_success() {
        AddGoalRequest request = new AddGoalRequest();
        request.setDescription("Reduce HbA1c below 7%");
        request.setTargetValue("7.0");
        request.setCurrentValue("8.5");
        request.setTargetDate(LocalDate.now().plusMonths(3));
        request.setStatus("IN_PROGRESS");

        when(carePlanRepository.findByTenantIdAndUuid(1L, carePlanUuid))
                .thenReturn(Optional.of(testCarePlan));
        when(carePlanGoalRepository.save(any(CarePlanGoal.class))).thenAnswer(inv -> {
            CarePlanGoal g = inv.getArgument(0);
            g.setId(20L);
            g.setUuid(goalUuid);
            return g;
        });
        when(carePlanActivityRepository.findByGoalIdAndArchiveFalse(20L)).thenReturn(List.of());

        CarePlanGoalDto result = carePlanService.addGoal(carePlanUuid, request);

        assertThat(result).isNotNull();
        assertThat(result.getDescription()).isEqualTo("Reduce HbA1c below 7%");
        assertThat(result.getStatus()).isEqualTo("IN_PROGRESS");
        verify(carePlanGoalRepository).save(any(CarePlanGoal.class));
    }

    @Test
    @DisplayName("updateGoalStatus updates status on existing goal")
    void updateGoalStatus_updatesGoal() {
        UpdateGoalRequest request = new UpdateGoalRequest();
        request.setStatus("MET");
        request.setCurrentValue("6.8");

        CarePlanGoal updatedGoal = CarePlanGoal.builder()
                .tenantId(1L)
                .carePlanId(10L)
                .description("Reduce HbA1c below 7%")
                .targetValue("7.0")
                .currentValue("6.8")
                .status(CarePlanGoal.GoalStatus.MET)
                .build();
        updatedGoal.setId(20L);
        updatedGoal.setUuid(goalUuid);

        when(carePlanGoalRepository.findByTenantIdAndUuid(1L, goalUuid))
                .thenReturn(Optional.of(testGoal));
        when(carePlanGoalRepository.save(any(CarePlanGoal.class))).thenReturn(updatedGoal);
        when(carePlanRepository.findById(10L)).thenReturn(Optional.of(testCarePlan));
        when(carePlanActivityRepository.findByGoalIdAndArchiveFalse(20L)).thenReturn(List.of());

        CarePlanGoalDto result = carePlanService.updateGoal(goalUuid, request);

        assertThat(result.getStatus()).isEqualTo("MET");
        assertThat(result.getCurrentValue()).isEqualTo("6.8");
    }

    @Test
    @DisplayName("createCarePlan throws NOT_FOUND when patient does not exist")
    void createCarePlan_patientNotFound_throws() {
        CreateCarePlanRequest request = new CreateCarePlanRequest();
        request.setPatientUuid(patientUuid);
        request.setTitle("Test Plan");

        when(patientRepository.findByTenantIdAndUuid(1L, patientUuid)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> carePlanService.createCarePlan(request))
                .isInstanceOf(PrimusException.class);
    }
}
