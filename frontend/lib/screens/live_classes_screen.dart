import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/user_session.dart';
import '../models/live_class.dart';
import '../services/api_service.dart';
import '../theme.dart';

class LiveClassesScreen extends StatefulWidget {
  final UserSession session;

  const LiveClassesScreen({Key? key, required this.session}) : super(key: key);

  @override
  State<LiveClassesScreen> createState() => _LiveClassesScreenState();
}

class _LiveClassesScreenState extends State<LiveClassesScreen> {
  List<LiveClass> _classes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadClasses();
  }

  Future<void> _loadClasses() async {
    final list = await ApiService.getLiveClasses();
    if (mounted) {
      setState(() {
        _classes = list;
        _isLoading = false;
      });
    }
  }

  Future<void> _joinClass(LiveClass c) async {
    setState(() {
      c.isJoined = !c.isJoined;
      c.participantCount += c.isJoined ? 1 : -1;
    });

    if (c.isJoined && c.meetingUrl.isNotEmpty) {
      final uri = Uri.parse(c.meetingUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    }
  }

  void _showScheduleClassModal() {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final urlCtrl = TextEditingController(text: 'https://meet.google.com/nrityasana-live');
    int duration = 45;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          decoration: const BoxDecoration(
            color: AppTheme.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
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
                const Text(
                  'Schedule Masterclass (Admin)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primaryDark),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: titleCtrl,
                  decoration: InputDecoration(
                    labelText: 'Class Title',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  decoration: InputDecoration(
                    labelText: 'Description & Focus',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: urlCtrl,
                  decoration: InputDecoration(
                    labelText: 'Google Meet / Meeting URL',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () async {
                    if (titleCtrl.text.isEmpty) return;
                    Navigator.pop(context);
                    final newClass = LiveClass(
                      id: 'c-${DateTime.now().millisecondsSinceEpoch}',
                      title: titleCtrl.text,
                      description: descCtrl.text,
                      startTime: DateTime.now().add(const Duration(hours: 4)),
                      durationMinutes: duration,
                      meetingUrl: urlCtrl.text,
                      createdBy: widget.session.email,
                      participantCount: 1,
                      isJoined: true,
                    );
                    setState(() => _classes.insert(0, newClass));

                    await ApiService.createLiveClass(
                      title: newClass.title,
                      description: newClass.description,
                      startTime: newClass.startTime,
                      durationMinutes: newClass.durationMinutes,
                      meetingUrl: newClass.meetingUrl,
                      createdBy: newClass.createdBy,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Publish to Live Schedule', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      floatingActionButton: widget.session.isAdmin
          ? FloatingActionButton.extended(
              onPressed: _showScheduleClassModal,
              backgroundColor: AppTheme.primaryDark,
              icon: const Icon(Icons.add_circle_outline, color: Colors.white),
              label: const Text('Schedule Class', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          : null,
      body: RefreshIndicator(
        onRefresh: _loadClasses,
        color: AppTheme.primary,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              const Text(
                'LIVE MASTERCLASSES',
                style: TextStyle(
                  color: AppTheme.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Sacred Sangha & Live Guidance',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: AppTheme.textMain),
              ),
              const SizedBox(height: 6),
              const Text(
                'Practice together in real-time with revered Gurus and fellow practitioners.',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
              ),
              const SizedBox(height: 20),

              if (_isLoading)
                const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator(color: AppTheme.primary)))
              else if (_classes.isEmpty)
                const Center(child: Text('No upcoming live classes scheduled.'))
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _classes.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, idx) {
                    final c = _classes[idx];
                    final dateStr = DateFormat('EEE, d MMM • h:mm a').format(c.startTime);

                    return Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(22),
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
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      color: Colors.red,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text(
                                    'UPCOMING',
                                    style: TextStyle(
                                      color: Colors.red,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 10,
                                      letterSpacing: 0.8,
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                '${c.participantCount} joined',
                                style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            c.title,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 17,
                              color: AppTheme.textMain,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            c.description,
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 13, height: 1.3),
                          ),
                          const SizedBox(height: 14),
                          Row(
                            children: [
                              const Icon(Icons.calendar_today_outlined, size: 14, color: AppTheme.textMuted),
                              const SizedBox(width: 6),
                              Text(dateStr, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                              const SizedBox(width: 14),
                              const Icon(Icons.timer_outlined, size: 14, color: AppTheme.textMuted),
                              const SizedBox(width: 4),
                              Text('${c.durationMinutes} min', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () => _joinClass(c),
                                  icon: Icon(
                                    c.isJoined ? Icons.check_circle_outline : Icons.video_camera_front_outlined,
                                    size: 18,
                                    color: c.isJoined ? Colors.white : AppTheme.primaryDark,
                                  ),
                                  label: Text(
                                    c.isJoined ? 'Joined • Open Google Meet' : 'RSVP & Join Session',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: c.isJoined ? Colors.white : AppTheme.primaryDark,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: c.isJoined ? AppTheme.accentGreen : const Color(0xFFFAF3F0),
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
