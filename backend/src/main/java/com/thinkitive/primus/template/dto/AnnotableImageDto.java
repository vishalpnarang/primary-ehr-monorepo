package com.thinkitive.primus.template.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AnnotableImageDto {

    private String uuid;
    private String name;
    private String category;
    private String imageUrl;
    private String description;
    private boolean isSystem;
    private Instant createdAt;
    private Instant modifiedAt;
}
