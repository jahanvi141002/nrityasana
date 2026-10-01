import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/user_session.dart';
import '../models/practice.dart';
import '../services/api_service.dart';
import '../theme.dart';

class HomeScreen extends StatefulWidget {
  final UserSession session;
  final Function(Practice) onSelectPractice;
  final VoidCallback onExploreMore;

  const HomeScreen({
    Key? key,
    required this.session,
    required this.onSelectPractice,
    required this.onExploreMore,
  }) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Practice> _practices = [];
  String _selectedDiscipline = 'All';
  bool _isLoading = true;

  final List<String> _disciplines = [
    'All',
    'Yoga',
    'Kathak',
    'Bharatanatyam',
    'Odissi',
    'Bollywood',
    'Zumba',
  ];

  @override
  void initState() {
    super.initState();
    _loadPractices();
  }

  Future<void> _loadPractices() async {
    final list = await ApiService.getPractices();
    if (mounted) {
      setState(() {
        _practices = list;
        _isLoading = false;
      });
    }
  }

  List<Practice> get _filteredPractices {
    if (_selectedDiscipline == 'All') return _practices;
    return _practices
        .where((p) => p.discipline.toLowerCase() == _selectedDiscipline.toLowerCase())
        .toList();
  }

  Practice? get _featuredPractice {
    if (_practices.isEmpty) return null;
    return _practices.first;
  }

  @override
  Widget build(BuildContext context) {
    final dateStr = DateFormat('EEEE, d MMMM').format(DateTime.now());
    final featured = _featuredPractice;

    return RefreshIndicator(
      onRefresh: _loadPractices,
      color: AppTheme.primary,
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Header
            Text(
              dateStr.toUpperCase(),
              style: const TextStyle(
                color: Color(0xFF94848A),
                fontWeight: FontWeight.bold,
                fontSize: 11,
                letterSpacing: 1.0,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Come back to your rhythm,\n${widget.session.displayName}.',
              style: Theme.of(context).textTheme.displayMedium?.copyWith(
                    height: 1.15,
                    color: AppTheme.textMain,
                  ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Yoga flows, classical dance, cardio beats & Ayurvedic nutrition.',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
            ),
            const SizedBox(height: 20),

            // Daily Sankalpa Card (Intention of the day)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFF9F5), Color(0xFFF9EAE1)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.wb_sunny_outlined, color: AppTheme.primary, size: 20),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'DAILY SANKALPA • NATYASHASTRA',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                            color: AppTheme.primary,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          '"Yato hastastato drishti, yato drishtistato manaha"',
                          style: TextStyle(
                            fontStyle: FontStyle.italic,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: AppTheme.textMain,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Where the hand moves, the gaze follows; where the gaze goes, the mind finds deep concentration.',
                          style: TextStyle(fontSize: 12, color: AppTheme.textMuted, height: 1.3),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Featured Hero Card
            if (featured != null) ...[
              const Text(
                "Today's Focus",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.textMain),
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () => widget.onSelectPractice(featured),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFC05640), Color(0xFF8C2D1F)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFC05640).withOpacity(0.35),
                        blurRadius: 18,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              'RECOMMENDED FOR YOU',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.25),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.timer_outlined, color: Colors.white, size: 14),
                                const SizedBox(width: 4),
                                Text(
                                  '${featured.minutes} min',
                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Text(
                        featured.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${featured.discipline} • ${featured.category}',
                        style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 13),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton.icon(
                        onPressed: () => widget.onSelectPractice(featured),
                        icon: const Icon(Icons.play_arrow_rounded, color: AppTheme.primaryDark),
                        label: const Text(
                          'Start Practice',
                          style: TextStyle(color: AppTheme.primaryDark, fontWeight: FontWeight.bold),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 28),
            ],

            // Discipline Filters
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Sacred Disciplines',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.textMain),
                ),
                TextButton(
                  onPressed: widget.onExploreMore,
                  child: const Text(
                    'Explore all',
                    style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _disciplines.map((d) {
                  final isSelected = _selectedDiscipline == d;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      selected: isSelected,
                      label: Text(d),
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : AppTheme.textMain,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                      backgroundColor: Colors.white,
                      selectedColor: AppTheme.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(
                          color: isSelected ? AppTheme.primary : AppTheme.cardBorder,
                        ),
                      ),
                      onSelected: (_) => setState(() => _selectedDiscipline = d),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 18),

            // Practices List
            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(color: AppTheme.primary),
                ),
              )
            else if (_filteredPractices.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: Text('No practices found for this filter.'),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _filteredPractices.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final p = _filteredPractices[index];
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
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: AppTheme.background,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppTheme.cardBorder),
                            ),
                            child: Icon(
                              _getDisciplineIcon(p.discipline),
                              color: AppTheme.primary,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  p.title,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: AppTheme.textMain,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${p.discipline} • ${p.minutes} mins • ${p.level}',
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right, color: AppTheme.textMuted),
                        ],
                      ),
                    ),
                  );
                },
              ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  IconData _getDisciplineIcon(String discipline) {
    switch (discipline.toLowerCase()) {
      case 'yoga':
        return Icons.spa_outlined;
      case 'kathak':
      case 'bharatanatyam':
      case 'odissi':
        return Icons.directions_walk;
      case 'bollywood':
      case 'zumba':
        return Icons.music_note_outlined;
      default:
        return Icons.self_improvement;
    }
  }
}
