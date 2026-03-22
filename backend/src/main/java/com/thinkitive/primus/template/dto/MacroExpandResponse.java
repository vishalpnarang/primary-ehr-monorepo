package com.thinkitive.primus.template.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MacroExpandResponse {

    private String abbreviation;
    private String expansion;
    private String category;
}
