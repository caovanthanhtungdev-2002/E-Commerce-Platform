package e_commerce.platform.modules.product.controller;

import e_commerce.platform.modules.file.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/images")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageService productImageService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<List<String>> uploadImages(
        @PathVariable Long productId,
        @RequestParam("files") List<MultipartFile> files
    ) {
        List<String> urls = productImageService.uploadImages(productId, files);
        return ResponseEntity.ok(urls);
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        productImageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
}