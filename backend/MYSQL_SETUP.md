# Nrityasana MySQL & JDBC Database Guide

The application connects to MySQL via JDBC (in Spring Boot) and `mysql2` connection pooling (in the Node full-stack runner).

## 1. Quick Local Setup with Docker

Start MySQL container:
```bash
docker compose -f backend/docker-compose.yml up -d
```

This starts:
- Database: `nrityasana`
- User: `nrityasana`
- Password: `nrityasana-dev-password`
- Port: `3306`

## 2. JDBC Connection URL

```text
jdbc:mysql://localhost:3306/nrityasana?createDatabaseIfNotExist=true&serverTimezone=UTC
```

## 3. Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `MYSQL_HOST` | Database server hostname | `localhost` |
| `MYSQL_PORT` | MySQL connection port | `3306` |
| `MYSQL_DATABASE` | Database name | `nrityasana` |
| `MYSQL_USER` | Database username | `nrityasana` |
| `MYSQL_PASSWORD` | Database password | `nrityasana-dev-password` |
| `MYSQL_URL` | Complete JDBC URL | `jdbc:mysql://localhost:3306/nrityasana` |

## 4. Tables Initialized by Schema

1. `users` — Authentication, roles, and created timestamps
2. `chat_messages` — Direct messages, sender/recipient metadata, indexed threads
3. `live_classes` — Scheduled live yoga & dance classes with meeting links
4. `class_attendees` — User enrollment in live classes
5. `media_items` — Practice videos, audio mantras, poses
6. `profiles` — User profile pictures, phone numbers, and bios
