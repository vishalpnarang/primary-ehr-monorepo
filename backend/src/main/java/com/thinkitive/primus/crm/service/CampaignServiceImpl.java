package com.thinkitive.primus.crm.service;

import com.thinkitive.primus.crm.dto.*;
import com.thinkitive.primus.crm.entity.Campaign;
import com.thinkitive.primus.crm.repository.CampaignRepository;
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
public class CampaignServiceImpl implements CampaignService {

    private final CampaignRepository campaignRepository;

    @Override
    public Page<CampaignDto> getCampaigns(String status, Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        if (status != null) {
            Campaign.CampaignStatus campaignStatus = parseCampaignStatus(status);
            return campaignRepository.findByTenantIdAndStatusAndArchiveFalse(tenantId, campaignStatus, pageable)
                    .map(this::toCampaignDto);
        }
        return campaignRepository.findByTenantIdAndArchiveFalse(tenantId, pageable)
                .map(this::toCampaignDto);
    }

    @Override
    public CampaignDto getCampaign(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        return toCampaignDto(requireCampaign(tenantId, uuid));
    }

    @Override
    @Transactional
    public CampaignDto createCampaign(CreateCampaignRequest request) {
        Long tenantId = TenantContext.getTenantId();

        Campaign campaign = Campaign.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .type(parseCampaignType(request.getType()))
                .status(Campaign.CampaignStatus.DRAFT)
                .targetAudience(request.getTargetAudience())
                .scheduledAt(request.getScheduledAt())
                .build();

        Campaign saved = campaignRepository.save(campaign);
        log.info("Campaign created uuid={} tenantId={}", saved.getUuid(), tenantId);
        return toCampaignDto(saved);
    }

    @Override
    @Transactional
    public CampaignDto updateStatus(String uuid, String status) {
        Long tenantId = TenantContext.getTenantId();
        Campaign campaign = requireCampaign(tenantId, uuid);
        campaign.setStatus(parseCampaignStatus(status));
        Campaign saved = campaignRepository.save(campaign);
        log.info("Campaign status updated uuid={} status={}", uuid, status);
        return toCampaignDto(saved);
    }

    @Override
    @Transactional
    public void deleteCampaign(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Campaign campaign = requireCampaign(tenantId, uuid);
        campaign.setArchive(true);
        campaignRepository.save(campaign);
        log.info("Campaign archived uuid={}", uuid);
    }

    private Campaign requireCampaign(Long tenantId, String uuid) {
        return campaignRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(c -> !c.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Campaign not found: " + uuid));
    }

    private CampaignDto toCampaignDto(Campaign c) {
        return CampaignDto.builder()
                .uuid(c.getUuid())
                .name(c.getName())
                .type(c.getType() != null ? c.getType().name() : null)
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .targetAudience(c.getTargetAudience())
                .scheduledAt(c.getScheduledAt())
                .completedAt(c.getCompletedAt())
                .metrics(c.getMetrics())
                .createdAt(c.getCreatedAt())
                .modifiedAt(c.getModifiedAt())
                .build();
    }

    private Campaign.CampaignStatus parseCampaignStatus(String value) {
        if (value == null) return Campaign.CampaignStatus.DRAFT;
        try {
            return Campaign.CampaignStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown campaign status '{}', defaulting to DRAFT", value);
            return Campaign.CampaignStatus.DRAFT;
        }
    }

    private Campaign.CampaignType parseCampaignType(String value) {
        if (value == null) return Campaign.CampaignType.EMAIL;
        try {
            return Campaign.CampaignType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown campaign type '{}', defaulting to EMAIL", value);
            return Campaign.CampaignType.EMAIL;
        }
    }
}
