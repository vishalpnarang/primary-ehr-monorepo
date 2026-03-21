package com.thinkitive.primus.prescription.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class InteractionResult {

    private boolean hasInteractions;
    private List<Interaction> interactions;

    @Data
    @Builder
    public static class Interaction {
        private String drug1;
        private String drug2;
        private String severity;    // CONTRAINDICATED | MAJOR | MODERATE | MINOR
        private String description;
        private String recommendation;
    }
}
