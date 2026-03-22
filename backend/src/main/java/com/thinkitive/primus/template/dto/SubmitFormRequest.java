package com.thinkitive.primus.template.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for submitting a patient's filled form response.
 * submissionData should be a JSON string representing FormValues (fieldId → value map).
 */
@Data
public class SubmitFormRequest {

    /**
     * UUID of the form_templates record to submit against.
     */
    @NotBlank
    private String templateId;

    /**
     * UUID of the patient submitting the form.
     */
    @NotBlank
    private String patientId;

    /**
     * JSON string of the FormValues map: {"fieldId": value, ...}
     */
    @NotNull
    private String submissionData;
}
