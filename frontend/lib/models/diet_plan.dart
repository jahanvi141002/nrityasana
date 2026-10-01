class DietPlan {
  final String id;
  final String title;
  final String dietType; // 'Sattvic', 'Rajasic', 'Ayurvedic', 'Pranic'
  final String timeSlot; // 'breakfast', 'lunch', 'dinner', 'post_dance'
  final String timeLabel;
  final String targetGoal;
  final String level;
  final int calories;
  final int proteinGrams;
  final int carbsGrams;
  final int fatGrams;
  final String description;
  final List<String> ingredients;
  final List<String> preparationInstructions;
  final String benefits;

  DietPlan({
    required this.id,
    required this.title,
    required this.dietType,
    required this.timeSlot,
    required this.timeLabel,
    required this.targetGoal,
    required this.level,
    required this.calories,
    required this.proteinGrams,
    required this.carbsGrams,
    required this.fatGrams,
    required this.description,
    this.ingredients = const [],
    this.preparationInstructions = const [],
    this.benefits = '',
  });

  factory DietPlan.fromJson(Map<String, dynamic> json) {
    List<String> parseList(dynamic val) {
      if (val == null) return [];
      if (val is List) return val.map((e) => e.toString()).toList();
      return [];
    }

    return DietPlan(
      id: json['id'] ?? 'd-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] ?? 'Ayurvedic Nutritional Meal',
      dietType: json['dietType'] ?? json['diet_type'] ?? 'Sattvic',
      timeSlot: json['timeSlot'] ?? json['time_slot'] ?? 'lunch',
      timeLabel: json['timeLabel'] ?? json['time_label'] ?? 'Midday Prana',
      targetGoal: json['targetGoal'] ?? json['target_goal'] ?? 'Energy & Digestion',
      level: json['level'] ?? 'All Levels',
      calories: json['calories'] ?? 350,
      proteinGrams: json['proteinGrams'] ?? json['protein_grams'] ?? 14,
      carbsGrams: json['carbsGrams'] ?? json['carbs_grams'] ?? 45,
      fatGrams: json['fatGrams'] ?? json['fat_grams'] ?? 8,
      description: json['description'] ?? '',
      ingredients: parseList(json['ingredients']),
      preparationInstructions: parseList(json['preparationInstructions'] ?? json['preparation_instructions']),
      benefits: json['benefits'] ?? '',
    );
  }
}
