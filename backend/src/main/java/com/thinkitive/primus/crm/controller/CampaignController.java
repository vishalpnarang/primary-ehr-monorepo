package com.thinkitive.primus.crm.controller;

import com.thinkitive.primus.crm.dto.*;
import com.thinkitive.primus.crm.service.CampaignService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/crm/campaigns")
@RequiredArgsConstructor
public class CampaignController extends BaseController {

    private final CampaignService campaignService;

    /** GET /api/v1/crm/campaigns */
    @GetMapping
    public ResponseEntity<ApiResponse> getCampaigns(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(campaignService.getCampaigns(status, pageable)));
    }

    /** GET /api/v1/crm/campaigns/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getCampaign(@PathVariable String uuid) {
        return ok(campaignService.getCampaign(uuid));
    }

    /** POST /api/v1/crm/campaigns */
    @PostMapping
    public ResponseEntity<ApiResponse> createCampaign(
            @Valid @RequestBody CreateCampaignRequest request) {
        return created(campaignService.createCampaign(request), "Campaign created");
    }

    /** PATCH /api/v1/crm/campaigns/{uuid}/status */
    @PatchMapping("/{uuid}/status")
    public ResponseEntity<ApiResponse> updateStatus(
            @PathVariable String uuid,
            @RequestParam String status) {
        return ok(campaignService.updateStatus(uuid, status), "Campaign status updated");
    }

    /** DELETE /api/v1/crm/campaigns/{uuid} */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse> deleteCampaign(@PathVariable String uuid) {
        campaignService.deleteCampaign(uuid);
        return noContent();
    }
}
