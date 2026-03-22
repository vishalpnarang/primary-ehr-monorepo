package com.thinkitive.primus.affiliate.service;

import com.thinkitive.primus.affiliate.dto.*;
import com.thinkitive.primus.affiliate.entity.Broker;
import com.thinkitive.primus.affiliate.repository.BrokerRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrokerServiceImpl implements BrokerService {

    private final BrokerRepository brokerRepository;

    @Override
    public Page<BrokerDto> getBrokers(String status, Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        if (status != null) {
            return brokerRepository.findByTenantIdAndStatusAndArchiveFalse(tenantId, status.toUpperCase(), pageable)
                    .map(this::toBrokerDto);
        }
        return brokerRepository.findByTenantIdAndArchiveFalse(tenantId, pageable)
                .map(this::toBrokerDto);
    }

    @Override
    public BrokerDto getBroker(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        return toBrokerDto(requireBroker(tenantId, uuid));
    }

    @Override
    @Transactional
    public BrokerDto createBroker(CreateBrokerRequest request) {
        Long tenantId = TenantContext.getTenantId();

        if (request.getLicenseNumber() != null
                && brokerRepository.existsByTenantIdAndLicenseNumberAndArchiveFalse(tenantId, request.getLicenseNumber())) {
            throw new PrimusException(ResponseCode.CONFLICT,
                    "Broker with license number already exists: " + request.getLicenseNumber());
        }

        Broker broker = Broker.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .firmName(request.getFirmName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .licenseNumber(request.getLicenseNumber())
                .commissionRate(request.getCommissionRate())
                .status("ACTIVE")
                .build();

        Broker saved = brokerRepository.save(broker);
        log.info("Broker created uuid={} tenantId={}", saved.getUuid(), tenantId);
        return toBrokerDto(saved);
    }

    @Override
    @Transactional
    public BrokerDto updateBroker(String uuid, UpdateBrokerRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Broker broker = requireBroker(tenantId, uuid);

        if (request.getName()           != null) broker.setName(request.getName());
        if (request.getFirmName()       != null) broker.setFirmName(request.getFirmName());
        if (request.getEmail()          != null) broker.setEmail(request.getEmail());
        if (request.getPhone()          != null) broker.setPhone(request.getPhone());
        if (request.getLicenseNumber()  != null) broker.setLicenseNumber(request.getLicenseNumber());
        if (request.getCommissionRate() != null) broker.setCommissionRate(request.getCommissionRate());
        if (request.getStatus()         != null) broker.setStatus(request.getStatus().toUpperCase());

        Broker saved = brokerRepository.save(broker);
        log.info("Broker updated uuid={}", uuid);
        return toBrokerDto(saved);
    }

    @Override
    @Transactional
    public void deleteBroker(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Broker broker = requireBroker(tenantId, uuid);
        broker.setArchive(true);
        brokerRepository.save(broker);
        log.info("Broker archived uuid={}", uuid);
    }

    private Broker requireBroker(Long tenantId, String uuid) {
        return brokerRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(b -> !b.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Broker not found: " + uuid));
    }

    private BrokerDto toBrokerDto(Broker b) {
        return BrokerDto.builder()
                .uuid(b.getUuid())
                .name(b.getName())
                .firmName(b.getFirmName())
                .email(b.getEmail())
                .phone(b.getPhone())
                .licenseNumber(b.getLicenseNumber())
                .commissionRate(b.getCommissionRate())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .modifiedAt(b.getModifiedAt())
                .build();
    }
}
