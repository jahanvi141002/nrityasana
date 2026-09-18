import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'core/api_client.dart';
import 'main.dart' show HomeScreen;

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  static const _googleClientId = String.fromEnvironment('GOOGLE_CLIENT_ID');

  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _apiClient = const ApiClient();
  bool _isLogin = true;
  bool _isBusy = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isBusy = true;
      _error = null;
    });
    try {
      final session = _isLogin
          ? await _apiClient.login(_emailController.text.trim(), _passwordController.text)
          : await _apiClient.register(_emailController.text.trim(), _passwordController.text);
      _openHome(session);
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  Future<void> _signInWithGoogle() async {
    setState(() {
      _isBusy = true;
      _error = null;
    });
    try {
      if (_googleClientId.isEmpty) {
        throw Exception('Google sign-in is not configured. Start Flutter with --dart-define=GOOGLE_CLIENT_ID=your-client-id.');
      }
      final account = await GoogleSignIn(
        clientId: _googleClientId,
        scopes: ['email'],
      ).signIn();
      if (account == null) return;
      final authentication = await account.authentication;
      final idToken = authentication.idToken;
      if (idToken == null) throw Exception('Google did not return an identity token');
      final session = await _apiClient.loginWithGoogle(idToken);
      _openHome(session);
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  void _openHome(AuthSession session) {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => HomeScreen(session: session)));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 430),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(color: const Color(0xFF201C1A), borderRadius: BorderRadius.circular(18)),
                    child: const Icon(Icons.self_improvement, color: Color(0xFFF6D4A7), size: 30),
                  ),
                  const SizedBox(height: 24),
                  Text(_isLogin ? 'Welcome back' : 'Begin your practice', style: theme.textTheme.displaySmall),
                  const SizedBox(height: 8),
                  Text(_isLogin ? 'Return to your rhythm.' : 'Create a quiet space for movement.', style: theme.textTheme.bodyLarge),
                  const SizedBox(height: 30),
                  if (_error != null) ...[
                    Text(_error!, style: TextStyle(color: theme.colorScheme.error)),
                    const SizedBox(height: 12),
                  ],
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          autofillHints: const [AutofillHints.email],
                          decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.mail_outline)),
                          validator: (value) => value == null || !value.contains('@') ? 'Enter a valid email' : null,
                        ),
                        const SizedBox(height: 14),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: true,
                          autofillHints: const [AutofillHints.password],
                          decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock_outline)),
                          validator: (value) => value == null || value.length < 8 ? 'Use at least 8 characters' : null,
                        ),
                        const SizedBox(height: 22),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: _isBusy ? null : _submit,
                            child: Text(_isLogin ? 'Sign in' : 'Create account'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(children: [const Expanded(child: Divider()), Padding(padding: const EdgeInsets.symmetric(horizontal: 12), child: Text('or', style: theme.textTheme.bodyMedium)), const Expanded(child: Divider())]),
                  const SizedBox(height: 18),
                  OutlinedButton.icon(
                    onPressed: _isBusy ? null : _signInWithGoogle,
                    icon: const Icon(Icons.account_circle_outlined),
                    label: const Text('Continue with Google'),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: _isBusy ? null : () => setState(() {
                      _isLogin = !_isLogin;
                      _error = null;
                    }),
                    child: Text(_isLogin ? 'New here? Create an account' : 'Already have an account? Sign in'),
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
