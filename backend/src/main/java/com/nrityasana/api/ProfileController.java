package com.nrityasana.api;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.validation.annotation.Validated;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
@RequestMapping("/api/profile")
    @CrossOrigin(origins = "*")
    @Validated
public class ProfileController {
    private final Path uploadRoot;
    private final JdbcTemplate jdbcTemplate;

    public ProfileController(@Value("${app.media.upload-dir:uploads}") String uploadDirectory, JdbcTemplate jdbcTemplate) {
        this.uploadRoot = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/{userId}")
    public ProfileView profile(@PathVariable @NotBlank @Size(max = 100) String userId) {
        return new ProfileView(jdbcTemplate.query("SELECT profile_picture_url FROM profiles WHERE user_id = ?", (rs, rowNum) -> rs.getString("profile_picture_url"), userId).stream().findFirst().orElse(null));
    }

    @PostMapping(value = "/{userId}/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProfileView uploadPicture(@PathVariable @NotBlank @Size(max = 100) String userId, @RequestPart MultipartFile file) {
        if (file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose an image for your profile picture");
        }
        String storedName = UUID.randomUUID() + extensionOf(file.getOriginalFilename());
        String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
        Path userDirectory = uploadRoot.resolve("profiles").resolve(safeUserId);
        try {
            Files.createDirectories(userDirectory);
            file.transferTo(userDirectory.resolve(storedName));
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to save profile picture", exception);
        }
        String url = "/uploads/profiles/" + safeUserId + "/" + storedName;
        jdbcTemplate.update("INSERT INTO profiles (user_id, profile_picture_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE profile_picture_url = VALUES(profile_picture_url)", userId, url);
        return profile(userId);
    }

    private static String extensionOf(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot).replaceAll("[^a-zA-Z0-9.]", "") : ".jpg";
    }

    public record ProfileView(String profilePictureUrl) {}
}
