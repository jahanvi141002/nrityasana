class UserSession {
  final String userId;
  final String email;
  final String role; // 'ADMIN' or 'USER'
  final String token;
  final String? profilePictureUrl;
  final String? phone;
  final String? bio;
  final String? danceStyle;
  final String? experienceLevel;

  UserSession({
    required this.userId,
    required this.email,
    required this.role,
    required this.token,
    this.profilePictureUrl,
    this.phone,
    this.bio,
    this.danceStyle,
    this.experienceLevel,
  });

  bool get isAdmin => role.toUpperCase() == 'ADMIN';

  String get displayName {
    if (email.contains('@')) {
      final name = email.split('@')[0];
      return name[0].toUpperCase() + name.substring(1);
    }
    return email;
  }

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      userId: json['userId'] ?? json['id'] ?? 'u-user',
      email: json['email'] ?? 'practitioner@nrityasana.com',
      role: (json['role'] ?? 'USER').toString().toUpperCase(),
      token: json['token'] ?? '',
      profilePictureUrl: json['profilePictureUrl'] ?? json['photoURL'],
      phone: json['phone'],
      bio: json['bio'],
      danceStyle: json['danceStyle'] ?? 'Bharatanatyam',
      experienceLevel: json['experienceLevel'] ?? 'Intermediate',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'email': email,
      'role': role,
      'token': token,
      'profilePictureUrl': profilePictureUrl,
      'phone': phone,
      'bio': bio,
      'danceStyle': danceStyle,
      'experienceLevel': experienceLevel,
    };
  }
}
