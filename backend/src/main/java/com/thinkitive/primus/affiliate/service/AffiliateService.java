package com.thinkitive.primus.affiliate.service;

import com.thinkitive.primus.affiliate.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AffiliateService {

    Page<AffiliateDto> getAffiliates(String status, Pageable pageable);

    AffiliateDto getAffiliate(String uuid);

    AffiliateDto createAffiliate(CreateAffiliateRequest request);

    AffiliateDto updateAffiliate(String uuid, UpdateAffiliateRequest request);

    void deleteAffiliate(String uuid);
}
