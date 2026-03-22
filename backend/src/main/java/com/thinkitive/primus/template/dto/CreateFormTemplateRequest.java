package com.thinkitive.primus.template.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for creating a new form template.
 * schemaData should be a valid JSON string representing the FormSchema from the UI library.
 */
@Data
public class CreateFormTemplateRequest {

    @NotBlank
    private String name;

    private String description;

    /**
     * One of: INTAKE, CONSENT, ASSESSMENT, CUSTOM
     */
    @NotBlank
    private String category;

    /**
     * JSON string of the full FormSchema object from the primus-ehr-ui FormBuilder.
     * Example: {"id":"...","title":"...","isMultiStep":false,"steps":[...]}
     */
    @NotNull
    private String schemaData;
}
