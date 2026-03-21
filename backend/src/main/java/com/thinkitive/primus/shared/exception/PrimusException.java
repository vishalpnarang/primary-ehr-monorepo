package com.thinkitive.primus.shared.exception;

import com.thinkitive.primus.shared.dto.ResponseCode;

public class PrimusException extends RuntimeException {

    private final ResponseCode responseCode;

    public PrimusException(ResponseCode responseCode) {
        super(responseCode.getDefaultMessage());
        this.responseCode = responseCode;
    }

    public PrimusException(ResponseCode responseCode, String message) {
        super(message);
        this.responseCode = responseCode;
    }

    public PrimusException(ResponseCode responseCode, String message, Throwable cause) {
        super(message, cause);
        this.responseCode = responseCode;
    }

    public ResponseCode getResponseCode() {
        return responseCode;
    }
}
