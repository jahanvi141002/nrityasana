package com.nrityasana.api;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LiveClassService {
    private final JdbcTemplate jdbcTemplate;
    private final AuthService authService;

    public LiveClassService(AuthService authService, JdbcTemplate jdbcTemplate) {
        this.authService = authService;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ClassView> upcoming(String userId) {
        LocalDateTime now = LocalDateTime.now();
        return jdbcTemplate.query("SELECT id, title, description, start_time, duration_minutes, meeting_url, created_by FROM live_classes WHERE start_time > ? ORDER BY start_time", (rs, rowNum) -> view(new ScheduledClass(rs.getString("id"), rs.getString("title"), rs.getString("description"), rs.getTimestamp("start_time").toLocalDateTime(), rs.getInt("duration_minutes"), rs.getString("meeting_url"), rs.getString("created_by")), userId), java.sql.Timestamp.valueOf(now.minusHours(2)));
    }

    public ClassView schedule(String adminEmail, String title, String description, String startTime, int durationMinutes, String meetingUrl) {
        requireAdmin(adminEmail);
        if (title == null || title.isBlank() || meetingUrl == null || meetingUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title and meeting link are required");
        }
        LocalDateTime parsedStart;
        try {
            parsedStart = LocalDateTime.parse(startTime);
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be ISO local date-time");
        }
        if (parsedStart.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Class must be scheduled in the future");
        }
        ScheduledClass scheduled = new ScheduledClass(UUID.randomUUID().toString(), title.trim(), description == null ? "" : description.trim(), parsedStart, Math.max(15, durationMinutes), meetingUrl.trim(), adminEmail);
        jdbcTemplate.update("INSERT INTO live_classes (id, title, description, start_time, duration_minutes, meeting_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)", scheduled.id(), scheduled.title(), scheduled.description(), java.sql.Timestamp.valueOf(scheduled.startTime()), scheduled.durationMinutes(), scheduled.meetingUrl(), scheduled.createdBy());
        return view(scheduled, adminEmail);
    }

    public ClassView join(String classId, String userId) {
        ScheduledClass scheduled = find(classId);
        jdbcTemplate.update("INSERT IGNORE INTO class_attendees (class_id, user_id) VALUES (?, ?)", classId, userId);
        return view(scheduled, userId);
    }

    private ScheduledClass find(String classId) {
        return jdbcTemplate.query("SELECT id, title, description, start_time, duration_minutes, meeting_url, created_by FROM live_classes WHERE id = ?", (rs, rowNum) -> new ScheduledClass(rs.getString("id"), rs.getString("title"), rs.getString("description"), rs.getTimestamp("start_time").toLocalDateTime(), rs.getInt("duration_minutes"), rs.getString("meeting_url"), rs.getString("created_by")), classId).stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
    }

    private void requireAdmin(String email) {
        if (email == null || !authService.isAdmin(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can schedule classes");
        }
    }

    private ClassView view(ScheduledClass item, String userId) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM class_attendees WHERE class_id = ?", Integer.class, item.id());
        Integer joined = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM class_attendees WHERE class_id = ? AND user_id = ?", Integer.class, item.id(), userId);
        return new ClassView(item.id(), item.title(), item.description(), item.startTime(), item.durationMinutes(), item.meetingUrl(), count == null ? 0 : count, joined != null && joined > 0);
    }

    private record ScheduledClass(String id, String title, String description, LocalDateTime startTime, int durationMinutes, String meetingUrl, String createdBy) {}
    public record ClassView(String id, String title, String description, LocalDateTime startTime, int durationMinutes, String meetingUrl, int participantCount, boolean joined) {}
}
