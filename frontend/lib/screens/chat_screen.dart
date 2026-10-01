import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/user_session.dart';
import '../models/chat_message.dart';
import '../services/api_service.dart';
import '../theme.dart';

class ChatScreen extends StatefulWidget {
  final UserSession session;

  const ChatScreen({Key? key, required this.session}) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  List<ChatMessage> _messages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  Future<void> _loadMessages() async {
    final list = await ApiService.getMessages();
    if (mounted) {
      setState(() {
        _messages = list;
        _isLoading = false;
      });
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    _messageController.clear();
    final newMsg = ChatMessage(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      senderId: widget.session.userId,
      senderEmail: widget.session.email,
      senderRole: widget.session.role,
      recipientId: 'u-guru',
      recipientEmail: 'guru.radhika@nrityasana.com',
      text: text,
      sentAt: DateTime.now(),
    );

    setState(() => _messages.add(newMsg));
    await ApiService.sendMessage(newMsg);

    // Simulated Guru Reply
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (!mounted) return;
      final reply = ChatMessage(
        id: 'reply-${DateTime.now().millisecondsSinceEpoch}',
        senderId: 'u-guru',
        senderEmail: 'guru.radhika@nrityasana.com',
        senderRole: 'ADMIN',
        recipientId: widget.session.userId,
        recipientEmail: widget.session.email,
        text: _generateReply(text),
        sentAt: DateTime.now(),
        isFromWhatsApp: true,
      );
      setState(() => _messages.add(reply));
    });
  }

  String _generateReply(String userText) {
    final lower = userText.toLowerCase();
    if (lower.contains('aramandi') || lower.contains('knee') || lower.contains('posture')) {
      return 'Maintain equal weight balance on both heels. Soften your breath and engage the pelvic floor.';
    }
    if (lower.contains('class') || lower.contains('live') || lower.contains('time')) {
      return 'The live session begins promptly! Join directly using the Google Meet link in the Live tab.';
    }
    return 'Namaste! Dedication to practice is sacred. Keep your focus centered in each movement.';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Guru Status Header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: AppTheme.cardBorder)),
          ),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: AppTheme.primary,
                radius: 20,
                child: const Text('G', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Guru Radhika & Sangha Mentors',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textMain),
                    ),
                    Text(
                      'Available for posture reviews & practice guidance',
                      style: TextStyle(color: AppTheme.accentGreen, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF25D366).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.chat_bubble_outline, color: Color(0xFF25D366), size: 14),
                    SizedBox(width: 4),
                    Text(
                      'WhatsApp Cloud API',
                      style: TextStyle(color: Color(0xFF25D366), fontWeight: FontWeight.bold, fontSize: 10),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Message List
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length,
                  itemBuilder: (context, idx) {
                    final msg = _messages[idx];
                    final isMe = msg.senderEmail == widget.session.email || msg.senderId == widget.session.userId;
                    final timeStr = DateFormat('h:mm a').format(msg.sentAt);

                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: isMe ? AppTheme.primaryDark : Colors.white,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(18),
                            topRight: const Radius.circular(18),
                            bottomLeft: isMe ? const Radius.circular(18) : Radius.zero,
                            bottomRight: isMe ? Radius.zero : const Radius.circular(18),
                          ),
                          border: isMe ? null : Border.all(color: AppTheme.cardBorder),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.03),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            Text(
                              msg.text,
                              style: TextStyle(
                                color: isMe ? Colors.white : AppTheme.textMain,
                                fontSize: 14,
                                height: 1.3,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (msg.isFromWhatsApp) ...[
                                  const Icon(Icons.verified, size: 12, color: Color(0xFF25D366)),
                                  const SizedBox(width: 4),
                                ],
                                Text(
                                  timeStr,
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: isMe ? Colors.white.withOpacity(0.7) : AppTheme.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),

        // Bottom Input Field
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: AppTheme.cardBorder)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  onSubmitted: (_) => _sendMessage(),
                  decoration: InputDecoration(
                    hintText: 'Ask Guru about postures, talas, rhythm...',
                    hintStyle: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
                    filled: true,
                    fillColor: const Color(0xFFFAF3F0),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: _sendMessage,
                icon: const Icon(Icons.send_rounded, color: AppTheme.primaryDark),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
