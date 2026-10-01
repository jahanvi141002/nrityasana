class Practice {
  final String id;
  final String title;
  final String discipline; // 'Yoga', 'Kathak', 'Bharatanatyam', 'Odissi', 'Bollywood', 'Zumba', 'Meditation'
  final String category;
  final String level;
  final int minutes;
  final String description;
  final String icon;
  final String intensity;
  final List<String> instructions;
  final List<String> benefits;

  Practice({
    required this.id,
    required this.title,
    required this.discipline,
    required this.category,
    required this.level,
    required this.minutes,
    required this.description,
    required this.icon,
    this.intensity = 'Moderate',
    this.instructions = const [],
    this.benefits = const [],
  });

  factory Practice.fromJson(Map<String, dynamic> json) {
    List<String> parseList(dynamic val) {
      if (val == null) return [];
      if (val is List) return val.map((e) => e.toString()).toList();
      return [];
    }

    return Practice(
      id: json['id'] ?? 'p-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] ?? 'Movement Practice',
      discipline: json['discipline'] ?? 'Yoga',
      category: json['category'] ?? 'General',
      level: json['level'] ?? 'All Levels',
      minutes: (json['minutes'] is int)
          ? json['minutes']
          : int.tryParse(json['minutes'].toString()) ?? 15,
      description: json['description'] ?? '',
      icon: json['icon'] ?? 'sunny',
      intensity: json['intensity'] ?? 'Moderate',
      instructions: parseList(json['instructions']),
      benefits: parseList(json['benefits']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'discipline': discipline,
      'category': category,
      'level': level,
      'minutes': minutes,
      'description': description,
      'icon': icon,
      'intensity': intensity,
      'instructions': instructions,
      'benefits': benefits,
    };
  }
}
