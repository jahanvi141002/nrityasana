import 'package:flutter/material.dart';
import '../models/practice.dart';
import '../models/diet_plan.dart';
import '../services/api_service.dart';
import '../theme.dart';

class ExploreScreen extends StatefulWidget {
  final Function(Practice) onSelectPractice;

  const ExploreScreen({Key? key, required this.onSelectPractice}) : super(key: key);

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Practice> _practices = [];
  List<DietPlan> _dietPlans = [];
  String _searchQuery = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    final p = await ApiService.getPractices();
    final d = await ApiService.getDietPlans();
    if (mounted) {
      setState(() {
        _practices = p;
        _dietPlans = d;
        _isLoading = false;
      });
    }
  }

  List<Practice> get _filteredPractices {
    if (_searchQuery.isEmpty) return _practices;
    return _practices
        .where((p) =>
            p.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            p.discipline.toLowerCase().contains(_searchQuery.toLowerCase()))
        .toList();
  }

  List<DietPlan> get _filteredDiet {
    if (_searchQuery.isEmpty) return _dietPlans;
    return _dietPlans
        .where((d) =>
            d.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            d.dietType.toLowerCase().contains(_searchQuery.toLowerCase()))
        .toList();
  }

  void _showDietModal(DietPlan diet) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: AppTheme.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppTheme.cardBorder,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${diet.dietType.toUpperCase()} • ${diet.timeLabel}',
                    style: const TextStyle(
                      color: AppTheme.primary,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  diet.title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 22),
                ),
                const SizedBox(height: 8),
                Text(
                  diet.description,
                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 13, height: 1.4),
                ),
                const SizedBox(height: 18),

                // Macros
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _macroItem('Calories', '${diet.calories} kcal'),
                    _macroItem('Protein', '${diet.proteinGrams}g'),
                    _macroItem('Carbs', '${diet.carbsGrams}g'),
                    _macroItem('Fat', '${diet.fatGrams}g'),
                  ],
                ),
                const SizedBox(height: 20),

                // Ingredients
                if (diet.ingredients.isNotEmpty) ...[
                  const Text('Sacred Ingredients', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: diet.ingredients
                        .map((ing) => Chip(
                              label: Text(ing, style: const TextStyle(fontSize: 12)),
                              backgroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: const BorderSide(color: AppTheme.cardBorder),
                              ),
                            ))
                        .toList(),
                  ),
                  const SizedBox(height: 16),
                ],

                // Benefits
                if (diet.benefits.isNotEmpty) ...[
                  const Text('Pranic & Dosha Benefits', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 6),
                  Text(diet.benefits, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.4)),
                  const SizedBox(height: 24),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _macroItem(String label, String val) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Column(
        children: [
          Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primaryDark)),
          Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Search & Tab Bar
        Container(
          color: AppTheme.background,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Column(
            children: [
              TextField(
                onChanged: (v) => setState(() => _searchQuery = v),
                decoration: InputDecoration(
                  hintText: 'Search movements, mudras, diets...',
                  prefixIcon: const Icon(Icons.search, size: 20),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppTheme.cardBorder),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppTheme.cardBorder),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TabBar(
                controller: _tabController,
                indicatorColor: AppTheme.primary,
                labelColor: AppTheme.primaryDark,
                unselectedLabelColor: AppTheme.textMuted,
                labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                tabs: const [
                  Tab(text: 'Movement Practices'),
                  Tab(text: 'Ayurveda & Nutrition'),
                ],
              ),
            ],
          ),
        ),

        // Tab Views
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
              : TabBarView(
                  controller: _tabController,
                  children: [
                    // Tab 1: Practices
                    ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _filteredPractices.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, idx) {
                        final p = _filteredPractices[idx];
                        return InkWell(
                          onTap: () => widget.onSelectPractice(p),
                          borderRadius: BorderRadius.circular(18),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: AppTheme.cardBorder),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primary.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        p.discipline,
                                        style: const TextStyle(
                                          color: AppTheme.primary,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ),
                                    Text(
                                      '${p.minutes} mins • ${p.level}',
                                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  p.title,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                    color: AppTheme.textMain,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  p.description,
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.3),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),

                    // Tab 2: Ayurveda & Nutrition
                    ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _filteredDiet.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, idx) {
                        final d = _filteredDiet[idx];
                        return InkWell(
                          onTap: () => _showDietModal(d),
                          borderRadius: BorderRadius.circular(18),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: AppTheme.cardBorder),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF059669).withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        '${d.dietType} • ${d.timeLabel}',
                                        style: const TextStyle(
                                          color: Color(0xFF059669),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ),
                                    Text(
                                      '${d.calories} kcal',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryDark),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  d.title,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                    color: AppTheme.textMain,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  d.description,
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.3),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
        ),
      ],
    );
  }
}
