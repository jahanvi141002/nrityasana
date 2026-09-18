import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'auth_screen.dart';
import 'core/api_client.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.session});

  final AuthSession session;

  void _logout(BuildContext context) {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const AuthScreen()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final initial = session.email.substring(0, 1).toUpperCase();
    final isAdmin = session.role == 'ADMIN';
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(22, 20, 22, 32),
        children: [
          Center(
            child: Column(
              children: [
                _ProfilePictureEditor(session: session, initial: initial),
                const SizedBox(height: 14),
                Text('Your practice profile', style: theme.textTheme.headlineSmall),
                const SizedBox(height: 5),
                Text(isAdmin ? 'Teacher and administrator' : 'Movement learner', style: theme.textTheme.bodyMedium),
              ],
            ),
          ),
          const SizedBox(height: 30),
          _detailTile(Icons.mail_outline, 'Email address', session.email),
          _detailTile(Icons.badge_outlined, 'Account type', isAdmin ? 'Admin' : 'Member'),
          _detailTile(Icons.fingerprint, 'Member ID', session.userId),
          const SizedBox(height: 22),
          OutlinedButton.icon(
            onPressed: () => _logout(context),
            icon: const Icon(Icons.logout),
            label: const Text('Log out'),
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFFB8543F),
              padding: const EdgeInsets.symmetric(vertical: 15),
            ),
          ),
        ],
      ),
    );
  }

  Widget _detailTile(IconData icon, String label, String value) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: .72),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(icon, color: const Color(0xFFB8543F)),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF75685F))),
                  const SizedBox(height: 4),
                  Text(value, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF332B27))),
                ],
              ),
            ),
          ],
        ),
      );
}

class _ProfilePictureEditor extends StatefulWidget {
  const _ProfilePictureEditor({required this.session, required this.initial});

  final AuthSession session;
  final String initial;

  @override
  State<_ProfilePictureEditor> createState() => _ProfilePictureEditorState();
}

class _ProfilePictureEditorState extends State<_ProfilePictureEditor> {
  final _picker = ImagePicker();
  final _apiClient = const ApiClient();
  String? _pictureUrl;
  bool _isBusy = false;

  @override
  void initState() {
    super.initState();
    _loadPicture();
  }

  Future<void> _loadPicture() async {
    try {
      final pictureUrl = await _apiClient.getProfilePicture(widget.session);
      if (mounted) setState(() => _pictureUrl = pictureUrl);
    } catch (_) {
      // Missing profile pictures fall back to initials.
    }
  }

  Future<void> _choosePicture() async {
    final file = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (file == null) return;
    setState(() => _isBusy = true);
    try {
      final pictureUrl = await _apiClient.uploadProfilePicture(session: widget.session, file: file);
      if (mounted) setState(() => _pictureUrl = pictureUrl);
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString().replaceFirst('Exception: ', ''))),
        );
      }
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final baseUrl = _apiClient.apiBaseUrl.replaceFirst('/api', '');
    return Stack(
      children: [
        CircleAvatar(
          radius: 44,
          backgroundColor: const Color(0xFFD9A28C),
          backgroundImage: _pictureUrl == null ? null : NetworkImage('$baseUrl$_pictureUrl'),
          child: _pictureUrl == null
              ? Text(widget.initial, style: const TextStyle(fontSize: 36, color: Color(0xFF4C2921), fontWeight: FontWeight.bold))
              : null,
        ),
        Positioned(
          right: -2,
          bottom: -2,
          child: IconButton(
            onPressed: _isBusy ? null : _choosePicture,
            icon: _isBusy
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.camera_alt_outlined, size: 18),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFFF6D4A7),
              foregroundColor: const Color(0xFF51261E),
            ),
            tooltip: 'Change profile picture',
          ),
        ),
      ],
    );
  }
}
