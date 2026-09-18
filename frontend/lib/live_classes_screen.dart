import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'core/api_client.dart';

class LiveClassesScreen extends StatefulWidget {
  const LiveClassesScreen({super.key, required this.session});

  final AuthSession session;

  @override
  State<LiveClassesScreen> createState() => _LiveClassesScreenState();
}

class _LiveClassesScreenState extends State<LiveClassesScreen> {
  final _apiClient = const ApiClient();
  List<LiveClass> _classes = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadClasses();
  }

  Future<void> _loadClasses() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final classes = await _apiClient.getClasses(widget.session);
      if (mounted) setState(() => _classes = classes);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _join(LiveClass liveClass) async {
    try {
      final updated = await _apiClient.joinClass(session: widget.session, classId: liveClass.id);
      if (mounted) setState(() => _classes = _classes.map((item) => item.id == updated.id ? updated : item).toList());
      final uri = Uri.tryParse(updated.meetingUrl);
      if (uri != null && await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    }
  }

  Future<void> _schedule() async {
    final result = await showDialog<_ScheduleDraft>(context: context, builder: (_) => const _ScheduleDialog());
    if (result == null) return;
    try {
      await _apiClient.scheduleClass(session: widget.session, title: result.title, description: result.description, startTime: result.startTime, durationMinutes: result.durationMinutes, meetingUrl: result.meetingUrl);
      await _loadClasses();
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isAdmin = widget.session.role == 'ADMIN';
    return RefreshIndicator(
      onRefresh: _loadClasses,
      child: CustomScrollView(
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(22, 28, 22, 0),
            sliver: SliverToBoxAdapter(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [Expanded(child: Text('Live classes', style: theme.textTheme.displaySmall?.copyWith(fontSize: 36))), if (isAdmin) IconButton(onPressed: _schedule, icon: const Icon(Icons.add_circle_outline), tooltip: 'Schedule class')]),
                const SizedBox(height: 8),
                Text(isAdmin ? 'Create a room for your students to move together.' : 'Join a live practice and move with your teacher.', style: theme.textTheme.bodyLarge),
                if (_error != null) ...[const SizedBox(height: 14), Text(_error!, style: TextStyle(color: theme.colorScheme.error))],
                const SizedBox(height: 26),
              ]),
            ),
          ),
          if (_isLoading)
            const SliverToBoxAdapter(child: Center(child: Padding(padding: EdgeInsets.all(30), child: CircularProgressIndicator())))
          else if (_classes.isEmpty)
            SliverPadding(padding: const EdgeInsets.symmetric(horizontal: 22), sliver: const SliverToBoxAdapter(child: _NoClasses()))
          else
            SliverPadding(padding: const EdgeInsets.symmetric(horizontal: 22), sliver: SliverList(delegate: SliverChildBuilderDelegate((context, index) => _classCard(_classes[index]), childCount: _classes.length))),
          const SliverPadding(padding: EdgeInsets.only(bottom: 28)),
        ],
      ),
    );
  }

  Widget _classCard(LiveClass liveClass) {
    final isSoon = liveClass.startTime.difference(DateTime.now()).inHours < 24;
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: Colors.white.withValues(alpha: .72), borderRadius: BorderRadius.circular(20)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [Container(padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6), decoration: BoxDecoration(color: isSoon ? const Color(0xFFF1D4C0) : const Color(0xFFDCE2C8), borderRadius: BorderRadius.circular(8)), child: Text(isSoon ? 'SOON' : 'UPCOMING', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1))), const Spacer(), Text('${liveClass.participantCount} joined', style: Theme.of(context).textTheme.bodyMedium)]),
        const SizedBox(height: 14),
        Text(liveClass.title, style: Theme.of(context).textTheme.titleLarge),
        if (liveClass.description.isNotEmpty) ...[const SizedBox(height: 5), Text(liveClass.description, style: Theme.of(context).textTheme.bodyMedium)],
        const SizedBox(height: 14),
        Row(children: [const Icon(Icons.schedule_outlined, size: 18, color: Color(0xFFB8543F)), const SizedBox(width: 7), Text(_formatDate(liveClass.startTime)), const SizedBox(width: 12), Text('${liveClass.durationMinutes} min', style: Theme.of(context).textTheme.bodyMedium)]),
        const SizedBox(height: 14),
        SizedBox(width: double.infinity, child: FilledButton.icon(onPressed: () => _join(liveClass), icon: Icon(liveClass.joined ? Icons.open_in_new : Icons.video_call_outlined), label: Text(liveClass.joined ? 'Join live room' : 'Join class'))),
      ]),
    );
  }

  String _formatDate(DateTime value) => '${value.day}/${value.month}/${value.year} at ${value.hour.toString().padLeft(2, '0')}:${value.minute.toString().padLeft(2, '0')}';
}

