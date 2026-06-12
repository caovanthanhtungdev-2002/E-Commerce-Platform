package e_commerce.platform.modules.file.service;

import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.entity.ProductImage;
import e_commerce.platform.modules.product.repository.ProductImageRepository;
import e_commerce.platform.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;



import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    public List<String> uploadImages(Long productId, List<MultipartFile> files){
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        List<String> urls = new ArrayList<>();
        int currentCount = productImageRepository.findByProductIdOrderBySortOrderAsc(productId).size();

        for (int i = 0; i < files.size(); i++) {
            String url = cloudinaryService.upload(files.get(i), "products/" + productId);
            ProductImage image = ProductImage.builder()
                .product(product)
                .url(url)
                .sortOrder(currentCount + i)
                .build();
            productImageRepository.save(image);
            urls.add(url);
        }
        return urls;
    }

    public void deleteImage(Long imageId) {
        productImageRepository.deleteById(imageId);
    }

    public List<ProductImage> getImages(Long productId) {
        return productImageRepository.findByProductIdOrderBySortOrderAsc(productId);
    }
}