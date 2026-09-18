package com.nrityasana.api;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class AuthService {
    private final JdbcTemplate jdbcTemplate;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Key signingKey;
    private final long expirationHours;
    private final String googleClientId;
    private final String adminEmail;
    private final RestClient restClient = RestClient.create();

    public AuthService(
        @Value("${app.jwt.secret}") String jwtSecret,
        @Value("${app.jwt.expiration-hours:24}") long expirationHours,
        @Value("${app.google.client-id:}") String googleClientId,
        @Value("${app.admin-email:admin@nrityasana.com}") String adminEmail,
        JdbcTemplate jdbcTemplate
    ) {
        if (jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 bytes");
        }
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationHours = expirationHours;
        this.googleClientId = googleClientId;
        this.adminEmail = normalizeEmail(adminEmail);
        this.jdbcTemplate = jdbcTemplate;
    }

    public AuthResponse register(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        validatePassword(password);
        User newUser = new User(UUID.randomUUID().toString(), normalizedEmail, passwordEncoder.encode(password));
        try {
            jdbcTemplate.update("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)", newUser.id(), newUser.email(), newUser.passwordHash());
        } catch (org.springframework.dao.DuplicateKeyException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already exists for this email");
        }
        return responseFor(newUser);
    }

    public AuthResponse login(String email, String password) {
        User user = findByEmail(normalizeEmail(email));
        if (user == null || !passwordEncoder.matches(password, user.passwordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return responseFor(user);
    }

    public AuthResponse loginWithGoogle(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google identity token is required");
        }
        Map<?, ?> profile;
        try {
            profile = restClient.get()
                .uri(uriBuilder -> uriBuilder.scheme("https").host("oauth2.googleapis.com").path("/tokeninfo").queryParam("id_token", idToken).build())
                .retrieve()
                .body(Map.class);
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unable to verify Google account");
        }
        if (profile == null || profile.get("email") == null || !"true".equals(profile.get("email_verified"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google account is not verified");
        }
        if (!googleClientId.isBlank() && !googleClientId.equals(profile.get("aud"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token audience is invalid");
        }
        String email = normalizeEmail(profile.get("email").toString());
        User user = findByEmail(email);
        if (user == null) {
            user = new User(UUID.randomUUID().toString(), email, null);
            jdbcTemplate.update("INSERT INTO users (id, email, password_hash) VALUES (?, ?, NULL)", user.id(), user.email());
        }
        return responseFor(user);
    }

    private AuthResponse responseFor(User user) {
        Instant now = Instant.now();
        String token = Jwts.builder()
            .subject(user.id())
            .claim("email", user.email())
            .claim("role", roleFor(user.email()))
            .issuedAt(java.util.Date.from(now))
            .expiration(java.util.Date.from(now.plusSeconds(expirationHours * 3600)))
            .signWith(signingKey)
            .compact();
        return new AuthResponse(token, user.id(), user.email(), roleFor(user.email()));
    }

    public boolean isAdmin(String email) {
        return adminEmail.equals(normalizeEmail(email));
    }

    public java.util.List<UserSummary> directory(String currentUserId) {
        return jdbcTemplate.query("SELECT id, email FROM users WHERE id <> ? ORDER BY email", (rs, rowNum) -> new UserSummary(rs.getString("id"), rs.getString("email"), roleFor(rs.getString("email"))), currentUserId);
    }

    private User findByEmail(String email) {
        return jdbcTemplate.query("SELECT id, email, password_hash FROM users WHERE email = ?", (rs, rowNum) -> new User(rs.getString("id"), rs.getString("email"), rs.getString("password_hash")), email)
            .stream().findFirst().orElse(null);
    }

    private String roleFor(String email) {
        return isAdmin(email) ? "ADMIN" : "USER";
    }

    private static String normalizeEmail(String email) {
        if (email == null || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid email is required");
        }
        return email.trim().toLowerCase();
    }

    private static void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
    }

    private record User(String id, String email, String passwordHash) {}
    public record UserSummary(String id, String email, String role) {}
    public record AuthResponse(String token, String userId, String email, String role) {}
}
