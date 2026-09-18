# Nrityasana

Nrityasana is a calm practice companion for yoga and Indian classical dance. It combines movement sessions, daily intentions, practice tracking, and a small Java API.

## Project structure

- `frontend/` Flutter mobile client
- `backend/` Spring Boot Java REST API

## Run the API

```powershell
cd backend
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

## Run the Flutter client

Flutter is required locally. From the repository root:

```powershell
flutter create frontend
# keep the generated platform folders and replace/update the Dart files from this repo
cd frontend
flutter pub get
flutter run
```

The client currently uses local seed data so it is useful offline. Set `apiBaseUrl` in `lib/core/api_client.dart` when connecting it to the Java API.
