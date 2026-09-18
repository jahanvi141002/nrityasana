package com.nrityasana.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/classes")
    @CrossOrigin(origins = "*")
    @Validated
public class LiveClassController {
    private final LiveClassService classService;

    public LiveClassController(LiveClassService classService) {
        this.classService = classService;
    }

    @GetMapping
    public java.util.List<LiveClassService.ClassView> upcoming(@RequestParam @NotBlank @Size(max = 100) String userId) {
        return classService.upcoming(userId);
    }

    @PostMapping
    public LiveClassService.ClassView schedule(
        @RequestHeader("X-User-Email") @NotBlank @jakarta.validation.constraints.Email @Size(max = 254) String adminEmail,
        @Valid @RequestBody ScheduleRequest request
    ) {
        return classService.schedule(adminEmail, request.title(), request.description(), request.startTime(), request.durationMinutes(), request.meetingUrl());
    }

    @PostMapping("/{classId}/join")
    public LiveClassService.ClassView join(@PathVariable String classId, @RequestParam String userId) {
        return classService.join(classId, userId);
    }

    public record ScheduleRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 500) String description,
        @NotBlank @Size(max = 40) String startTime,
        @Min(15) int durationMinutes,
        @NotBlank @Size(max = 2048) @Pattern(regexp = "https?://.+", message = "Meeting link must start with http:// or https://") String meetingUrl
    ) {}
}
