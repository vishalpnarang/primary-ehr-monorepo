package com.thinkitive.primus.shared.controller;

import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.ResponseCode;
import org.springframework.http.ResponseEntity;

public abstract class BaseController {

    protected ResponseEntity<ApiResponse> ok(Object data, String message) {
        ApiResponse body = ApiResponse.success(data, message);
        return ResponseEntity
                .status(ResponseCode.SUCCESS.getHttpStatus())
                .body(body);
    }

    protected ResponseEntity<ApiResponse> created(Object data, String message) {
        ApiResponse body = ApiResponse.created(data, message);
        return ResponseEntity
                .status(ResponseCode.CREATED.getHttpStatus())
                .body(body);
    }

    protected ResponseEntity<ApiResponse> ok(Object data) {
        return ok(data, null);
    }

    protected ResponseEntity<ApiResponse> created(Object data) {
        return created(data, null);
    }

    protected ResponseEntity<ApiResponse> noContent() {
        return ResponseEntity.noContent().build();
    }

    protected ResponseEntity<ApiResponse> error(ResponseCode code, String message) {
        ApiResponse body = ApiResponse.error(code, message);
        return ResponseEntity
                .status(code.getHttpStatus())
                .body(body);
    }

    protected ResponseEntity<ApiResponse> error(ResponseCode code) {
        return error(code, null);
    }
}