class _NoClasses extends StatelessWidget {
  const _NoClasses();

  @override
  Widget build(BuildContext context) => Container(padding: const EdgeInsets.all(30), decoration: BoxDecoration(color: Colors.white.withValues(alpha: .65), borderRadius: BorderRadius.circular(20)), child: const Column(children: [Icon(Icons.video_call_outlined, size: 38, color: Color(0xFFB8543F)), SizedBox(height: 12), Text('No classes scheduled yet', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF332B27))), SizedBox(height: 6), Text('Your teacher will post the next live session here.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF75685F)))]));
}

class _ScheduleDraft {
  const _ScheduleDraft({required this.title, required this.description, required this.startTime, required this.durationMinutes, required this.meetingUrl});

  final String title;
  final String description;
  final DateTime startTime;
  final int durationMinutes;
  final String meetingUrl;
}

class _ScheduleDialog extends StatefulWidget {
  const _ScheduleDialog();

  @override
  State<_ScheduleDialog> createState() => _ScheduleDialogState();
}

class _ScheduleDialogState extends State<_ScheduleDialog> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _meetingUrl = TextEditingController();
  DateTime _startTime = DateTime.now().add(const Duration(days: 1));
  int _duration = 60;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _meetingUrl.dispose();
    super.dispose();
  }

  Future<void> _chooseTime() async {
    final date = await showDatePicker(context: context, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)), initialDate: _startTime);
    if (date == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(_startTime));
    if (time != null) setState(() => _startTime = DateTime(date.year, date.month, date.day, time.hour, time.minute));
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
        title: const Text('Schedule a live class'),
        content: SizedBox(width: 430, child: Form(key: _formKey, child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
          TextFormField(controller: _title, decoration: const InputDecoration(labelText: 'Class title'), validator: (value) => value == null || value.trim().isEmpty ? 'Add a title' : null),
          TextFormField(controller: _description, decoration: const InputDecoration(labelText: 'Description')),
          const SizedBox(height: 12),
          ListTile(contentPadding: EdgeInsets.zero, leading: const Icon(Icons.schedule), title: const Text('Start time'), subtitle: Text('${_startTime.day}/${_startTime.month}/${_startTime.year} at ${_startTime.hour.toString().padLeft(2, '0')}:${_startTime.minute.toString().padLeft(2, '0')}'), onTap: _chooseTime),
          DropdownButtonFormField<int>(value: _duration, decoration: const InputDecoration(labelText: 'Duration'), items: const [30, 45, 60, 90].map((value) => DropdownMenuItem(value: value, child: Text('$value minutes'))).toList(), onChanged: (value) => setState(() => _duration = value ?? 60)),
          TextFormField(controller: _meetingUrl, decoration: const InputDecoration(labelText: 'Meeting link', hintText: 'https://meet.google.com/...'), keyboardType: TextInputType.url, validator: (value) => value == null || !value.startsWith('http') ? 'Add a valid meeting link' : null),
        ])))),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')), FilledButton(onPressed: () { if (_formKey.currentState!.validate()) Navigator.pop(context, _ScheduleDraft(title: _title.text.trim(), description: _description.text.trim(), startTime: _startTime, durationMinutes: _duration, meetingUrl: _meetingUrl.text.trim())); }, child: const Text('Schedule'))],
      );
}
