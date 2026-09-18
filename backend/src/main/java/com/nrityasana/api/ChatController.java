package com.nrityasana.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/chat")
    @CrossOrigin(origins = "*")
    @Validated
public class ChatController {
    private final ChatService chatService;
    private final WhatsAppService whatsAppService;
    private final AuthService authService;

    public ChatController(ChatService chatService, WhatsAppService whatsAppService, AuthService authService) {
        this.chatService = chatService;
        this.whatsAppService = whatsAppService;
        this.authService = authService;
    }

    @GetMapping("/contacts")
    public java.util.List<AuthService.UserSummary> contacts(@RequestParam @NotBlank @Size(max = 100) String userId) {
        return authService.directory(userId);
    }

    @GetMapping("/messages")
    public java.util.List<ChatService.ChatMessage> messages(@RequestParam @NotBlank @Size(max = 100) String userId, @RequestParam(required = false) @Size(max = 100) String withUserId) {
        return chatService.messages(userId, withUserId);
    }

    @PostMapping("/messages")
    public ChatService.ChatMessage send(
        @RequestHeader("X-User-Id") @NotBlank @Size(max = 100) String userId,
        @RequestHeader("X-User-Email") @NotBlank @Size(max = 254) @jakarta.validation.constraints.Email String email,
        @RequestHeader(value = "X-User-Role", defaultValue = "USER") @NotBlank @Size(max = 20) String role,
        @RequestHeader("X-Recipient-Id") @NotBlank @Size(max = 100) String recipientId,
        @RequestHeader("X-Recipient-Email") @NotBlank @Size(max = 254) @jakarta.validation.constraints.Email String recipientEmail,
        @Valid @RequestBody MessageRequest request
    ) {
        ChatService.ChatMessage message = chatService.send(userId, email, role, recipientId, recipientEmail, request.text());
        whatsAppService.sendText(email + ": " + request.text());
        return message;
    }

    public record MessageRequest(@NotBlank @Size(max = 500) String text) {}
}
