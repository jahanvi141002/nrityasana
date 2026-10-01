import 'package:flutter/material.dart';
import '../models/user_session.dart';
import '../theme.dart';

class ProgressScreen extends StatelessWidget {
  final UserSession session;

  const ProgressScreen({Key? key, required this.session}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          const Text(
            'SACRED CONSISTENCY',
            style: TextStyle(
              color: AppTheme.primary,
              fontWeight: FontWeight.bold,
              fontSize: 11,
              letterSpacing: 1.1,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Practice Rhythm & Growth',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: AppTheme.textMain),
          ),
          const SizedBox(height: 6),
          const Text(
            'Small steps of mindful discipline awaken deep mastery and inner stillness.',
            style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
          ),
          const SizedBox(height: 20),

          // Weekly Streak Banner Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFC05640), Color(0xFF8C2D1F)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFC05640).withOpacity(0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.local_fire_department, color: Color(0xFFFBBF24), size: 28),
                        SizedBox(width: 8),
                        Text(
                          '4-Day Sacred Streak',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text('Top 10%', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Text(
                  'Weekly Goal: 5 Practice Sessions',
                  style: TextStyle(color: Colors.white70, fontSize: 13),
                ),
                const SizedBox(height: 12),

                // Days Circles
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: ['M', 'T', 'W', 'T', 'F', 'S', 'S'].asMap().entries.map((e) {
                    final isDone = e.key < 4;
                    return Column(
                      children: [
                        Container(
                          width: 34,
                          height: 34,
                          decoration: BoxDecoration(
                            color: isDone ? Colors.white : Colors.white.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: isDone
                                ? const Icon(Icons.check, color: AppTheme.primaryDark, size: 18)
                                : Text(e.value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(e.value, style: const TextStyle(color: Colors.white70, fontSize: 10)),
                      ],
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Stats Overview
          Row(
            children: [
              Expanded(
                child: _statCard('Total Time', '186 mins', Icons.access_time_rounded),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _statCard('Sessions', '14 completed', Icons.spa_outlined),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Discipline Breakdown
          const Text('Discipline Balance', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.cardBorder),
            ),
            child: Column(
              children: [
                _disciplineBar('Kathak & Classical Footwork', 0.45, AppTheme.primary),
                const SizedBox(height: 14),
                _disciplineBar('Vinyasa Yoga & Pranayama', 0.30, const Color(0xFF059669)),
                const SizedBox(height: 14),
                _disciplineBar('Bharatanatyam & Mudras', 0.25, AppTheme.primaryDark),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _statCard(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.background,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppTheme.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.textMain)),
                Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _disciplineBar(String title, double fraction, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMain)),
            Text('${(fraction * 100).toInt()}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: fraction,
            minHeight: 8,
            backgroundColor: const Color(0xFFFAF3F0),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }
}
