package e_commerce.platform.admin.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice(basePackages = "e_commerce.platform.admin")
public class AdminExceptionHandler {

    @ExceptionHandler(Exception.class)
public ResponseEntity<?> handleGeneral(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Internal server error"));
}

    @ExceptionHandler(AdminAccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AdminAccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(AdminValidationException.class)
    public ResponseEntity<?> handleValidation(AdminValidationException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
    }
}