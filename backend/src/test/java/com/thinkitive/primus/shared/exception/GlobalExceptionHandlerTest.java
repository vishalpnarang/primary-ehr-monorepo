package com.thinkitive.primus.shared.exception;

import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.ResponseCode;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @Mock
    HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/v1/test");
    }

    @Test
    void handlePrimusException_patientNotFound_returns404() {
        PrimusException ex = new PrimusException(ResponseCode.PATIENT_NOT_FOUND);

        ResponseEntity<ApiResponse> response = handler.handlePrimusException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("PATIENT_NOT_FOUND");
        assertThat(response.getBody().getStatus()).isEqualTo(404);
        assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
    }

    @Test
    void handlePrimusException_badRequest_returns400() {
        PrimusException ex = new PrimusException(
                ResponseCode.BAD_REQUEST, "Custom bad request message");

        ResponseEntity<ApiResponse> response = handler.handlePrimusException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("BAD_REQUEST");
        assertThat(response.getBody().getMessage()).isEqualTo("Custom bad request message");
    }

    @Test
    void handlePrimusException_encounterLocked_returns409() {
        PrimusException ex = new PrimusException(
                ResponseCode.ENCOUNTER_LOCKED, "Encounter is signed and cannot be modified");

        ResponseEntity<ApiResponse> response = handler.handlePrimusException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("ENCOUNTER_LOCKED");
    }

    @Test
    void handlePrimusException_responseCodeMatchesHttpStatus() {
        for (ResponseCode code : ResponseCode.values()) {
            PrimusException ex = new PrimusException(code);
            ResponseEntity<ApiResponse> response = handler.handlePrimusException(ex, request);

            assertThat(response.getStatusCode().value())
                    .as("HTTP status for ResponseCode %s", code)
                    .isEqualTo(code.getHttpStatus().value());
            assertThat(response.getBody().getCode()).isEqualTo(code.getCode());
        }
    }

    @Test
    void handleValidationException_returnsFieldLevelMessages() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);

        FieldError fieldError = new FieldError(
                "createPatientRequest", "firstName", null, false,
                null, null, "must not be blank");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<ApiResponse> response = handler.handleValidationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("BAD_REQUEST");
        assertThat(response.getBody().getErrors()).isNotNull().hasSize(1);

        ApiResponse.FieldError error = response.getBody().getErrors().get(0);
        assertThat(error.getField()).isEqualTo("firstName");
        assertThat(error.getMessage()).isEqualTo("must not be blank");
    }

    @Test
    void handleValidationException_multipleFieldErrors_allIncluded() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);

        List<FieldError> errors = List.of(
                new FieldError("req", "firstName", null, false, null, null, "must not be blank"),
                new FieldError("req", "dateOfBirth", null, false, null, null, "must be in the past"),
                new FieldError("req", "sex", null, false, null, null, "must not be blank")
        );

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(errors);

        ResponseEntity<ApiResponse> response = handler.handleValidationException(ex, request);

        assertThat(response.getBody().getErrors()).hasSize(3);
        assertThat(response.getBody().getMessage()).isEqualTo("Validation failed");
    }

    @Test
    void handleGenericException_returnsInternalServerError() {
        Exception ex = new RuntimeException("Unexpected database failure");

        ResponseEntity<ApiResponse> response = handler.handleGenericException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().getCode()).isEqualTo("INTERNAL_ERROR");
        assertThat(response.getBody().getStatus()).isEqualTo(500);
    }
}
