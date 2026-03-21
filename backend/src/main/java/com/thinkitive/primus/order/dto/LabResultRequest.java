package com.thinkitive.primus.order.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class LabResultRequest {

    @NotNull private Instant resultedAt;
    private String performingLab;
    private List<ResultComponent> components;
    private String overallInterpretation; // NORMAL | ABNORMAL | CRITICAL

    @Data
    public static class ResultComponent {
        private String loincCode;
        private String testName;
        private String value;
        private String unit;
        private String referenceRange;
        private String flag; // NORMAL | LOW | HIGH | CRITICAL_LOW | CRITICAL_HIGH
    }
}
