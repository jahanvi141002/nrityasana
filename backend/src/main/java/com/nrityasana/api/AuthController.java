package com.nrityasana.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthService.AuthResponse register(@Valid @RequestBody Credentials request) {
        return authService.register(request.email(), request.password());
    }

    @PostMapping("/login")
    public AuthService.AuthResponse login(@Valid @RequestBody Credentials request) {
        return authService.login(request.email(), request.password());
    }

    @PostMapping("/google")
    public AuthService.AuthResponse google(@Valid @RequestBody GoogleRequest request) {
        return authService.loginWithGoogle(request.idToken());
    }

    public record Credentials(
        @Email @NotBlank @Size(max = 254) String email,
        @NotBlank @Size(min = 8, max = 128) String password
    ) {}

    public record GoogleRequest(@NotBlank @Size(max = 4096) String idToken) {}
}
