package com.thinkitive.primus.employer.service;

import com.thinkitive.primus.employer.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployerService {

    Page<EmployerDto> getEmployers(Pageable pageable);

    EmployerDto getEmployer(String uuid);

    EmployerDto createEmployer(CreateEmployerRequest request);

    EmployerDto updateEmployer(String uuid, UpdateEmployerRequest request);

    void deleteEmployer(String uuid);

    List<EmployerEmployeeDto> getEmployees(String employerUuid);

    EmployerEmployeeDto addEmployee(String employerUuid, AddEmployeeRequest request);

    void removeEmployee(String employerUuid, String employeeUuid);

    List<EmployerPlanDto> getPlans(String employerUuid);

    EmployerPlanDto addPlan(String employerUuid, AddEmployerPlanRequest request);
}
