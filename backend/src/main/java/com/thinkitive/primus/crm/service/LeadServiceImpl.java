package com.thinkitive.primus.crm.service;

import com.thinkitive.primus.crm.dto.*;
import com.thinkitive.primus.crm.entity.Lead;
import com.thinkitive.primus.crm.repository.LeadRepository;
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
public class LeadServiceImpl implements LeadService {

    private final LeadRepository leadRepository;

    @Override
    public Page<LeadDto> getLeads(String status, Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        if (status != null) {
            Lead.LeadStatus leadStatus = parseLeadStatus(status);
            return leadRepository.findByTenantIdAndStatusAndArchiveFalse(tenantId, leadStatus, pageable)
                    .map(this::toLeadDto);
        }
        return leadRepository.findByTenantIdAndArchiveFalse(tenantId, pageable)
                .map(this::toLeadDto);
    }

    @Override
    public LeadDto getLead(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        return toLeadDto(requireLead(tenantId, uuid));
    }

    @Override
    @Transactional
    public LeadDto createLead(CreateLeadRequest request) {
        Long tenantId = TenantContext.getTenantId();

        Lead lead = Lead.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .source(parseLeadSource(request.getSource()))
                .status(Lead.LeadStatus.NEW)
                .assignedTo(request.getAssignedTo())
                .notes(request.getNotes())
                .build();

        Lead saved = leadRepository.save(lead);
        log.info("Lead created uuid={} tenantId={}", saved.getUuid(), tenantId);
        return toLeadDto(saved);
    }

    @Override
    @Transactional
    public LeadDto updateLead(String uuid, UpdateLeadRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Lead lead = requireLead(tenantId, uuid);

        if (request.getStatus()     != null) lead.setStatus(parseLeadStatus(request.getStatus()));
        if (request.getAssignedTo() != null) lead.setAssignedTo(request.getAssignedTo());
        if (request.getNotes()      != null) lead.setNotes(request.getNotes());
        if (request.getEmail()      != null) lead.setEmail(request.getEmail());
        if (request.getPhone()      != null) lead.setPhone(request.getPhone());

        Lead saved = leadRepository.save(lead);
        log.info("Lead updated uuid={}", uuid);
        return toLeadDto(saved);
    }

    @Override
    @Transactional
    public void deleteLead(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Lead lead = requireLead(tenantId, uuid);
        lead.setArchive(true);
        leadRepository.save(lead);
        log.info("Lead archived uuid={}", uuid);
    }

    private Lead requireLead(Long tenantId, String uuid) {
        return leadRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(l -> !l.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Lead not found: " + uuid));
    }

    private LeadDto toLeadDto(Lead l) {
        return LeadDto.builder()
                .uuid(l.getUuid())
                .name(l.getName())
                .email(l.getEmail())
                .phone(l.getPhone())
                .source(l.getSource() != null ? l.getSource().name() : null)
                .status(l.getStatus() != null ? l.getStatus().name() : null)
                .assignedTo(l.getAssignedTo())
                .notes(l.getNotes())
                .createdAt(l.getCreatedAt())
                .modifiedAt(l.getModifiedAt())
                .build();
    }

    private Lead.LeadStatus parseLeadStatus(String value) {
        if (value == null) return Lead.LeadStatus.NEW;
        try {
            return Lead.LeadStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown lead status '{}', defaulting to NEW", value);
            return Lead.LeadStatus.NEW;
        }
    }

    private Lead.LeadSource parseLeadSource(String value) {
        if (value == null) return Lead.LeadSource.OTHER;
        try {
            return Lead.LeadSource.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown lead source '{}', defaulting to OTHER", value);
            return Lead.LeadSource.OTHER;
        }
    }
}
