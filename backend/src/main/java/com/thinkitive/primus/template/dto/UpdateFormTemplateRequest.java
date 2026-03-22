package com.thinkitive.primus.template.dto;

import lombok.Data;

/**
 * Request body for updating an existing form template.
 * All fields are optional — only non-null fields are applied.
 * A template must be in DRAFT status to be updated.
 */
@Data
public class UpdateFormTemplateRequest {

    private String name;

    private String description;

    /**
     * One of: INTAKE, CONSENT, ASSESSMENT, CUSTOM
     */
    private String category;

    /**
     * Updated JSON string of the FormSchema object.
     */
    private String schemaData;
}
