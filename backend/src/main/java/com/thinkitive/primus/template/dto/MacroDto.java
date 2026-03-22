package com.thinkitive.primus.template.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class MacroDto {

    private String uuid;
    private String name;
    private String abbreviation;
    private String expansion;
    private String category;
    private boolean isShared;
    private String createdByProvider;
    private Instant createdAt;
    private Instant modifiedAt;
}
