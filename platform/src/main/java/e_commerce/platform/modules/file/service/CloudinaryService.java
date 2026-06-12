package e_commerce.platform.modules.file.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    
    public String upload(MultipartFile file) {
        return upload(file, "avatars");
    }

   
    public String upload(MultipartFile file, String folder) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image"
                )
            );
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            throw new RuntimeException("Upload to Cloudinary failed: " + e.getMessage());
        }
    }

    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new RuntimeException("Delete from Cloudinary failed: " + e.getMessage());
        }
    }
}