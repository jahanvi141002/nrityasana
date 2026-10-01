class ChatMessage {
  final String id;
  final String senderId;
  final String senderEmail;
  final String senderRole;
  final String recipientId;
  final String recipientEmail;
  final String text;
  final DateTime sentAt;
  final bool isFromWhatsApp;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.senderEmail,
    required this.senderRole,
    required this.recipientId,
    required this.recipientEmail,
    required this.text,
    required this.sentAt,
    this.isFromWhatsApp = false,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    DateTime parsedTime;
    try {
      parsedTime = DateTime.parse(json['sentAt'] ?? json['sent_at']);
    } catch (_) {
      parsedTime = DateTime.now();
    }

    return ChatMessage(
      id: json['id'] ?? 'msg-${DateTime.now().millisecondsSinceEpoch}',
      senderId: json['senderId'] ?? json['sender_id'] ?? 'u-admin',
      senderEmail: json['senderEmail'] ?? json['sender_email'] ?? 'guru@nrityasana.com',
      senderRole: json['senderRole'] ?? json['sender_role'] ?? 'ADMIN',
      recipientId: json['recipientId'] ?? json['recipient_id'] ?? 'u-user',
      recipientEmail: json['recipientEmail'] ?? json['recipient_email'] ?? 'user@nrityasana.com',
      text: json['text'] ?? json['message_text'] ?? '',
      sentAt: parsedTime,
      isFromWhatsApp: json['fromWhatsApp'] ?? json['from_whatsapp'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'senderEmail': senderEmail,
      'senderRole': senderRole,
      'recipientId': recipientId,
      'recipientEmail': recipientEmail,
      'text': text,
      'sentAt': sentAt.toIso8601String(),
      'fromWhatsApp': isFromWhatsApp,
    };
  }
}
