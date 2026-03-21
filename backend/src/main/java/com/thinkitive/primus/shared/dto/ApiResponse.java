package com.thinkitive.primus.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse {

    private Instant timestamp;
    private int status;
    private String code;
    private String message;
    private Object data;
    private String path;
    private List<FieldError> errors;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FieldError {
        private String field;
        private Object rejectedValue;
        private String message;
    }

    public static ApiResponse success(Object data, String message) {
        return ApiResponse.builder()
                .timestamp(Instant.now())
                .status(ResponseCode.SUCCESS.getHttpStatus().value())
                .code(ResponseCode.SUCCESS.getCode())
                .message(message != null ? message : ResponseCode.SUCCESS.getDefaultMessage())
                .data(data)
                .build();
    }

    public static ApiResponse created(Object data, String message) {
        return ApiResponse.builder()
                .timestamp(Instant.now())
                .status(ResponseCode.CREATED.getHttpStatus().value())
                .code(ResponseCode.CREATED.getCode())
                .message(message != null ? message : ResponseCode.CREATED.getDefaultMessage())
                .data(data)
                .build();
    }

    public static ApiResponse error(ResponseCode code, String message) {
        return ApiResponse.builder()
                .timestamp(Instant.now())
                .status(code.getHttpStatus().value())
                .code(code.getCode())
                .message(message != null ? message : code.getDefaultMessage())
                .build();
    }

    public static ApiResponse error(ResponseCode code, String message, List<FieldError> errors) {
        return ApiResponse.builder()
                .timestamp(Instant.now())
                .status(code.getHttpStatus().value())
                .code(code.getCode())
                .message(message != null ? message : code.getDefaultMessage())
                .errors(errors)
                .build();
    }
}
