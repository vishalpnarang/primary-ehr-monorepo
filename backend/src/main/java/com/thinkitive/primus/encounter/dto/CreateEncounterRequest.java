package com.thinkitive.primus.encounter.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class CreateEncounterRequest {

    @NotNull private String patientUuid;
    @NotNull private String appointmentUuid;
    private String providerId;
    private String encounterType; // OFFICE_VISIT | TELEHEALTH | PREVENTIVE | URGENT
    private String chiefComplaint;
}
