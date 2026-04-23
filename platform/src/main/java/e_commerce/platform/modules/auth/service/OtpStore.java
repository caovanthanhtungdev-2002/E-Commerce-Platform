package e_commerce.platform.modules.auth.service;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class OtpStore {

      // lưu OTP tạm thời trong RAM (test nhanh)
    private final Map<String, String> otpMap = new HashMap<>();

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