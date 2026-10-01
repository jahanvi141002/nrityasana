import 'dart:async';
import 'package:flutter/material.dart';
import '../models/practice.dart';
import '../theme.dart';

class ActivePracticeModal extends StatefulWidget {
  final Practice practice;
  final VoidCallback onClose;

  const ActivePracticeModal({
    Key? key,
    required this.practice,
    required this.onClose,
  }) : super(key: key);

  @override
  State<ActivePracticeModal> createState() => _ActivePracticeModalState();
}

class _ActivePracticeModalState extends State<ActivePracticeModal> {
  late int _remainingSeconds;
  bool _isPlaying = true;
  Timer? _timer;
  final Set<int> _completedSteps = {};

  @override
  void initState() {
    super.initState();
    _remainingSeconds = widget.practice.minutes * 60;
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_remainingSeconds > 0 && _isPlaying) {
        setState(() => _remainingSeconds--);
      } else if (_remainingSeconds <= 0) {
        _timer?.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _timerFormatted {
    final mins = _remainingSeconds ~/ 60;
    final secs = _remainingSeconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text(
          widget.practice.discipline,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: widget.onClose,
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Timer Display
              Center(
                child: Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.primary, width: 4),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primary.withOpacity(0.15),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _timerFormatted,
                        style: const TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryDark,
                          letterSpacing: -1,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _isPlaying ? 'IN PRACTICE' : 'PAUSED',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textMuted,
                          letterSpacing: 1,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Play / Pause Controls
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton.filled(
                    onPressed: () => setState(() => _isPlaying = !_isPlaying),
                    icon: Icon(_isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded),
                    style: IconButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      iconSize: 32,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Title & Description
              Text(
                widget.practice.title,
                textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: AppTheme.textMain),
              ),
              const SizedBox(height: 6),
              Text(
                widget.practice.description,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppTheme.textMuted, fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 24),

              // Movement Steps Checklist
              if (widget.practice.instructions.isNotEmpty) ...[
                const Text(
                  'Movement Sequence & Focus Steps',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.textMain),
                ),
                const SizedBox(height: 12),
                ...widget.practice.instructions.asMap().entries.map((entry) {
                  final idx = entry.key;
                  final step = entry.value;
                  final isDone = _completedSteps.contains(idx);

                  return InkWell(
                    onTap: () {
                      setState(() {
                        if (isDone) {
                          _completedSteps.remove(idx);
                        } else {
                          _completedSteps.add(idx);
                        }
                      });
                    },
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isDone ? AppTheme.accentGreen : AppTheme.cardBorder,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                            color: isDone ? AppTheme.accentGreen : AppTheme.textMuted,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              step,
                              style: TextStyle(
                                fontSize: 13,
                                color: isDone ? AppTheme.textMuted : AppTheme.textMain,
                                decoration: isDone ? TextDecoration.lineThrough : null,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 24),
              ],

              // Complete Button
              ElevatedButton(
                onPressed: widget.onClose,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryDark,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Complete Practice & Return', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
