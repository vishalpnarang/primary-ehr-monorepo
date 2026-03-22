package com.thinkitive.primus.crm.service;

import com.thinkitive.primus.crm.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LeadService {

    Page<LeadDto> getLeads(String status, Pageable pageable);

    LeadDto getLead(String uuid);

    LeadDto createLead(CreateLeadRequest request);

    LeadDto updateLead(String uuid, UpdateLeadRequest request);

    void deleteLead(String uuid);
}
