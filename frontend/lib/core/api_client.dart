import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

class Practice {
  const Practice({
    required this.title,
    required this.discipline,
    required this.category,
    required this.minutes,
    required this.description,
    required this.icon,
  });

  final String title;
  final String discipline;
  final String category;
  final int minutes;
  final String description;
  final String icon;

  factory Practice.fromJson(Map<String, dynamic> json) => Practice(
        title: json['title'] as String,
        discipline: json['discipline'] as String,
        category: json['category'] as String,
        minutes: json['minutes'] as int,
        description: json['description'] as String,
        icon: json['icon'] as String,
      );
}

class ApiClient {
  const ApiClient({this.apiBaseUrl = 'http://localhost:8080/api'});

  final String apiBaseUrl;

  Future<AuthSession> register(String email, String password) => _authenticate('/auth/register', email, password);

  Future<AuthSession> login(String email, String password) => _authenticate('/auth/login', email, password);

  Future<AuthSession> loginWithGoogle(String idToken) async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/auth/google'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'idToken': idToken}),
    );
    return _sessionFromResponse(response);
  }

  Future<AuthSession> _authenticate(String path, String email, String password) async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl$path'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _sessionFromResponse(response);
  }

  AuthSession _sessionFromResponse(http.Response response) {
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(data['detail'] ?? data['message'] ?? 'Authentication failed');
    }
    return AuthSession.fromJson(data);
  }

  Future<List<Practice>> getPractices() async {
    final response = await http.get(Uri.parse('$apiBaseUrl/practices'));
    if (response.statusCode != 200) {
      throw Exception('Unable to load practices');
    }
    final data = jsonDecode(response.body) as List<dynamic>;
    return data.map((item) => Practice.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<MediaItem> uploadMedia({required AuthSession session, required XFile file}) async {
    final request = http.MultipartRequest('POST', Uri.parse('$apiBaseUrl/media/upload'))
      ..fields['userId'] = session.userId
      ..headers['Authorization'] = 'Bearer ${session.token}'
      ..files.add(http.MultipartFile.fromBytes('file', await file.readAsBytes(), filename: file.name));
    final response = await request.send();
    final body = await response.stream.bytesToString();
    final data = jsonDecode(body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(data['message'] ?? 'Unable to upload media');
    }
    return MediaItem.fromJson(data);
  }

  Future<List<MediaItem>> getMedia(AuthSession session) async {
    final response = await http.get(
      Uri.parse('$apiBaseUrl/media/${session.userId}'),
      headers: {'Authorization': 'Bearer ${session.token}'},
    );
    if (response.statusCode != 200) throw Exception('Unable to load your media');
    final data = jsonDecode(response.body) as List<dynamic>;
    return data.map((item) => MediaItem.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<String?> getProfilePicture(AuthSession session) async {
    final response = await http.get(
      Uri.parse('$apiBaseUrl/profile/${session.userId}'),
      headers: {'Authorization': 'Bearer ${session.token}'},
    );
    if (response.statusCode != 200) throw Exception('Unable to load profile');
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data['profilePictureUrl'] as String?;
  }

  Future<String> uploadProfilePicture({required AuthSession session, required XFile file}) async {
    final request = http.MultipartRequest('POST', Uri.parse('$apiBaseUrl/profile/${session.userId}/picture'))
      ..headers['Authorization'] = 'Bearer ${session.token}'
      ..files.add(http.MultipartFile.fromBytes('file', await file.readAsBytes(), filename: file.name));
    final response = await request.send();
    final body = await response.stream.bytesToString();
    final data = jsonDecode(body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) throw Exception(data['message'] ?? 'Unable to upload profile picture');
    return data['profilePictureUrl'] as String;
  }

  Future<List<ChatContact>> getChatContacts(AuthSession session) async {
    final response = await http.get(
      Uri.parse('$apiBaseUrl/chat/contacts?userId=${Uri.encodeQueryComponent(session.userId)}'),
      headers: {'Authorization': 'Bearer ${session.token}'},
    );
    if (response.statusCode != 200) throw Exception('Unable to load users');
    final data = jsonDecode(response.body) as List<dynamic>;
    return data.map((item) => ChatContact.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<ChatMessage>> getChatMessages(AuthSession session, {ChatContact? contact}) async {
    final response = await http.get(
      Uri.parse('$apiBaseUrl/chat/messages?userId=${Uri.encodeQueryComponent(session.userId)}${contact == null ? '' : '&withUserId=${Uri.encodeQueryComponent(contact.id)}'}'),
      headers: {'Authorization': 'Bearer ${session.token}'},
    );
    if (response.statusCode != 200) throw Exception('Unable to load chat');
    final data = jsonDecode(response.body) as List<dynamic>;
    return data.map((item) => ChatMessage.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<ChatMessage> sendChatMessage({required AuthSession session, required ChatContact contact, required String text}) async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/chat/messages'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${session.token}',
        'X-User-Id': session.userId,
        'X-User-Email': session.email,
        'X-User-Role': session.role,
        'X-Recipient-Id': contact.id,
        'X-Recipient-Email': contact.email,
      },
      body: jsonEncode({'text': text}),
    );
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) throw Exception(data['message'] ?? 'Unable to send message');
    return ChatMessage.fromJson(data);
  }

  Future<List<LiveClass>> getClasses(AuthSession session) async {
    final response = await http.get(
      Uri.parse('$apiBaseUrl/classes?userId=${Uri.encodeQueryComponent(session.userId)}'),
      headers: {'Authorization': 'Bearer ${session.token}'},
    );
    if (response.statusCode != 200) throw Exception('Unable to load live classes');
    final data = jsonDecode(response.body) as List<dynamic>;
    return data.map((item) => LiveClass.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<LiveClass> scheduleClass({required AuthSession session, required String title, required String description, required DateTime startTime, required int durationMinutes, required String meetingUrl}) async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/classes'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ${session.token}', 'X-User-Email': session.email},
      body: jsonEncode({'title': title, 'description': description, 'startTime': _localIso(startTime), 'durationMinutes': durationMinutes, 'meetingUrl': meetingUrl}),
    );
    return _classFromResponse(response);
  }

  Future<LiveClass> joinClass({required AuthSession session, required String classId}) async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/classes/$classId/join?userId=${Uri.encodeQueryComponent(session.userId)}'),
      headers: {'Authorization': 'Bearer ${session.token}'},
    );
    return _classFromResponse(response);
  }

  LiveClass _classFromResponse(http.Response response) {
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) throw Exception(data['message'] ?? 'Unable to update class');
    return LiveClass.fromJson(data);
  }

  String _localIso(DateTime value) => value.toIso8601String().split('.').first;
}

