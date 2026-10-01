class LiveClass {
  final String id;
  final String title;
  final String description;
  final DateTime startTime;
  final int durationMinutes;
  final String meetingUrl;
  final String createdBy;
  int participantCount;
  bool isJoined;

  LiveClass({
    required this.id,
    required this.title,
    required this.description,
    required this.startTime,
    required this.durationMinutes,
    required this.meetingUrl,
    required this.createdBy,
    this.participantCount = 0,
    this.isJoined = false,
  });

  factory LiveClass.fromJson(Map<String, dynamic> json) {
    DateTime parsedTime;
    try {
      parsedTime = DateTime.parse(json['startTime'] ?? json['start_time']);
    } catch (_) {
      parsedTime = DateTime.now().add(const Duration(hours: 2));
    }

    return LiveClass(
      id: json['id'] ?? 'c-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] ?? 'Live Masterclass',
      description: json['description'] ?? '',
      startTime: parsedTime,
      durationMinutes: json['durationMinutes'] ?? json['duration_minutes'] ?? 45,
      meetingUrl: json['meetingUrl'] ?? json['meeting_url'] ?? 'https://meet.google.com/nrityasana-live',
      createdBy: json['createdBy'] ?? json['created_by'] ?? 'admin@nrityasana.com',
      participantCount: json['participantCount'] ?? json['participant_count'] ?? 12,
      isJoined: json['isJoined'] ?? json['joined'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'startTime': startTime.toIso8601String(),
      'durationMinutes': durationMinutes,
      'meetingUrl': meetingUrl,
      'createdBy': createdBy,
      'participantCount': participantCount,
      'isJoined': isJoined,
    };
  }
}
