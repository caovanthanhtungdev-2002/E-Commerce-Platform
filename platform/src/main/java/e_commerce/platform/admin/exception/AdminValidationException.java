package e_commerce.platform.admin.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class AdminValidationException extends RuntimeException {

    public AdminValidationException(String message) {
        super(message);
    }

    public AdminValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}