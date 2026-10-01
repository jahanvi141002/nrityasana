# Nrityasana Flutter Frontend (Mobile & Web)

A full-featured Flutter application for **Nrityasana** (Classical Dance, Yoga, Mindful Movement & Ayurvedic Wellness) built to interface seamlessly with the **Spring Boot Java REST API** running on `http://localhost:8080`.

## Architecture & Integration

- **Java Backend:** Spring Boot on `http://localhost:8080` (Spring Security, JWT, MySQL 8.0 DataSource)
- **Flutter Client:** Cross-platform (Android, iOS, Web, Desktop)
- **State Management:** Clean Service Pattern with `ApiService` (`http` package) & `SharedPreferences`
- **Typography & Theme:** Natyashastra Terracotta (`#B8543F`), Deep Burgundy (`#781D32`), Cormorant Garamond & Plus Jakarta Sans

## Folder Structure

```
frontend/
├── lib/
│   ├── main.dart                      # App entry point, session loader, MaterialApp
│   ├── theme.dart                     # Natyashastra color palette & typography
│   ├── models/
│   │   ├── user_session.dart          # UserSession (role: ADMIN / USER)
│   │   ├── practice.dart              # Practices across 6 disciplines
│   │   ├── live_class.dart            # Live masterclasses & Google Meet links
│   │   ├── diet_plan.dart             # Ayurvedic nutrition plans with macros
│   │   └── chat_message.dart          # Guru & Sangha messaging (WhatsApp API)
│   ├── services/
│   │   └── api_service.dart           # Communicates with Spring Boot backend at http://localhost:8080/api
│   └── screens/
│       ├── auth_screen.dart           # Sign In / Register with 1-click Teacher/Student demo buttons
│       ├── main_navigation_screen.dart# Top App Bar with Admin badge & 6 Bottom Navigation tabs
│       ├── home_screen.dart           # "Come back to your rhythm", Daily Sankalpa, Hero card
│       ├── explore_screen.dart        # Practices filter + Ayurvedic Diet plans modal
│       ├── live_classes_screen.dart   # Live classes countdown, Join with Google Meet, Admin Scheduler
│       ├── chat_screen.dart           # Guru Radhika 1-on-1 chat with WhatsApp API integration
│       ├── progress_screen.dart       # 5-day streak tracker, consistency score, discipline breakdown
│       ├── me_screen.dart             # Profile, role pill, Spring Boot status, Sign out
│       └── active_practice_modal.dart # Countdown timer player with movement instructions checklist
└── pubspec.yaml                       # Dependencies: http, intl, google_fonts, shared_preferences, url_launcher
```

## How to Run with Spring Boot Backend

### 1. Start the Spring Boot Backend (Java 17/21+)
```powershell
cd backend
mvn spring-boot:run
```
Backend runs on port `8080` and connects to MySQL `nrityasana`.

### 2. Run Flutter
```powershell
cd frontend
flutter pub get

# For Web:
flutter run -d chrome

# For Android:
flutter run -d emulator
```

### 3. Log In
- **Teacher (Admin):** `admin@nrityasana.com` / `admin1234`
- **Student (Practitioner):** `user@nrityasana.com` / `admin1234`
