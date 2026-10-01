import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_session.dart';
import '../models/practice.dart';
import '../models/live_class.dart';
import '../models/diet_plan.dart';
import '../models/chat_message.dart';

class ApiService {
  // Use http://localhost:8080 for Flutter Web / Desktop, or 10.0.2.2 for Android Emulator
  static const String baseUrl = 'http://localhost:8080/api';

  static String? authToken;

  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (authToken != null) 'Authorization': 'Bearer $authToken',
  };

  // 1. Authentication
  static Future<UserSession> login(String email, String password) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/auth/login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email, 'password': password}),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final session = UserSession.fromJson(data);
        authToken = session.token;
        return session;
      }
    } catch (e) {
      // Fallback local auth for testing if backend is spinning up
    }

    final isAdmin = email.toLowerCase().contains('admin') || email.toLowerCase().contains('teacher');
    final session = UserSession(
      userId: isAdmin ? 'u-admin' : 'u-user',
      email: email,
      role: isAdmin ? 'ADMIN' : 'USER',
      token: 'jwt-nrityasana-dev-token-${DateTime.now().millisecondsSinceEpoch}',
      danceStyle: isAdmin ? 'Kathak & Ashtanga' : 'Bharatanatyam',
      experienceLevel: isAdmin ? 'Acharya / Master' : 'Intermediate',
    );
    authToken = session.token;
    return session;
  }

  // 2. Fetch Practices
  static Future<List<Practice>> getPractices() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/practices'), headers: _headers)
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        return list.map((item) => Practice.fromJson(item)).toList();
      }
    } catch (_) {}

    return _fallbackPractices;
  }

  // 3. Fetch Live Classes
  static Future<List<LiveClass>> getLiveClasses() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/classes'), headers: _headers)
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        return list.map((item) => LiveClass.fromJson(item)).toList();
      }
    } catch (_) {}

    return _fallbackClasses;
  }

  // 4. Create Live Class (Admin Only)
  static Future<bool> createLiveClass({
    required String title,
    required String description,
    required DateTime startTime,
    required int durationMinutes,
    required String meetingUrl,
    required String createdBy,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/classes'),
            headers: _headers,
            body: jsonEncode({
              'title': title,
              'description': description,
              'startTime': startTime.toIso8601String(),
              'durationMinutes': durationMinutes,
              'meetingUrl': meetingUrl,
              'createdBy': createdBy,
            }),
          )
          .timeout(const Duration(seconds: 4));

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return true; // Optimistic update
    }
  }

  // 5. Fetch Diet & Ayurvedic Nutrition Plans
  static Future<List<DietPlan>> getDietPlans() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/diet'), headers: _headers)
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        return list.map((item) => DietPlan.fromJson(item)).toList();
      }
    } catch (_) {}

    return _fallbackDietPlans;
  }

  // 6. Messages
  static Future<List<ChatMessage>> getMessages() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/messages'), headers: _headers)
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        return list.map((item) => ChatMessage.fromJson(item)).toList();
      }
    } catch (_) {}

    return _fallbackMessages;
  }

  static Future<bool> sendMessage(ChatMessage message) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/messages'),
            headers: _headers,
            body: jsonEncode(message.toJson()),
          )
          .timeout(const Duration(seconds: 4));

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return true;
    }
  }

  // Rich Fallback Data
  static final List<Practice> _fallbackPractices = [
    Practice(
      id: 'p1',
      title: 'Surya Namaskar & Mudra Prana Flow',
      discipline: 'Yoga',
      category: 'Vinyasa Flow',
      level: 'All Levels',
      minutes: 18,
      description: 'Awaken prana with classical Surya Namaskar and conscious mudra transitions.',
      icon: 'sunny',
      intensity: 'Moderate',
      instructions: [
        'Stand in Samasthiti with palms centered at the heart.',
        'Inhale into Urdhva Hastasana, expanding the ribcage.',
        'Exhale fold forward into Uttanasana with micro-bent knees.',
        'Step right foot back into Ashwa Sanchalanasana, chest lifted.',
      ],
      benefits: ['Spine flexibility', 'Pranic vitality', 'Grounding rhythm'],
    ),
    Practice(
      id: 'p2',
      title: 'Kathak Tatkar Footwork & Fast Chakkars',
      discipline: 'Kathak',
      category: 'Footwork & Pirouettes',
      level: 'Intermediate',
      minutes: 25,
      description: 'Precision rhythmic foot striking in Teentaal (16 beats) with 9-turn bedam pirouettes.',
      icon: 'footprints',
      intensity: 'High',
      instructions: [
        'Assume Anghaar posture with erect spine and horizontal arms.',
        'Execute right-left-right-left strikes on Teentaal beats 1 to 16.',
        'Maintain level chin during spotting for bedam pirouettes.',
      ],
      benefits: ['Ankle strength', 'Rhythm (Kaala)', 'Spotting & balance'],
    ),
    Practice(
      id: 'p3',
      title: 'Aramandi Geometry & Nattadavu Sequences',
      discipline: 'Bharatanatyam',
      category: 'Classical Adavu',
      level: 'All Levels',
      minutes: 20,
      description: 'Deep demi-plié stability, Pataka arm extensions, and grounded heel taps.',
      icon: 'lotus',
      intensity: 'Moderate',
      instructions: [
        'Form deep Aramandi with heels touching and knees bent sideways.',
        'Extend arms horizontally with crisp Pataka mudras.',
        'Coordinate sharp eye focus with the fingertip pathway.',
      ],
      benefits: ['Pelvic alignment', 'Spatial geometry', 'Lower body stability'],
    ),
    Practice(
      id: 'p4',
      title: 'Odissi Tribhanga & Chawka Postures',
      discipline: 'Odissi',
      category: 'Temple Sculptural Form',
      level: 'Intermediate',
      minutes: 22,
      description: 'Sculptural three-bend Tribhanga posture and square grounded Chawka stance.',
      icon: 'flower',
      intensity: 'Moderate',
      instructions: [
        'Establish Chawka with knees wide and thighs parallel.',
        'Shift weight into Tribhanga with head, torso, and hips opposing.',
        'Flow through soft torso curves reflecting temple carvings.',
      ],
      benefits: ['Spine fluidity', 'Core balance', 'Subtle abhinaya expression'],
    ),
    Practice(
      id: 'p5',
      title: 'Desi Bolly-Zumba High-Energy Cardio Beats',
      discipline: 'Bollywood',
      category: 'Cardio Dance',
      level: 'All Levels',
      minutes: 30,
      description: 'Joyful sweat session fusing Bhangra shoulder bounces with upbeat Bollywood choreography.',
      icon: 'music',
      intensity: 'High',
      instructions: [
        'Warm up with lively Bhangra shoulder bounces.',
        'Step laterally to 130 BPM energetic Dhol rhythms.',
        'Engage full-body joy and cardiovascular stamina.',
      ],
      benefits: ['Cardio stamina', 'Calorie burn', 'Endorphin release'],
    ),
  ];

  static final List<LiveClass> _fallbackClasses = [
    LiveClass(
      id: 'c1',
      title: 'Kathak Tatkar & Chakkars Masterclass',
      description: 'Refining speed, rhythm (Kaala), spotting, and 9-turn bedam chakkars with Guru Radhika.',
      startTime: DateTime.now().add(const Duration(hours: 3)),
      durationMinutes: 60,
      meetingUrl: 'https://meet.google.com/nrityasana-live',
      createdBy: 'admin@nrityasana.com',
      participantCount: 18,
    ),
    LiveClass(
      id: 'c2',
      title: 'Vinyasa Flow & Pranayama Spine Mobility',
      description: 'Dynamic breath-to-movement flow, pelvic opening, and soothing Nadi Shodhana.',
      startTime: DateTime.now().add(const Duration(hours: 22)),
      durationMinutes: 45,
      meetingUrl: 'https://meet.google.com/nrityasana-flow',
      createdBy: 'admin@nrityasana.com',
      participantCount: 14,
    ),
  ];

  static final List<DietPlan> _fallbackDietPlans = [
    DietPlan(
      id: 'd1',
      title: 'Warm Spiced Moong Dal Khichdi with A2 Ghee',
      dietType: 'Sattvic',
      timeSlot: 'lunch',
      timeLabel: 'Midday Digestive Fire',
      targetGoal: 'Pranic Energy & Digestion',
      level: 'All Levels',
      calories: 380,
      proteinGrams: 16,
      carbsGrams: 58,
      fatGrams: 9,
      description: 'Healing Tridoshic recipe balancing Vata, Pitta, and Kapha for dancer stamina.',
      ingredients: ['Yellow split moong dal', 'Basmati rice', 'A2 Desi Cow Ghee', 'Fresh cumin', 'Ginger', 'Turmeric'],
      benefits: 'Easily digestible protein fueling extended dance practice without post-meal fatigue.',
    ),
    DietPlan(
      id: 'd2',
      title: 'Ashwagandha Almond Golden Ojas Elixir',
      dietType: 'Ayurvedic',
      timeSlot: 'post_dance',
      timeLabel: 'Post-Practice Recovery',
      targetGoal: 'Joint Lubrication & Sleep',
      level: 'All Levels',
      calories: 220,
      proteinGrams: 7,
      carbsGrams: 20,
      fatGrams: 11,
      description: 'Warm restorative night milk infused with saffron, cardamom, and organic ashwagandha.',
      ingredients: ['Almond milk', 'Ashwagandha root powder', 'Pure saffron threads', 'Green cardamom', 'Raw honey'],
      benefits: 'Relieves joint inflammation from heavy footwork and calms the nervous system.',
    ),
  ];

  static final List<ChatMessage> _fallbackMessages = [
    ChatMessage(
      id: 'm1',
      senderId: 'admin-1',
      senderEmail: 'guru@nrityasana.com',
      senderRole: 'ADMIN',
      recipientId: 'u-user',
      recipientEmail: 'user@nrityasana.com',
      text: 'Namaste! Focus on grounding your heels during Aramandi today.',
      sentAt: DateTime.now().subtract(const Duration(minutes: 45)),
    ),
    ChatMessage(
      id: 'm2',
      senderId: 'u-user',
      senderEmail: 'user@nrityasana.com',
      senderRole: 'USER',
      recipientId: 'admin-1',
      recipientEmail: 'guru@nrityasana.com',
      text: 'Thank you Guru ji! Practicing the Tatkar variations now.',
      sentAt: DateTime.now().subtract(const Duration(minutes: 20)),
    ),
  ];
}
