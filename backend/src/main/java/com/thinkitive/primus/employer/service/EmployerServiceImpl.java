package com.thinkitive.primus.employer.service;

import com.thinkitive.primus.employer.dto.*;
import com.thinkitive.primus.employer.entity.Employer;
import com.thinkitive.primus.employer.entity.EmployerEmployee;
import com.thinkitive.primus.employer.entity.EmployerPlan;
import com.thinkitive.primus.employer.repository.EmployerEmployeeRepository;
import com.thinkitive.primus.employer.repository.EmployerPlanRepository;
import com.thinkitive.primus.employer.repository.EmployerRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployerServiceImpl implements EmployerService {

    private final EmployerRepository         employerRepository;
    private final EmployerEmployeeRepository  employeeRepository;
    private final EmployerPlanRepository      planRepository;

    // ── Employers ─────────────────────────────────────────────────────────────

    @Override
    public Page<EmployerDto> getEmployers(Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        return employerRepository.findByTenantIdAndArchiveFalse(tenantId, pageable)
                .map(this::toEmployerDto);
    }

    @Override
    public EmployerDto getEmployer(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        return toEmployerDto(requireEmployer(tenantId, uuid));
    }

    @Override
    @Transactional
    public EmployerDto createEmployer(CreateEmployerRequest request) {
        Long tenantId = TenantContext.getTenantId();

        if (request.getTaxId() != null
                && employerRepository.existsByTenantIdAndTaxIdAndArchiveFalse(tenantId, request.getTaxId())) {
            throw new PrimusException(ResponseCode.CONFLICT,
                    "Employer with tax ID already exists: " + request.getTaxId());
        }

        Employer employer = Employer.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .taxId(request.getTaxId())
                .contactName(request.getContactName())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .address(request.getAddress())
                .status("ACTIVE")
                .employeeCount(0)
                .build();

        Employer saved = employerRepository.save(employer);
        log.info("Employer created uuid={} tenantId={}", saved.getUuid(), tenantId);
        return toEmployerDto(saved);
    }

    @Override
    @Transactional
    public EmployerDto updateEmployer(String uuid, UpdateEmployerRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Employer employer = requireEmployer(tenantId, uuid);

        if (request.getName()         != null) employer.setName(request.getName());
        if (request.getContactName()  != null) employer.setContactName(request.getContactName());
        if (request.getContactEmail() != null) employer.setContactEmail(request.getContactEmail());
        if (request.getContactPhone() != null) employer.setContactPhone(request.getContactPhone());
        if (request.getAddress()      != null) employer.setAddress(request.getAddress());
        if (request.getStatus()       != null) employer.setStatus(request.getStatus());

        Employer saved = employerRepository.save(employer);
        log.info("Employer updated uuid={}", uuid);
        return toEmployerDto(saved);
    }

    @Override
    @Transactional
    public void deleteEmployer(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Employer employer = requireEmployer(tenantId, uuid);
        employer.setArchive(true);
        employerRepository.save(employer);
        log.info("Employer archived uuid={}", uuid);
    }

    // ── Employees ─────────────────────────────────────────────────────────────

    @Override
    public List<EmployerEmployeeDto> getEmployees(String employerUuid) {
        Long tenantId = TenantContext.getTenantId();
        Employer employer = requireEmployer(tenantId, employerUuid);
        return employeeRepository.findByEmployerIdAndArchiveFalse(employer.getId())
                .stream()
                .map(this::toEmployeeDto)
                .toList();
    }

    @Override
    @Transactional
    public EmployerEmployeeDto addEmployee(String employerUuid, AddEmployeeRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Employer employer = requireEmployer(tenantId, employerUuid);

        employeeRepository.findByEmployerIdAndPatientIdAndArchiveFalse(
                employer.getId(), request.getPatientId())
                .ifPresent(existing -> {
                    throw new PrimusException(ResponseCode.CONFLICT,
                            "Patient already linked to this employer");
                });

        EmployerEmployee employee = EmployerEmployee.builder()
                .tenantId(tenantId)
                .employerId(employer.getId())
                .patientId(request.getPatientId())
                .employeeId(request.getEmployeeId())
                .department(request.getDepartment())
                .startDate(request.getStartDate())
                .status("ACTIVE")
                .build();

        EmployerEmployee saved = employeeRepository.save(employee);

        // Increment employee count
        employer.setEmployeeCount(employer.getEmployeeCount() + 1);
        employerRepository.save(employer);

        log.info("Employee added employer={} patient={}", employerUuid, request.getPatientId());
        return toEmployeeDto(saved);
    }

    @Override
    @Transactional
    public void removeEmployee(String employerUuid, String employeeUuid) {
        Long tenantId = TenantContext.getTenantId();
        requireEmployer(tenantId, employerUuid);

        EmployerEmployee employee = employeeRepository.findByTenantIdAndUuid(tenantId, employeeUuid)
                .filter(e -> !e.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Employee record not found: " + employeeUuid));

        employee.setArchive(true);
        employeeRepository.save(employee);
        log.info("Employee removed uuid={}", employeeUuid);
    }

    // ── Plans ─────────────────────────────────────────────────────────────────

    @Override
    public List<EmployerPlanDto> getPlans(String employerUuid) {
        Long tenantId = TenantContext.getTenantId();
        Employer employer = requireEmployer(tenantId, employerUuid);
        return planRepository.findByEmployerIdAndArchiveFalse(employer.getId())
                .stream()
                .map(this::toPlanDto)
                .toList();
    }

    @Override
    @Transactional
    public EmployerPlanDto addPlan(String employerUuid, AddEmployerPlanRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Employer employer = requireEmployer(tenantId, employerUuid);

        EmployerPlan plan = EmployerPlan.builder()
                .tenantId(tenantId)
                .employerId(employer.getId())
                .planName(request.getPlanName())
                .discountPercent(request.getDiscountPercent())
                .effectiveDate(request.getEffectiveDate())
                .build();

        EmployerPlan saved = planRepository.save(plan);
        log.info("Plan added employer={} plan={}", employerUuid, request.getPlanName());
        return toPlanDto(saved);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Employer requireEmployer(Long tenantId, String uuid) {
        return employerRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(e -> !e.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Employer not found: " + uuid));
    }

    private EmployerDto toEmployerDto(Employer e) {
        return EmployerDto.builder()
                .uuid(e.getUuid())
                .name(e.getName())
                .taxId(e.getTaxId())
                .contactName(e.getContactName())
                .contactEmail(e.getContactEmail())
                .contactPhone(e.getContactPhone())
                .address(e.getAddress())
                .status(e.getStatus())
                .employeeCount(e.getEmployeeCount())
                .createdAt(e.getCreatedAt())
                .modifiedAt(e.getModifiedAt())
                .build();
    }

    private EmployerEmployeeDto toEmployeeDto(EmployerEmployee e) {
        return EmployerEmployeeDto.builder()
                .uuid(e.getUuid())
                .employerId(e.getEmployerId())
                .patientId(e.getPatientId())
                .employeeId(e.getEmployeeId())
                .department(e.getDepartment())
                .startDate(e.getStartDate())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private EmployerPlanDto toPlanDto(EmployerPlan p) {
        return EmployerPlanDto.builder()
                .uuid(p.getUuid())
                .employerId(p.getEmployerId())
                .planName(p.getPlanName())
                .discountPercent(p.getDiscountPercent())
                .effectiveDate(p.getEffectiveDate())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
