package com.thinkitive.primus.shared.dto;

import org.springframework.http.HttpStatus;

public enum ResponseCode {

    // Generic success
    SUCCESS("SUCCESS", HttpStatus.OK, "Operation completed successfully"),
    CREATED("CREATED", HttpStatus.CREATED, "Resource created successfully"),
    UPDATED("UPDATED", HttpStatus.OK, "Resource updated successfully"),
    DELETED("DELETED", HttpStatus.OK, "Resource deleted successfully"),

    // Generic errors
    NOT_FOUND("NOT_FOUND", HttpStatus.NOT_FOUND, "Resource not found"),
    BAD_REQUEST("BAD_REQUEST", HttpStatus.BAD_REQUEST, "Invalid request"),
    UNAUTHORIZED("UNAUTHORIZED", HttpStatus.UNAUTHORIZED, "Authentication required"),
    FORBIDDEN("FORBIDDEN", HttpStatus.FORBIDDEN, "Access denied"),
    CONFLICT("CONFLICT", HttpStatus.CONFLICT, "Resource already exists"),
    INTERNAL_ERROR("INTERNAL_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred"),

    // Patient domain
    PATIENT_CREATED("PATIENT_CREATED", HttpStatus.CREATED, "Patient record created successfully"),
    PATIENT_NOT_FOUND("PATIENT_NOT_FOUND", HttpStatus.NOT_FOUND, "Patient not found"),
    PATIENT_DUPLICATE("PATIENT_DUPLICATE", HttpStatus.CONFLICT, "A patient with these details already exists"),

    // Appointment domain
    APPOINTMENT_CREATED("APPOINTMENT_CREATED", HttpStatus.CREATED, "Appointment scheduled successfully"),
    APPOINTMENT_CONFLICT("APPOINTMENT_CONFLICT", HttpStatus.CONFLICT, "The requested time slot is not available"),

    // Encounter domain
    ENCOUNTER_CREATED("ENCOUNTER_CREATED", HttpStatus.CREATED, "Encounter created successfully"),
    ENCOUNTER_SIGNED("ENCOUNTER_SIGNED", HttpStatus.OK, "Encounter signed and locked"),
    ENCOUNTER_LOCKED("ENCOUNTER_LOCKED", HttpStatus.CONFLICT, "Encounter is signed and cannot be modified"),

    // Billing domain
    CLAIM_SUBMITTED("CLAIM_SUBMITTED", HttpStatus.OK, "Claim submitted to clearinghouse"),
    CLAIM_DENIED("CLAIM_DENIED", HttpStatus.OK, "Claim was denied by payer"),

    // Tenant / user domain
    TENANT_PROVISIONED("TENANT_PROVISIONED", HttpStatus.CREATED, "Tenant provisioned successfully"),
    USER_INVITED("USER_INVITED", HttpStatus.OK, "User invitation sent");

    private final String code;
    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ResponseCode(String code, HttpStatus httpStatus, String defaultMessage) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }

    public String getCode() {
        return code;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