class AuthSession {
  const AuthSession({required this.token, required this.userId, required this.email, required this.role});

  final String token;
  final String userId;
  final String email;
  final String role;

  factory AuthSession.fromJson(Map<String, dynamic> json) => AuthSession(
        token: json['token'] as String,
        userId: json['userId'] as String,
        email: json['email'] as String,
        role: json['role'] as String? ?? 'USER',
      );
}

class MediaItem {
  const MediaItem({required this.id, required this.name, required this.type, required this.url});

  final String id;
  final String name;
  final String type;
  final String url;

  factory MediaItem.fromJson(Map<String, dynamic> json) => MediaItem(
        id: json['id'] as String,
        name: json['name'] as String,
        type: json['type'] as String,
        url: json['url'] as String,
      );
}

class LiveClass {
  const LiveClass({required this.id, required this.title, required this.description, required this.startTime, required this.durationMinutes, required this.meetingUrl, required this.participantCount, required this.joined});

  final String id;
  final String title;
  final String description;
  final DateTime startTime;
  final int durationMinutes;
  final String meetingUrl;
  final int participantCount;
  final bool joined;

  factory LiveClass.fromJson(Map<String, dynamic> json) => LiveClass(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String? ?? '',
        startTime: DateTime.parse(json['startTime'] as String),
        durationMinutes: json['durationMinutes'] as int,
        meetingUrl: json['meetingUrl'] as String,
        participantCount: json['participantCount'] as int,
        joined: json['joined'] as bool,
      );
}

class ChatMessage {
  const ChatMessage({required this.id, required this.senderId, required this.email, required this.role, required this.recipientId, required this.recipientEmail, required this.text, required this.sentAt});

  final String id;
  final String senderId;
  final String email;
  final String role;
  final String recipientId;
  final String recipientEmail;
  final String text;
  final DateTime sentAt;

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
        id: json['id'] as String,
        senderId: json['senderId'] as String? ?? json['userId'] as String,
        email: json['email'] as String,
        role: json['role'] as String,
        recipientId: json['recipientId'] as String? ?? '',
        recipientEmail: json['recipientEmail'] as String? ?? '',
        text: json['text'] as String,
        sentAt: DateTime.parse(json['sentAt'] as String),
      );
}

    class ChatContact {
      const ChatContact({required this.id, required this.email, required this.role});

      final String id;
      final String email;
      final String role;

      factory ChatContact.fromJson(Map<String, dynamic> json) => ChatContact(
        id: json['id'] as String,
        email: json['email'] as String,
        role: json['role'] as String,
      );
    }
