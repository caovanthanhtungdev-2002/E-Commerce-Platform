package e_commerce.platform.modules.file.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.file.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final ProductImageService productImageService;

    @PostMapping("/upload/product")
    public ApiResponse<String> uploadProduct(
            @RequestParam("file") MultipartFile file
    ) {
        String url = productImageService.upload(file);
        return ApiResponse.success("Upload product success", url);
    }
}