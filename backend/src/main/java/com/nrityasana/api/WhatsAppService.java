package com.nrityasana.api;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class WhatsAppService {
    private final RestClient restClient = RestClient.create();
    private final ChatService chatService;
    private final String accessToken;
    private final String phoneNumberId;
    private final String verifyToken;
    private final String appSecret;
    private final String graphApiVersion;
    private final String defaultRecipient;

    public WhatsAppService(
        ChatService chatService,
        @Value("${app.whatsapp.access-token:}") String accessToken,
        @Value("${app.whatsapp.phone-number-id:}") String phoneNumberId,
        @Value("${app.whatsapp.verify-token:}") String verifyToken,
        @Value("${app.whatsapp.app-secret:}") String appSecret,
        @Value("${app.whatsapp.graph-api-version:v21.0}") String graphApiVersion,
        @Value("${app.whatsapp.default-recipient:}") String defaultRecipient
    ) {
        this.chatService = chatService;
        this.accessToken = accessToken;
        this.phoneNumberId = phoneNumberId;
        this.verifyToken = verifyToken;
        this.appSecret = appSecret;
        this.graphApiVersion = graphApiVersion;
        this.defaultRecipient = defaultRecipient;
    }

    public boolean isConfigured() {
        return !accessToken.isBlank() && !phoneNumberId.isBlank();
    }

    public boolean verifyWebhook(String suppliedToken) {
        return !verifyToken.isBlank() && MessageDigest.isEqual(verifyToken.getBytes(StandardCharsets.UTF_8), (suppliedToken == null ? "" : suppliedToken).getBytes(StandardCharsets.UTF_8));
    }

    public boolean verifySignature(String signature, byte[] payload) {
        if (appSecret.isBlank()) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(appSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expected = "sha256=" + HexFormat.of().formatHex(mac.doFinal(payload));
            return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), (signature == null ? "" : signature).getBytes(StandardCharsets.UTF_8));
        } catch (Exception exception) {
            return false;
        }
    }

    public void sendText(String text) {
        if (!isConfigured() || defaultRecipient.isBlank()) return;
        restClient.post()
            .uri("https://graph.facebook.com/{version}/{phoneNumberId}/messages", graphApiVersion, phoneNumberId)
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
            .contentType(MediaType.APPLICATION_JSON)
            .body(java.util.Map.of(
                "messaging_product", "whatsapp",
                "to", defaultRecipient,
                "type", "text",
                "text", java.util.Map.of("preview_url", false, "body", text)
            ))
            .retrieve()
            .toBodilessEntity();
    }

    public void receiveWebhook(JsonNode payload) {
        JsonNode messages = payload.at("/entry/0/changes/0/value/messages");
        if (!messages.isArray()) return;
        for (JsonNode message : messages) {
            if (!"text".equals(message.path("type").asText())) continue;
            String sender = message.path("from").asText();
            String text = message.path("text/body").asText();
            if (!sender.isBlank() && !text.isBlank()) {
                chatService.receive("whatsapp:" + sender, "WhatsApp " + sender, text);
            }
        }
    }
}
