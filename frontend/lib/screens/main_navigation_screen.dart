import 'package:flutter/material.dart';
import '../models/user_session.dart';
import '../models/practice.dart';
import '../theme.dart';
import 'home_screen.dart';
import 'explore_screen.dart';
import 'progress_screen.dart';
import 'live_classes_screen.dart';
import 'chat_screen.dart';
import 'me_screen.dart';
import 'active_practice_modal.dart';

class MainNavigationScreen extends StatefulWidget {
  final UserSession session;
  final VoidCallback onLogout;

  const MainNavigationScreen({
    Key? key,
    required this.session,
    required this.onLogout,
  }) : super(key: key);

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  Practice? _activePractice;

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      HomeScreen(
        session: widget.session,
        onSelectPractice: (p) => setState(() => _activePractice = p),
        onExploreMore: () => setState(() => _currentIndex = 1),
      ),
      ExploreScreen(
        onSelectPractice: (p) => setState(() => _activePractice = p),
      ),
      ProgressScreen(session: widget.session),
      LiveClassesScreen(session: widget.session),
      ChatScreen(session: widget.session),
      MeScreen(session: widget.session, onLogout: widget.onLogout),
    ];

    if (_activePractice != null) {
      return ActivePracticeModal(
        practice: _activePractice!,
        onClose: () => setState(() => _activePractice = null),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.self_improvement, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 8),
            const Text(
              'nrityasana',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.textMain),
            ),
            if (widget.session.isAdmin) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.primaryDark,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'ADMIN',
                  style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
        actions: [
          // Notifications Bell
          IconButton(
            icon: const Icon(Icons.notifications_none, size: 22),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('All practices and classes are synchronized.'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
          ),
          // User Avatar
          GestureDetector(
            onTap: () => setState(() => _currentIndex = 5),
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: AppTheme.primary.withOpacity(0.15),
                child: Text(
                  widget.session.displayName.isNotEmpty ? widget.session.displayName[0].toUpperCase() : 'U',
                  style: const TextStyle(color: AppTheme.primaryDark, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ),
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home_filled),
            label: 'Today',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.grid_view_outlined),
            activeIcon: Icon(Icons.grid_view_rounded),
            label: 'Explore',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.show_chart_rounded),
            activeIcon: Icon(Icons.auto_graph_rounded),
            label: 'Progress',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.video_camera_front_outlined),
            activeIcon: Icon(Icons.video_camera_front),
            label: 'Live',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline_rounded),
            activeIcon: Icon(Icons.chat_bubble_rounded),
            label: 'Chat',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline_rounded),
            activeIcon: Icon(Icons.person_rounded),
            label: 'Me',
          ),
        ],
      ),
    );
  }
}
