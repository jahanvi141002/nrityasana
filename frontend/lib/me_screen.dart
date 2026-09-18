import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'core/api_client.dart';
import 'profile_screen.dart';

class MeScreen extends StatefulWidget {
  const MeScreen({super.key, required this.session});

  final AuthSession session;

  @override
  State<MeScreen> createState() => _MeScreenState();
}

class _MeScreenState extends State<MeScreen> {
  final _picker = ImagePicker();
  final _apiClient = const ApiClient();
  final List<_PickedMedia> _pending = [];
  List<MediaItem> _uploaded = [];
  bool _isLoading = true;
  bool _isUploading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMedia();
  }

  Future<void> _loadMedia() async {
    try {
      final media = await _apiClient.getMedia(widget.session);
      if (mounted) setState(() => _uploaded = media);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickPhoto() async {
    final file = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (file != null) await _queue(file, 'photo');
  }

  Future<void> _pickVideo() async {
    final file = await _picker.pickVideo(source: ImageSource.gallery);
    if (file != null) await _queue(file, 'video');
  }

  Future<void> _queue(XFile file, String type) async {
    final bytes = await file.readAsBytes();
    if (mounted) setState(() => _pending.add(_PickedMedia(file: file, bytes: bytes, type: type)));
  }

  Future<void> _uploadPending() async {
    if (_pending.isEmpty) return;
    setState(() {
      _isUploading = true;
      _error = null;
    });
    try {
      final uploaded = <MediaItem>[];
      for (final item in _pending) {
        uploaded.add(await _apiClient.uploadMedia(session: widget.session, file: item.file));
      }
      if (mounted) {
        setState(() {
          _uploaded = [...uploaded.reversed, ..._uploaded];
          _pending.clear();
        });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Your media has been saved')));
      }
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final initial = widget.session.email.substring(0, 1).toUpperCase();
    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(22, 28, 22, 0),
          sliver: SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  CircleAvatar(radius: 28, backgroundColor: const Color(0xFFD9A28C), child: Text(initial, style: const TextStyle(fontSize: 24, color: Color(0xFF4C2921), fontWeight: FontWeight.bold))),
                  const SizedBox(width: 14),
                  Expanded(child: GestureDetector(onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProfileScreen(session: widget.session))), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Me', style: theme.textTheme.displaySmall?.copyWith(fontSize: 36)), Text(widget.session.email, style: theme.textTheme.bodyMedium)]))),
                  IconButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProfileScreen(session: widget.session))), icon: const Icon(Icons.settings_outlined), tooltip: 'Profile settings'),
                ]),
                const SizedBox(height: 28),
                Text('Your moments', style: theme.textTheme.titleLarge),
                const SizedBox(height: 8),
                Text('Keep the movement, the progress, and the little wins that belong to you.', style: theme.textTheme.bodyLarge),
                const SizedBox(height: 18),
                Row(children: [
                  Expanded(child: OutlinedButton.icon(onPressed: _isUploading ? null : _pickPhoto, icon: const Icon(Icons.add_photo_alternate_outlined), label: const Text('Photo'))),
                  const SizedBox(width: 10),
                  Expanded(child: OutlinedButton.icon(onPressed: _isUploading ? null : _pickVideo, icon: const Icon(Icons.videocam_outlined), label: const Text('Video'))),
                ]),
                if (_pending.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  _pendingGrid(),
                  const SizedBox(height: 12),
                  SizedBox(width: double.infinity, child: FilledButton.icon(onPressed: _isUploading ? null : _uploadPending, icon: _isUploading ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.cloud_upload_outlined), label: Text(_isUploading ? 'Uploading...' : 'Save to my gallery'))),
                ],
                if (_error != null) ...[const SizedBox(height: 14), Text(_error!, style: TextStyle(color: theme.colorScheme.error))],
                const SizedBox(height: 28),
                Text('Saved media', style: theme.textTheme.titleLarge),
                const SizedBox(height: 14),
              ],
            ),
          ),
        ),
        if (_isLoading)
          const SliverToBoxAdapter(child: Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator())))
        else if (_uploaded.isEmpty)
          SliverPadding(padding: const EdgeInsets.symmetric(horizontal: 22), sliver: const SliverToBoxAdapter(child: _EmptyMedia()))
        else
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 22),
            sliver: SliverGrid(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _uploadedTile(_uploaded[index]),
                childCount: _uploaded.length,
              ),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.05,
              ),
            ),
          ),
        const SliverPadding(padding: EdgeInsets.only(bottom: 28)),
      ],
    );
  }

  Widget _pendingGrid() => SizedBox(height: 150, child: ListView.separated(scrollDirection: Axis.horizontal, itemCount: _pending.length, separatorBuilder: (_, __) => const SizedBox(width: 10), itemBuilder: (context, index) {
        final item = _pending[index];
        return Stack(children: [
          ClipRRect(borderRadius: BorderRadius.circular(16), child: item.type == 'photo' ? Image.memory(item.bytes, width: 150, height: 150, fit: BoxFit.cover) : Container(width: 150, height: 150, color: const Color(0xFF201C1A), child: const Icon(Icons.play_circle_outline, color: Color(0xFFF6D4A7), size: 48))),
          Positioned(right: 6, top: 6, child: IconButton(onPressed: () => setState(() => _pending.removeAt(index)), icon: const Icon(Icons.close, color: Colors.white), style: IconButton.styleFrom(backgroundColor: Colors.black54))),
        ]);
      }));

  Widget _uploadedTile(MediaItem item) {
    final baseUrl = _apiClient.apiBaseUrl.replaceFirst('/api', '');
    return ClipRRect(borderRadius: BorderRadius.circular(16), child: Stack(fit: StackFit.expand, children: [
      item.type == 'photo' ? Image.network('$baseUrl${item.url}', fit: BoxFit.cover) : Container(color: const Color(0xFF201C1A), child: const Icon(Icons.play_circle_outline, color: Color(0xFFF6D4A7), size: 48)),
      Positioned(left: 10, bottom: 8, child: Text(item.type == 'video' ? 'VIDEO' : 'PHOTO', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2))),
    ]));
  }
}

class _PickedMedia {
  const _PickedMedia({required this.file, required this.bytes, required this.type});

  final XFile file;
  final Uint8List bytes;
  final String type;
}

class _EmptyMedia extends StatelessWidget {
  const _EmptyMedia();

  @override
  Widget build(BuildContext context) => Container(padding: const EdgeInsets.all(28), decoration: BoxDecoration(color: Colors.white.withValues(alpha: .65), borderRadius: BorderRadius.circular(20)), child: const Column(children: [Icon(Icons.collections_outlined, size: 36, color: Color(0xFFB8543F)), SizedBox(height: 10), Text('Your gallery is waiting', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF332B27))), SizedBox(height: 5), Text('Add a photo or video from your practice.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF75685F)))]));
}
