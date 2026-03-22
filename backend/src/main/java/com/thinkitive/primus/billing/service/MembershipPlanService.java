package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.*;

import java.util.List;

public interface MembershipPlanService {

    List<MembershipPlanDto> getPlans();

    MembershipPlanDto createPlan(CreateMembershipPlanRequest request);

    PlanEnrollmentDto enrollPatient(String planUuid, EnrollPatientRequest request);

    PlanEnrollmentDto cancelEnrollment(String enrollmentUuid);

    PlanEnrollmentDto getPatientEnrollment(Long patientId);
}
