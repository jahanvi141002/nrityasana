package com.nrityasana.api;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MediaStorageConfig implements WebMvcConfigurer {
    private final String uploadLocation;

    public MediaStorageConfig(@Value("${app.media.upload-dir:uploads}") String uploadDirectory) {
        this.uploadLocation = Paths.get(uploadDirectory).toAbsolutePath().normalize().toUri().toString();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**").addResourceLocations(uploadLocation);
    }
}
