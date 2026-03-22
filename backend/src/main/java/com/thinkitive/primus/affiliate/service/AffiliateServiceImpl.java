package com.thinkitive.primus.affiliate.service;

import com.thinkitive.primus.affiliate.dto.*;
import com.thinkitive.primus.affiliate.entity.Affiliate;
import com.thinkitive.primus.affiliate.repository.AffiliateRepository;
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
public class AffiliateServiceImpl implements AffiliateService {

    private final AffiliateRepository affiliateRepository;

    @Override
    public Page<AffiliateDto> getAffiliates(String status, Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        if (status != null) {
            return affiliateRepository.findByTenantIdAndStatusAndArchiveFalse(tenantId, status.toUpperCase(), pageable)
                    .map(this::toAffiliateDto);
        }
        return affiliateRepository.findByTenantIdAndArchiveFalse(tenantId, pageable)
                .map(this::toAffiliateDto);
    }

    @Override
    public AffiliateDto getAffiliate(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        return toAffiliateDto(requireAffiliate(tenantId, uuid));
    }

    @Override
    @Transactional
    public AffiliateDto createAffiliate(CreateAffiliateRequest request) {
        Long tenantId = TenantContext.getTenantId();

        Affiliate affiliate = Affiliate.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .contactName(request.getContactName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .commissionRate(request.getCommissionRate())
                .status("ACTIVE")
                .build();

        Affiliate saved = affiliateRepository.save(affiliate);
        log.info("Affiliate created uuid={} tenantId={}", saved.getUuid(), tenantId);
        return toAffiliateDto(saved);
    }

    @Override
    @Transactional
    public AffiliateDto updateAffiliate(String uuid, UpdateAffiliateRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Affiliate affiliate = requireAffiliate(tenantId, uuid);

        if (request.getName()           != null) affiliate.setName(request.getName());
        if (request.getContactName()    != null) affiliate.setContactName(request.getContactName());
        if (request.getEmail()          != null) affiliate.setEmail(request.getEmail());
        if (request.getPhone()          != null) affiliate.setPhone(request.getPhone());
        if (request.getCommissionRate() != null) affiliate.setCommissionRate(request.getCommissionRate());
        if (request.getStatus()         != null) affiliate.setStatus(request.getStatus().toUpperCase());

        Affiliate saved = affiliateRepository.save(affiliate);
        log.info("Affiliate updated uuid={}", uuid);
        return toAffiliateDto(saved);
    }

    @Override
    @Transactional
    public void deleteAffiliate(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Affiliate affiliate = requireAffiliate(tenantId, uuid);
        affiliate.setArchive(true);
        affiliateRepository.save(affiliate);
        log.info("Affiliate archived uuid={}", uuid);
    }

    private Affiliate requireAffiliate(Long tenantId, String uuid) {
        return affiliateRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(a -> !a.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Affiliate not found: " + uuid));
    }

    private AffiliateDto toAffiliateDto(Affiliate a) {
        return AffiliateDto.builder()
                .uuid(a.getUuid())
                .name(a.getName())
                .contactName(a.getContactName())
                .email(a.getEmail())
                .phone(a.getPhone())
                .commissionRate(a.getCommissionRate())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt())
                .modifiedAt(a.getModifiedAt())
                .build();
    }
}
