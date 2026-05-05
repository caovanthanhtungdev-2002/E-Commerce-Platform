package e_commerce.platform.modules.payment.vnpay.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;

public class VNPayUtil {

    public static String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKey);
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b)); 
            }
            return hash.toString();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static String buildHashData(Map<String, String> params) {
        TreeMap<String, String> sorted = new TreeMap<>(params);
        StringBuilder sb = new StringBuilder();
        boolean first = true;

        for (Map.Entry<String, String> entry : sorted.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                if (!first) sb.append("&");

                sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
                sb.append("=");
                sb.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));

                first = false;
            }
        }

        return sb.toString();
    }

   
    public static String buildQuery(Map<String, String> params) {
        TreeMap<String, String> sorted = new TreeMap<>(params);
        StringBuilder query = new StringBuilder();

        for (Map.Entry<String, String> entry : sorted.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
                query.append('=');
                query.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
                query.append('&');
            }
        }

        if (query.length() > 0) {
            query.deleteCharAt(query.length() - 1);
        }

        return query.toString();
    }
}