package com.thinkitive.primus.employer.service;

import com.thinkitive.primus.employer.dto.*;
import com.thinkitive.primus.employer.entity.Employer;
import com.thinkitive.primus.employer.entity.EmployerEmployee;
import com.thinkitive.primus.employer.repository.EmployerEmployeeRepository;
import com.thinkitive.primus.employer.repository.EmployerPlanRepository;
import com.thinkitive.primus.employer.repository.EmployerRepository;
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
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployerServiceTest {

    @Mock EmployerRepository         employerRepository;
    @Mock EmployerEmployeeRepository  employeeRepository;
    @Mock EmployerPlanRepository      planRepository;

    @InjectMocks
    EmployerServiceImpl employerService;

    private Employer testEmployer;
    private final String employerUuid = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testEmployer = Employer.builder()
                .tenantId(1L)
                .name("Acme Medical Group")
                .taxId("12-3456789")
                .contactName("Carol Thompson")
                .contactEmail("carol.thompson@acme.com")
                .contactPhone("555-867-5309")
                .address("500 Corporate Blvd, Chicago, IL 60601")
                .status("ACTIVE")
                .employeeCount(0)
                .build();
        testEmployer.setId(1L);
        testEmployer.setUuid(employerUuid);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("createEmployer persists employer and returns DTO with ACTIVE status")
    void createEmployer_persistsAndReturnsDto() {
        CreateEmployerRequest request = new CreateEmployerRequest();
        request.setName("Acme Medical Group");
        request.setTaxId("12-3456789");
        request.setContactName("Carol Thompson");
        request.setContactEmail("carol.thompson@acme.com");
        request.setContactPhone("555-867-5309");
        request.setAddress("500 Corporate Blvd, Chicago, IL 60601");

        when(employerRepository.existsByTenantIdAndTaxIdAndArchiveFalse(1L, "12-3456789"))
                .thenReturn(false);
        when(employerRepository.save(any(Employer.class))).thenAnswer(inv -> {
            Employer e = inv.getArgument(0);
            e.setId(1L);
            e.setUuid(employerUuid);
            return e;
        });

        EmployerDto result = employerService.createEmployer(request);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Acme Medical Group");
        assertThat(result.getTaxId()).isEqualTo("12-3456789");
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
        assertThat(result.getEmployeeCount()).isEqualTo(0);
        verify(employerRepository).save(any(Employer.class));
    }

    @Test
    @DisplayName("createEmployer throws CONFLICT when tax ID already exists")
    void createEmployer_duplicateTaxId_throws() {
        CreateEmployerRequest request = new CreateEmployerRequest();
        request.setName("Duplicate Corp");
        request.setTaxId("12-3456789");

        when(employerRepository.existsByTenantIdAndTaxIdAndArchiveFalse(1L, "12-3456789"))
                .thenReturn(true);

        assertThatThrownBy(() -> employerService.createEmployer(request))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("tax ID already exists");

        verify(employerRepository, never()).save(any());
    }

    @Test
    @DisplayName("addEmployee creates employee record and increments employer employee count")
    void addEmployee_success_incrementsCount() {
        AddEmployeeRequest request = new AddEmployeeRequest();
        request.setPatientId(200L);
        request.setEmployeeId("EMP-10042");
        request.setDepartment("Engineering");
        request.setStartDate(LocalDate.now());

        EmployerEmployee savedEmployee = EmployerEmployee.builder()
                .tenantId(1L)
                .employerId(1L)
                .patientId(200L)
                .employeeId("EMP-10042")
                .department("Engineering")
                .startDate(LocalDate.now())
                .status("ACTIVE")
                .build();
        savedEmployee.setId(1L);
        savedEmployee.setUuid(UUID.randomUUID().toString());

        when(employerRepository.findByTenantIdAndUuid(1L, employerUuid))
                .thenReturn(Optional.of(testEmployer));
        when(employeeRepository.findByEmployerIdAndPatientIdAndArchiveFalse(1L, 200L))
                .thenReturn(Optional.empty());
        when(employeeRepository.save(any(EmployerEmployee.class))).thenReturn(savedEmployee);
        when(employerRepository.save(any(Employer.class))).thenReturn(testEmployer);

        EmployerEmployeeDto result = employerService.addEmployee(employerUuid, request);

        assertThat(result).isNotNull();
        assertThat(result.getPatientId()).isEqualTo(200L);
        assertThat(result.getEmployeeId()).isEqualTo("EMP-10042");
        assertThat(result.getDepartment()).isEqualTo("Engineering");
        // Employee count should have been incremented
        verify(employerRepository).save(argThat(e -> e.getEmployeeCount() == 1));
    }

    @Test
    @DisplayName("addEmployee throws CONFLICT when patient is already linked to employer")
    void addEmployee_duplicate_throws() {
        AddEmployeeRequest request = new AddEmployeeRequest();
        request.setPatientId(200L);
        request.setEmployeeId("EMP-10042");

        EmployerEmployee existingEmployee = EmployerEmployee.builder()
                .tenantId(1L).employerId(1L).patientId(200L).status("ACTIVE").build();
        existingEmployee.setId(1L);
        existingEmployee.setUuid(UUID.randomUUID().toString());

        when(employerRepository.findByTenantIdAndUuid(1L, employerUuid))
                .thenReturn(Optional.of(testEmployer));
        when(employeeRepository.findByEmployerIdAndPatientIdAndArchiveFalse(1L, 200L))
                .thenReturn(Optional.of(existingEmployee));

        assertThatThrownBy(() -> employerService.addEmployee(employerUuid, request))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("already linked");

        verify(employeeRepository, never()).save(any());
    }
}
