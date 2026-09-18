package com.nrityasana.api;

import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/whatsapp/webhook")
@CrossOrigin(origins = "*")
public class WhatsAppController {
    private final WhatsAppService whatsAppService;

    public WhatsAppController(WhatsAppService whatsAppService) {
        this.whatsAppService = whatsAppService;
    }

    @GetMapping
    public ResponseEntity<String> verify(
        @RequestParam(name = "hub.mode", required = false) String mode,
        @RequestParam(name = "hub.verify_token", required = false) String verifyToken,
        @RequestParam(name = "hub.challenge", required = false) String challenge
    ) {
        if ("subscribe".equals(mode) && whatsAppService.verifyWebhook(verifyToken)) {
            return ResponseEntity.ok(challenge == null ? "" : challenge);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Webhook verification failed");
    }

    @PostMapping
    public ResponseEntity<Void> receive(
        @RequestHeader(name = "X-Hub-Signature-256", required = false) String signature,
        @RequestBody byte[] rawPayload
    ) throws Exception {
        if (!whatsAppService.verifySignature(signature, rawPayload)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        JsonNode payload = new com.fasterxml.jackson.databind.ObjectMapper().readTree(rawPayload);
        whatsAppService.receiveWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
