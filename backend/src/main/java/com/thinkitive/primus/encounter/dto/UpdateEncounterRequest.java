package com.thinkitive.primus.encounter.dto;

import lombok.Data;

import java.util.List;

@Data
public class UpdateEncounterRequest {

    // SOAP fields
    private String subjective;
    private String objective;
    private String assessment;
    private String plan;

    // Structured data
    private List<String> diagnosisCodes;   // ICD-10
    private List<String> procedureCodes;   // CPT
    private String encounterType;
    private String chiefComplaint;
}
