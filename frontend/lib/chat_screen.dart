import 'dart:async';

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'core/api_client.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key, required this.session});

  final AuthSession session;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _apiClient = const ApiClient();
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _refreshTimer;
  List<ChatContact> _contacts = [];
  List<ChatMessage> _messages = [];
  ChatContact? _selectedContact;
  bool _isLoading = true;
  bool _isSending = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadContacts();
    _refreshTimer = Timer.periodic(const Duration(seconds: 5), (_) => _selectedContact == null ? _loadContacts(silent: true) : _loadThread(silent: true));
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadContacts({bool silent = false}) async {
    if (!silent && mounted) setState(() => _isLoading = true);
    try {
      final contacts = await _apiClient.getChatContacts(widget.session);
      if (mounted) setState(() => _contacts = contacts);
    } catch (error) {
      if (mounted && !silent) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted && !silent) setState(() => _isLoading = false);
    }
  }

  Future<void> _openThread(ChatContact contact) async {
    setState(() {
      _selectedContact = contact;
      _messages = [];
      _isLoading = true;
      _error = null;
    });
    await _loadThread();
  }

  Future<void> _loadThread({bool silent = false}) async {
    final contact = _selectedContact;
    if (contact == null) return;
    if (!silent && mounted) setState(() => _isLoading = true);
    try {
      final messages = await _apiClient.getChatMessages(widget.session, contact: contact);
      if (mounted) setState(() => _messages = messages);
      if (!silent) _scrollToBottom();
    } catch (error) {
      if (mounted && !silent) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted && !silent) setState(() => _isLoading = false);
    }
  }

  Future<void> _send() async {
    final contact = _selectedContact;
    final text = _messageController.text.trim();
    if (contact == null || text.isEmpty || _isSending) return;
    setState(() {
      _isSending = true;
      _error = null;
    });
    try {
      final message = await _apiClient.sendChatMessage(session: widget.session, contact: contact, text: text);
      if (mounted) {
        setState(() {
          _messages = [..._messages, message];
          _messageController.clear();
        });
        _scrollToBottom();
      }
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) _scrollController.animateTo(_scrollController.position.maxScrollExtent, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
    });
  }

  Future<void> _openWhatsApp() async {
    const phoneNumber = String.fromEnvironment('WHATSAPP_NUMBER');
    final uri = Uri.https('wa.me', phoneNumber.isEmpty ? '/' : '/$phoneNumber', {'text': 'Join me in the Nrityasana community.'});
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication) && mounted) setState(() => _error = 'WhatsApp could not be opened');
  }

  @override
  Widget build(BuildContext context) => _selectedContact == null ? _buildContacts() : _buildThread(_selectedContact!);

  Widget _buildContacts() {
    return Column(children: [
      _topBar('Chats', subtitle: '${_contacts.length} people in Nrityasana'),
      if (_error != null) _errorText(),
      Expanded(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _contacts.isEmpty
                ? const Center(child: Text('No other users yet. Invite someone to join.'))
                : RefreshIndicator(onRefresh: _loadContacts, child: ListView.separated(padding: const EdgeInsets.only(top: 8), itemCount: _contacts.length, separatorBuilder: (_, __) => const Divider(height: 1, indent: 82), itemBuilder: (context, index) => _contactTile(_contacts[index]))),
      ),
    ]);
  }

  Widget _contactTile(ChatContact contact) {
    final name = contact.email.split('@').first;
    final initial = name.substring(0, 1).toUpperCase();
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 7),
      leading: CircleAvatar(radius: 27, backgroundColor: contact.role == 'ADMIN' ? const Color(0xFFD9A28C) : const Color(0xFFB8D9D0), child: Text(initial, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF075E54)))),
      title: Row(children: [Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w600))), if (contact.role == 'ADMIN') const Text('ADMIN', style: TextStyle(fontSize: 9, letterSpacing: 1, fontWeight: FontWeight.bold, color: Color(0xFFB8543F)))]),
      subtitle: Text(contact.email, maxLines: 1, overflow: TextOverflow.ellipsis),
      trailing: const Icon(Icons.chevron_right, color: Color(0xFF667781)),
      onTap: () => _openThread(contact),
    );
  }

  Widget _buildThread(ChatContact contact) {
    return Column(
      children: [
        Container(
          color: const Color(0xFF075E54),
          padding: const EdgeInsets.fromLTRB(4, 16, 10, 14),
          child: Row(children: [
            IconButton(onPressed: () => setState(() => _selectedContact = null), icon: const Icon(Icons.arrow_back, color: Colors.white), tooltip: 'Back to chats'),
            CircleAvatar(radius: 21, backgroundColor: contact.role == 'ADMIN' ? const Color(0xFFD9A28C) : const Color(0xFFB8D9D0), child: Text(contact.email.substring(0, 1).toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF075E54)))),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(contact.email.split('@').first, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)), Text(contact.role == 'ADMIN' ? 'Admin account' : 'Member account', style: const TextStyle(color: Color(0xFFD8F3EE), fontSize: 12))])),
            IconButton(onPressed: _openWhatsApp, icon: const Icon(Icons.open_in_new, color: Colors.white), tooltip: 'Open WhatsApp'),
          ]),
        ),
        if (_error != null) _errorText(),
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : Container(
                  color: const Color(0xFFECE5DD),
                  child: _messages.isEmpty
                      ? const Center(child: Text('Start the conversation.'))
                      : ListView.builder(controller: _scrollController, padding: const EdgeInsets.fromLTRB(14, 18, 14, 16), itemCount: _messages.length, itemBuilder: (context, index) => _messageBubble(_messages[index])),
                ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 12),
            child: Row(children: [
              Expanded(child: TextField(controller: _messageController, maxLength: 500, textInputAction: TextInputAction.send, onSubmitted: (_) => _send(), decoration: InputDecoration(hintText: 'Message', counterText: '', filled: true, fillColor: const Color(0xFFF7F1E9), prefixIcon: const Icon(Icons.emoji_emotions_outlined), border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none)))),
              const SizedBox(width: 8),
              IconButton.filled(onPressed: _isSending ? null : _send, style: IconButton.styleFrom(backgroundColor: const Color(0xFF128C7E)), icon: _isSending ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.send), tooltip: 'Send message'),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _topBar(String title, {required String subtitle}) => Container(
        color: const Color(0xFF075E54),
        padding: const EdgeInsets.fromLTRB(18, 22, 12, 18),
        child: Row(
          children: [
            const CircleAvatar(radius: 22, backgroundColor: Color(0xFF128C7E), child: Icon(Icons.chat, color: Color(0xFFF6D4A7))),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 3),
                  Text(subtitle, style: const TextStyle(color: Color(0xFFD8F3EE), fontSize: 12)),
                ],
              ),
            ),
            IconButton(onPressed: _openWhatsApp, icon: const Icon(Icons.open_in_new, color: Colors.white), tooltip: 'Open WhatsApp'),
            IconButton(onPressed: () => _loadContacts(), icon: const Icon(Icons.refresh, color: Colors.white), tooltip: 'Refresh users'),
          ],
        ),
      );

  Widget _errorText() => Padding(padding: const EdgeInsets.fromLTRB(18, 10, 18, 0), child: Align(alignment: Alignment.centerLeft, child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error))));

  Widget _messageBubble(ChatMessage message) {
    final mine = message.senderId == widget.session.userId;
    return Align(
      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 330),
        margin: const EdgeInsets.only(bottom: 7),
        padding: const EdgeInsets.fromLTRB(12, 8, 10, 7),
        decoration: BoxDecoration(
          color: mine ? const Color(0xFFD9FDD3) : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(8),
            topRight: const Radius.circular(8),
            bottomLeft: Radius.circular(mine ? 8 : 2),
            bottomRight: Radius.circular(mine ? 2 : 8),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Flexible(child: Text(message.text, style: const TextStyle(color: Color(0xFF303030)))),
            const SizedBox(width: 8),
            Text(_formatTime(message.sentAt), style: const TextStyle(fontSize: 10, color: Color(0xFF667781))),
            if (mine) const Padding(padding: EdgeInsets.only(left: 3), child: Icon(Icons.done_all, size: 15, color: Color(0xFF53BDEB))),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime value) => '${value.hour.toString().padLeft(2, '0')}:${value.minute.toString().padLeft(2, '0')}';
}
