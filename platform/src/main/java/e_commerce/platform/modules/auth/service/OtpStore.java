package e_commerce.platform.modules.auth.service;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;



@Component
public class OtpStore {

     private final Map<String, String> otpMap = new ConcurrentHashMap<>();

     // lưu OTP theo email
    public void save(String email, String otp) {
        otpMap.put(email, otp);
    }

      // lấy OTP theo email
    public String get(String email) {
        return otpMap.get(email);
    }

     // xóa OTP sau khi dùng
    public void remove(String email) {
        otpMap.remove(email);
    }
}