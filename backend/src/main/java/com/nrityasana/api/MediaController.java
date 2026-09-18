package com.nrityasana.api;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
@RequestMapping("/api/media")
    @CrossOrigin(origins = "*")
    @Validated
public class MediaController {
    private final Path uploadRoot;
    private final JdbcTemplate jdbcTemplate;

    public MediaController(@Value("${app.media.upload-dir:uploads}") String uploadDirectory, JdbcTemplate jdbcTemplate) {
        this.uploadRoot = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MediaItem upload(@RequestParam @NotBlank @Size(max = 100) String userId, @RequestPart MultipartFile file) {
        if (file.isEmpty() || file.getSize() > 100 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a photo or video first");
        }
        String originalName = file.getOriginalFilename() == null ? "media" : file.getOriginalFilename();
        String extension = extensionOf(originalName);
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image and video files are supported");
        }
        String mediaType = contentType.startsWith("video/") ? "video" : "photo";
        String storedName = UUID.randomUUID() + extension;
        Path userDirectory = uploadRoot.resolve(safeUserId(userId));
        try {
            Files.createDirectories(userDirectory);
            file.transferTo(userDirectory.resolve(storedName));
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to save media", exception);
        }
        MediaItem item = new MediaItem(UUID.randomUUID().toString(), originalName, mediaType, "/uploads/" + safeUserId(userId) + "/" + storedName);
        jdbcTemplate.update("INSERT INTO media_items (id, user_id, name, media_type, url) VALUES (?, ?, ?, ?, ?)", item.id(), userId, item.name(), item.type(), item.url());
        return item;
    }

    @GetMapping("/{userId}")
    public List<MediaItem> list(@PathVariable String userId) {
        return jdbcTemplate.query("SELECT id, name, media_type, url FROM media_items WHERE user_id = ? ORDER BY created_at DESC", (rs, rowNum) -> new MediaItem(rs.getString("id"), rs.getString("name"), rs.getString("media_type"), rs.getString("url")), userId);
    }

    private static String safeUserId(String userId) {
        return userId.replaceAll("[^a-zA-Z0-9_-]", "_");
    }

    private static String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot).replaceAll("[^a-zA-Z0-9.]", "") : "";
    }

    public record MediaItem(String id, String name, String type, String url) {}
}
