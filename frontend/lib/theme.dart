import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primary = Color(0xFFB8543F); // Terracotta Earth
  static const Color primaryDark = Color(0xFF781D32); // Classical Burgundy
  static const Color secondary = Color(0xFFF6D4A7); // Warm Saffron
  static const Color background = Color(0xFFFDF8F5); // Warm Sacred Canvas
  static const Color cardBg = Colors.white;
  static const Color cardBorder = Color(0xFFF2E6E2);
  static const Color textMain = Color(0xFF1F161A);
  static const Color textMuted = Color(0xFF6B5C62);
  static const Color accentGreen = Color(0xFF059669);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        secondary: secondary,
        surface: background,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme().copyWith(
        displayLarge: GoogleFonts.cormorantGaramond(
          color: textMain,
          fontWeight: FontWeight.bold,
          fontSize: 32,
        ),
        displayMedium: GoogleFonts.cormorantGaramond(
          color: textMain,
          fontWeight: FontWeight.bold,
          fontSize: 26,
        ),
        titleLarge: GoogleFonts.cormorantGaramond(
          color: textMain,
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
        bodyLarge: GoogleFonts.plusJakartaSans(
          color: textMain,
          fontSize: 15,
        ),
        bodyMedium: GoogleFonts.plusJakartaSans(
          color: textMuted,
          fontSize: 13,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: background.withOpacity(0.95),
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        iconTheme: const IconThemeData(color: textMain),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: primary,
        unselectedItemColor: textMuted,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }
}
