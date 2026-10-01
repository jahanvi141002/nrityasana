import 'package:flutter/material.dart';
import '../models/user_session.dart';
import '../theme.dart';

class MeScreen extends StatelessWidget {
  final UserSession session;
  final VoidCallback onLogout;

  const MeScreen({
    Key? key,
    required this.session,
    required this.onLogout,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // User Profile Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppTheme.cardBorder),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: AppTheme.primary,
                      child: Text(
                        session.displayName.isNotEmpty ? session.displayName[0].toUpperCase() : 'U',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                session.displayName,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.textMain),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: session.isAdmin ? AppTheme.primaryDark : AppTheme.accentGreen,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  session.role,
                                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            session.email,
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const Divider(color: AppTheme.cardBorder),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _infoPill('Discipline', session.danceStyle ?? 'Bharatanatyam'),
                    _infoPill('Level', session.experienceLevel ?? 'Intermediate'),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Backend Connection Status
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFFAF3F0),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.cardBorder),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.storage_rounded, color: AppTheme.primaryDark, size: 20),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Spring Boot API & MySQL 8.0',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain),
                      ),
                      Text(
                        'Connected at http://localhost:8080',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppTheme.accentGreen,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Settings Section
          const Text('Account & Preferences', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 12),

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.cardBorder),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.notifications_none, color: AppTheme.textMain),
                  title: const Text('Practice Reminders', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  trailing: const Switch(value: true, onChanged: null, activeColor: AppTheme.primary),
                ),
                const Divider(height: 1, color: AppTheme.cardBorder),
                ListTile(
                  leading: const Icon(Icons.self_improvement_outlined, color: AppTheme.textMain),
                  title: const Text('Pranayama Breathing Guide', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  trailing: const Icon(Icons.chevron_right, color: AppTheme.textMuted),
                  onTap: () {},
                ),
                const Divider(height: 1, color: AppTheme.cardBorder),
                ListTile(
                  leading: const Icon(Icons.logout, color: Colors.red),
                  title: const Text(
                    'Sign Out / Switch Role',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.red),
                  ),
                  onTap: onLogout,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoPill(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMain)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
      ],
    );
  }
}
