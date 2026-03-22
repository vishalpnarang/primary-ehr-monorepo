package com.thinkitive.primus.crm.service;

import com.thinkitive.primus.crm.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CampaignService {

    Page<CampaignDto> getCampaigns(String status, Pageable pageable);

    CampaignDto getCampaign(String uuid);

    CampaignDto createCampaign(CreateCampaignRequest request);

    CampaignDto updateStatus(String uuid, String status);

    void deleteCampaign(String uuid);
}
