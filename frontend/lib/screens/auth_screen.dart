import 'package:flutter/material.dart';
import '../models/user_session.dart';
import '../services/api_service.dart';
import '../theme.dart';

class AuthScreen extends StatefulWidget {
  final Function(UserSession) onLoginSuccess;

  const AuthScreen({Key? key, required this.onLoginSuccess}) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _emailController = TextEditingController(text: 'admin@nrityasana.com');
  final _passwordController = TextEditingController(text: 'admin1234');
  bool _isLoading = false;
  bool _isLoginMode = true;
  String? _errorMessage;

  Future<void> _handleAuth() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please enter both email and password.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final session = await ApiService.login(email, password);
      widget.onLoginSuccess(session);
    } catch (e) {
      setState(() => _errorMessage = 'Sign in failed. Check Spring Boot API on port 8080.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _fillCredentials(String email, String password) {
    _emailController.text = email;
    _passwordController.text = password;
    setState(() => _errorMessage = null);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo & Brand Header
                  Center(
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withOpacity(0.3),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.self_improvement,
                        color: Colors.white,
                        size: 36,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'nrityasana',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          color: AppTheme.primaryDark,
                          letterSpacing: -0.5,
                        ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Classical Dance, Sacred Movement & Ayurvedic Living',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                  ),
                  const SizedBox(height: 32),

                  // Auth Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppTheme.cardBorder),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Toggle Login / Register
                        Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFFFAF3F0),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.all(4),
                          child: Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => _isLoginMode = true),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    decoration: BoxDecoration(
                                      color: _isLoginMode ? Colors.white : Colors.transparent,
                                      borderRadius: BorderRadius.circular(10),
                                      boxShadow: _isLoginMode
                                          ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)]
                                          : null,
                                    ),
                                    child: Center(
                                      child: Text(
                                        'Sign In',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                          color: _isLoginMode ? AppTheme.primaryDark : AppTheme.textMuted,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => _isLoginMode = false),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    decoration: BoxDecoration(
                                      color: !_isLoginMode ? Colors.white : Colors.transparent,
                                      borderRadius: BorderRadius.circular(10),
                                      boxShadow: !_isLoginMode
                                          ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)]
                                          : null,
                                    ),
                                    child: Center(
                                      child: Text(
                                        'Register',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                          color: !_isLoginMode ? AppTheme.primaryDark : AppTheme.textMuted,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Error Banner
                        if (_errorMessage != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFFECACA)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline, color: Colors.red, size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _errorMessage!,
                                    style: const TextStyle(color: Color(0xFF991B1B), fontSize: 12),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Email Field
                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: InputDecoration(
                            labelText: 'Email Address',
                            prefixIcon: const Icon(Icons.mail_outline, size: 20),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                            filled: true,
                            fillColor: const Color(0xFFFAF3F0),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Password Field
                        TextFormField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: InputDecoration(
                            labelText: 'Password',
                            prefixIcon: const Icon(Icons.lock_outline, size: 20),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                            filled: true,
                            fillColor: const Color(0xFFFAF3F0),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Submit Button
                        ElevatedButton(
                          onPressed: _isLoading ? null : _handleAuth,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 0,
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : Text(
                                  _isLoginMode ? 'Enter Sanctuary' : 'Create Account',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Quick Demo Credentials (Teacher / Admin vs Student)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAF3F0),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppTheme.cardBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Quick Demo Credentials',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textMuted,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => _fillCredentials('admin@nrityasana.com', 'admin1234'),
                                icon: const Icon(Icons.shield_outlined, size: 16, color: AppTheme.primaryDark),
                                label: const Text(
                                  'Teacher (Admin)',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryDark),
                                ),
                                style: OutlinedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                  side: const BorderSide(color: AppTheme.primaryDark),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => _fillCredentials('user@nrityasana.com', 'admin1234'),
                                icon: const Icon(Icons.person_outline, size: 16, color: AppTheme.textMuted),
                                label: const Text(
                                  'Student (User)',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                                ),
                                style: OutlinedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                  side: const BorderSide(color: AppTheme.cardBorder),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
