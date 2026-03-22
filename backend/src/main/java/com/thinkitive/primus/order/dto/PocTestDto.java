package com.thinkitive.primus.order.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PocTestDto {

    private String uuid;
    private String name;
    private String category;
    private String resultFields;
    private String normalRanges;
    private String cptCode;
    private Instant createdAt;
    private Instant modifiedAt;
}
