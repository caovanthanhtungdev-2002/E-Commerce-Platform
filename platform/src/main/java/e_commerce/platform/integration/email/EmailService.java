package e_commerce.platform.integration.email;

public interface EmailService {

    void send(String to, String subject, String content);

}