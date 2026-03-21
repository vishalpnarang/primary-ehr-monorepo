package com.thinkitive.primus.shared.exception;

import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.ResponseCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(PrimusException.class)
    public ResponseEntity<ApiResponse> handlePrimusException(
            PrimusException ex, HttpServletRequest request) {

        log.warn("PrimusException [{}]: {}", ex.getResponseCode().getCode(), ex.getMessage());

        ApiResponse body = ApiResponse.error(ex.getResponseCode(), ex.getMessage());
        body.setPath(request.getRequestURI());

        return ResponseEntity
                .status(ex.getResponseCode().getHttpStatus())
                .body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<ApiResponse.FieldError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> ApiResponse.FieldError.builder()
                        .field(error.getField())
                        .rejectedValue(error.getRejectedValue())
                        .message(error.getDefaultMessage())
                        .build())
                .collect(Collectors.toList());

        log.debug("Validation failed with {} field errors", fieldErrors.size());

        ApiResponse body = ApiResponse.error(
                ResponseCode.BAD_REQUEST,
                "Validation failed",
                fieldErrors);
        body.setPath(request.getRequestURI());

        return ResponseEntity
                .status(ResponseCode.BAD_REQUEST.getHttpStatus())
                .body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {

        List<ApiResponse.FieldError> fieldErrors = ex.getConstraintViolations()
                .stream()
                .map(violation -> {
                    String propertyPath = violation.getPropertyPath().toString();
                    String field = propertyPath.contains(".")
                            ? propertyPath.substring(propertyPath.lastIndexOf('.') + 1)
                            : propertyPath;
                    return ApiResponse.FieldError.builder()
                            .field(field)
                            .rejectedValue(violation.getInvalidValue())
                            .message(violation.getMessage())
                            .build();
                })
                .collect(Collectors.toList());

        log.debug("Constraint violation with {} violations", fieldErrors.size());

        ApiResponse body = ApiResponse.error(
                ResponseCode.BAD_REQUEST,
                "Constraint violation",
                fieldErrors);
        body.setPath(request.getRequestURI());

        return ResponseEntity
                .status(ResponseCode.BAD_REQUEST.getHttpStatus())
                .body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {

        log.warn("Access denied to {}: {}", request.getRequestURI(), ex.getMessage());

        ApiResponse body = ApiResponse.error(ResponseCode.FORBIDDEN, ex.getMessage());
        body.setPath(request.getRequestURI());

        return ResponseEntity
                .status(ResponseCode.FORBIDDEN.getHttpStatus())
                .body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {

        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        ApiResponse body = ApiResponse.error(
                ResponseCode.INTERNAL_ERROR,
                "An unexpected error occurred. Please try again later.");
        body.setPath(request.getRequestURI());

        return ResponseEntity
                .status(ResponseCode.INTERNAL_ERROR.getHttpStatus())
                .body(body);
    }
}
