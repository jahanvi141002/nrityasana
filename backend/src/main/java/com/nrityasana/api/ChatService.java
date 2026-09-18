package com.nrityasana.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ChatService {
    private final JdbcTemplate jdbcTemplate;

    public ChatService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ChatMessage> messages(String currentUserId, String otherUserId) {
        String sql = "SELECT id, sender_id, sender_email, sender_role, recipient_id, recipient_email, message_text, sent_at FROM chat_messages WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?) ORDER BY sent_at";
        if (otherUserId == null || otherUserId.isBlank()) return List.of();
        return jdbcTemplate.query(sql, (rs, rowNum) -> new ChatMessage(rs.getString("id"), rs.getString("sender_id"), rs.getString("sender_email"), rs.getString("sender_role"), rs.getString("recipient_id"), rs.getString("recipient_email"), rs.getString("message_text"), rs.getTimestamp("sent_at").toInstant()), currentUserId, otherUserId, otherUserId, currentUserId);
    }

    public ChatMessage send(String userId, String email, String role, String recipientId, String recipientEmail, String text) {
        if (userId == null || userId.isBlank() || email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to use chat");
        }
        if (text == null || text.isBlank() || text.trim().length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message must be between 1 and 500 characters");
        }
        if (recipientId == null || recipientId.isBlank() || recipientEmail == null || recipientEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a user to message");
        }
        ChatMessage message = new ChatMessage(UUID.randomUUID().toString(), userId, email, "ADMIN".equals(role) ? "ADMIN" : "USER", recipientId, recipientEmail, text.trim(), Instant.now());
        jdbcTemplate.update("INSERT INTO chat_messages (id, sender_id, sender_email, sender_role, recipient_id, recipient_email, message_text, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", message.id(), message.senderId(), message.email(), message.role(), message.recipientId(), message.recipientEmail(), message.text(), java.sql.Timestamp.from(message.sentAt()));
        return message;
    }

    public ChatMessage receive(String userId, String email, String text) {
        if (text == null || text.isBlank() || text.trim().length() > 500) return null;
        ChatMessage message = new ChatMessage(UUID.randomUUID().toString(), userId, email, "USER", "whatsapp", "WhatsApp", text.trim(), Instant.now());
        jdbcTemplate.update("INSERT INTO chat_messages (id, sender_id, sender_email, sender_role, recipient_id, recipient_email, message_text, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", message.id(), message.senderId(), message.email(), message.role(), message.recipientId(), message.recipientEmail(), message.text(), java.sql.Timestamp.from(message.sentAt()));
        return message;
    }

    public record ChatMessage(String id, String senderId, String email, String role, String recipientId, String recipientEmail, String text, Instant sentAt) {}
}
