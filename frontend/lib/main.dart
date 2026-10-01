import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'models/user_session.dart';
import 'screens/auth_screen.dart';
import 'screens/main_navigation_screen.dart';
import 'theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const NrityasanaApp());
}

class NrityasanaApp extends StatefulWidget {
  const NrityasanaApp({Key? key}) : super(key: key);

  @override
  State<NrityasanaApp> createState() => _NrityasanaAppState();
}

class _NrityasanaAppState extends State<NrityasanaApp> {
  UserSession? _session;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkStoredSession();
  }

  Future<void> _checkStoredSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final dataStr = prefs.getString('nrityasana_flutter_session');
      if (dataStr != null) {
        final data = jsonDecode(dataStr);
        _session = UserSession.fromJson(data);
      }
    } catch (_) {}

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleLogin(UserSession session) async {
    setState(() => _session = session);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('nrityasana_flutter_session', jsonEncode(session.toJson()));
    } catch (_) {}
  }

  Future<void> _handleLogout() async {
    setState(() => _session = null);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('nrityasana_flutter_session');
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Nrityasana',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: _isLoading
          ? const Scaffold(
              backgroundColor: AppTheme.background,
              body: Center(
                child: CircularProgressIndicator(color: AppTheme.primary),
              ),
            )
          : (_session == null
              ? AuthScreen(onLoginSuccess: _handleLogin)
              : MainNavigationScreen(
                  session: _session!,
                  onLogout: _handleLogout,
                )),
    );
  }
}
