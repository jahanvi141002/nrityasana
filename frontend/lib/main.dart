import 'package:flutter/material.dart';
import 'core/api_client.dart';
import 'auth_screen.dart';
import 'me_screen.dart';
import 'live_classes_screen.dart';
import 'profile_screen.dart';
import 'chat_screen.dart';

void main() => runApp(const NrityasanaApp());

class NrityasanaApp extends StatelessWidget {
  const NrityasanaApp({super.key});

  @override
  Widget build(BuildContext context) {
    const ink = Color(0xFF201C1A);
    return MaterialApp(
      title: 'Nrityasana',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF7F1E9),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFB8543F), brightness: Brightness.light),
        textTheme: const TextTheme(
          displaySmall: TextStyle(fontFamily: 'Georgia', fontWeight: FontWeight.w700, color: ink, letterSpacing: 0),
          headlineSmall: TextStyle(fontFamily: 'Georgia', fontWeight: FontWeight.w700, color: ink, letterSpacing: 0),
          titleLarge: TextStyle(fontWeight: FontWeight.w700, color: ink, letterSpacing: 0),
          bodyLarge: TextStyle(color: Color(0xFF5F554D), height: 1.4, letterSpacing: 0),
          bodyMedium: TextStyle(color: Color(0xFF75685F), letterSpacing: 0),
        ),
      ),
      home: const AuthScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.session});

  final AuthSession session;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int selectedTab = 0;
  String selectedFilter = 'All';
  bool isStarted = false;

  final practices = const [
    Practice(title: 'Surya Namaskar', discipline: 'Yoga', category: 'Flow', minutes: 18, description: 'Build warmth, breath, and focus.', icon: 'sunny'),
    Practice(title: 'Ankle & Aramandi', discipline: 'Dance', category: 'Technique', minutes: 12, description: 'Wake up the feet and find your line.', icon: 'footprints'),
    Practice(title: 'Moonlit Cooldown', discipline: 'Yoga', category: 'Restore', minutes: 10, description: 'A soft landing for your evening.', icon: 'moon'),
    Practice(title: 'Abhinaya Basics', discipline: 'Dance', category: 'Expression', minutes: 24, description: 'Let the eyes lead the story.', icon: 'sparkles'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: IndexedStack(index: selectedTab, children: [_buildHome(), _buildLibrary(), _buildProgress(), LiveClassesScreen(session: widget.session), ChatScreen(session: widget.session), MeScreen(session: widget.session)])),
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedTab,
        onDestinationSelected: (value) => setState(() => selectedTab = value),
        backgroundColor: const Color(0xFFF7F1E9),
        indicatorColor: const Color(0xFFE8C9B6),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Today'),
          NavigationDestination(icon: Icon(Icons.grid_view_outlined), selectedIcon: Icon(Icons.grid_view), label: 'Explore'),
          NavigationDestination(icon: Icon(Icons.insights_outlined), selectedIcon: Icon(Icons.insights), label: 'Progress'),
          NavigationDestination(icon: Icon(Icons.video_call_outlined), selectedIcon: Icon(Icons.video_call), label: 'Live'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), selectedIcon: Icon(Icons.chat_bubble), label: 'Chat'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Me'),
        ],
      ),
    );
  }

  Widget _buildHome() {
    return CustomScrollView(
      slivers: [
        SliverPadding(padding: const EdgeInsets.fromLTRB(22, 22, 22, 0), sliver: SliverToBoxAdapter(child: _topBar())),
        SliverPadding(padding: const EdgeInsets.fromLTRB(22, 28, 22, 0), sliver: SliverToBoxAdapter(child: _welcome())),
        SliverPadding(padding: const EdgeInsets.fromLTRB(22, 26, 22, 0), sliver: SliverToBoxAdapter(child: _sectionHeader('Your practice'))),
        SliverPadding(padding: const EdgeInsets.fromLTRB(22, 14, 22, 0), sliver: SliverToBoxAdapter(child: _featuredCard())),
        SliverPadding(padding: const EdgeInsets.fromLTRB(22, 30, 22, 0), sliver: SliverToBoxAdapter(child: _sectionHeader('Made for your rhythm'))),
        SliverPadding(padding: const EdgeInsets.fromLTRB(22, 14, 22, 30), sliver: SliverToBoxAdapter(child: _practiceList())),
      ],
    );
  }

  Widget _topBar() => Row(children: [
        Container(width: 42, height: 42, decoration: BoxDecoration(color: const Color(0xFF201C1A), borderRadius: BorderRadius.circular(14)), child: const Icon(Icons.self_improvement, color: Color(0xFFF6D4A7))),
        const SizedBox(width: 12),
        const Text('nrityasana', style: TextStyle(fontFamily: 'Georgia', fontSize: 21, fontWeight: FontWeight.bold, letterSpacing: 0)),
        const Spacer(),
        IconButton(onPressed: () {}, icon: const Icon(Icons.notifications_none_rounded), tooltip: 'Notifications'),
        GestureDetector(onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProfileScreen(session: widget.session))), child: CircleAvatar(radius: 18, backgroundColor: const Color(0xFFD9A28C), child: Text(widget.session.email.substring(0, 1).toUpperCase(), style: const TextStyle(color: Color(0xFF4C2921), fontWeight: FontWeight.bold)))),
      ]);

  Widget _welcome() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Thursday, 17 September', style: Theme.of(context).textTheme.bodyMedium),
        const SizedBox(height: 8),
        Text('Come back to your body,\nAnanya.', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontSize: 34, height: 1.05)),
        const SizedBox(height: 12),
        Text('A little movement is still a practice.', style: Theme.of(context).textTheme.bodyLarge),
      ]);

  Widget _sectionHeader(String title) => Row(children: [Text(title, style: Theme.of(context).textTheme.titleLarge), const Spacer(), TextButton(onPressed: () => setState(() => selectedTab = 1), child: const Text('See all'))]);

  Widget _featuredCard() => Container(
        height: 220,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(color: const Color(0xFFB8543F), borderRadius: BorderRadius.circular(28)),
        child: Stack(children: [
          Positioned(right: -32, top: -46, child: Container(width: 190, height: 190, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0x66F6D4A7), width: 28)))),
          Positioned(right: 28, bottom: 10, child: Icon(Icons.wb_sunny_outlined, size: 112, color: const Color(0x40F6D4A7))),
          Padding(padding: const EdgeInsets.all(24), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), decoration: BoxDecoration(color: const Color(0x33FFFFFF), borderRadius: BorderRadius.circular(30)), child: const Text('RECOMMENDED FOR YOU', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.1))),
            const Spacer(),
            const Text('Ground & glow', style: TextStyle(color: Colors.white, fontFamily: 'Georgia', fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 5),
            const Text('18 min  •  Gentle flow', style: TextStyle(color: Color(0xFFF8D8C4))),
            const SizedBox(height: 14),
            FilledButton.icon(onPressed: () => setState(() => isStarted = !isStarted), icon: Icon(isStarted ? Icons.pause : Icons.play_arrow), label: Text(isStarted ? 'Pause practice' : 'Start practice'), style: FilledButton.styleFrom(backgroundColor: const Color(0xFFF6D4A7), foregroundColor: const Color(0xFF51261E))),
          ])),
        ]),
      );

  Widget _practiceList() {
    final filtered = selectedFilter == 'All' ? practices : practices.where((item) => item.discipline == selectedFilter).toList();
    return Column(children: [
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: ['All', 'Yoga', 'Dance']
              .map((filter) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(filter),
                      selected: selectedFilter == filter,
                      onSelected: (_) => setState(() => selectedFilter = filter),
                    ),
                  ))
              .toList(),
        ),
      ),
      const SizedBox(height: 14),
      ...filtered.take(3).map(_practiceTile),
    ]);
  }

  Widget _practiceTile(Practice practice) => Container(margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: Colors.white.withOpacity(.72), borderRadius: BorderRadius.circular(18)), child: Row(children: [
        Container(width: 50, height: 50, decoration: BoxDecoration(color: practice.discipline == 'Yoga' ? const Color(0xFFDCE2C8) : const Color(0xFFF1D4C0), borderRadius: BorderRadius.circular(16)), child: Icon(practice.discipline == 'Yoga' ? Icons.spa_outlined : Icons.directions_walk_outlined, color: const Color(0xFF4C423A))),
        const SizedBox(width: 13), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(practice.title, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF332B27))), const SizedBox(height: 3), Text('${practice.category}  •  ${practice.minutes} min', style: Theme.of(context).textTheme.bodyMedium)])),
        IconButton(onPressed: () {}, icon: const Icon(Icons.arrow_forward_rounded), tooltip: 'Open practice'),
      ]));

  Widget _buildLibrary() => CustomScrollView(
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(22, 28, 22, 0),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Explore', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontSize: 36)),
                  const SizedBox(height: 8),
                  Text('Find a practice that meets you where you are.', style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 28),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 22),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _practiceTile(practices[index]),
                childCount: practices.length,
              ),
            ),
          ),
        ],
      );

  Widget _buildProgress() => ListView(
        padding: const EdgeInsets.fromLTRB(22, 28, 22, 20),
        children: [
          Text('Your rhythm', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontSize: 36)),
          const SizedBox(height: 8),
          Text('Small steps become a language.', style: Theme.of(context).textTheme.bodyLarge),
          const SizedBox(height: 30),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: const Color(0xFF201C1A), borderRadius: BorderRadius.circular(26)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('THIS WEEK', style: TextStyle(color: Color(0xFFF6D4A7), letterSpacing: 1.4, fontSize: 11, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                const Text('3 practices', style: TextStyle(color: Colors.white, fontFamily: 'Georgia', fontSize: 30, fontWeight: FontWeight.bold)),
                const SizedBox(height: 18),
                LinearProgressIndicator(value: .6, minHeight: 8, borderRadius: BorderRadius.circular(8), backgroundColor: const Color(0x334C423A), color: const Color(0xFFF6D4A7)),
                const SizedBox(height: 10),
                const Text('2 more to reach your gentle goal', style: TextStyle(color: Color(0xFFC5B8AE))),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('Consistency, not intensity', style: TextStyle(fontFamily: 'Georgia', fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF201C1A))),
          const SizedBox(height: 14),
          Row(
            children: List.generate(
              7,
              (index) => Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(right: 7),
                  child: Column(
                    children: [
                      Container(
                        height: 52,
                        decoration: BoxDecoration(color: index < 3 ? const Color(0xFFB8543F) : const Color(0xFFE5DCD2), borderRadius: BorderRadius.circular(10)),
                        child: index < 3 ? const Icon(Icons.check, color: Colors.white, size: 18) : null,
                      ),
                      const SizedBox(height: 6),
                      Text(['M', 'T', 'W', 'T', 'F', 'S', 'S'][index], style: Theme.of(context).textTheme.bodyMedium),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      );
}
