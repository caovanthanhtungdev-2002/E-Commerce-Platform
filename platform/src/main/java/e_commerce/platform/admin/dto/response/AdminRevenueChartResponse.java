package e_commerce.platform.admin.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminRevenueChartResponse {

    private String date; // yyyy-MM-dd

    private Double revenue;
}