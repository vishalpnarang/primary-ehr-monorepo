package com.thinkitive.primus.affiliate.controller;

import com.thinkitive.primus.affiliate.dto.*;
import com.thinkitive.primus.affiliate.service.AffiliateService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.thinkitive.primus.shared.security.Roles;

@RestController
@RequestMapping("/api/v1/affiliates")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_TENANT_MGMT_ROLE)
public class AffiliateController extends BaseController {

    private final AffiliateService affiliateService;

    /** GET /api/v1/affiliates */
    @GetMapping
    public ResponseEntity<ApiResponse> getAffiliates(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(affiliateService.getAffiliates(status, pageable)));
    }

    /** GET /api/v1/affiliates/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getAffiliate(@PathVariable String uuid) {
        return ok(affiliateService.getAffiliate(uuid));
    }

    /** POST /api/v1/affiliates */
    @PostMapping
    public ResponseEntity<ApiResponse> createAffiliate(
            @Valid @RequestBody CreateAffiliateRequest request) {
        return created(affiliateService.createAffiliate(request), "Affiliate created");
    }

    /** PUT /api/v1/affiliates/{uuid} */
    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse> updateAffiliate(
            @PathVariable String uuid,
            @Valid @RequestBody UpdateAffiliateRequest request) {
        return ok(affiliateService.updateAffiliate(uuid, request), "Affiliate updated");
    }

    /** DELETE /api/v1/affiliates/{uuid} */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse> deleteAffiliate(@PathVariable String uuid) {
        affiliateService.deleteAffiliate(uuid);
        return noContent();
    }
}
