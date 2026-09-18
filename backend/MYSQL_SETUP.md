# MySQL Setup

The backend now persists users, direct chat messages, live classes and attendees, media metadata, and profile-picture URLs through JDBC/MySQL. Uploaded media files remain on disk under `uploads/`.

## Local development

From the `backend` directory:

```powershell
docker compose up -d mysql
```

The included compose file creates:

- Database: `nrityasana`
- Username: `nrityasana`
- Password: `nrityasana-dev-password`
- Port: `3306`

Start the backend with the matching configuration:

```powershell
$env:MYSQL_URL = 'jdbc:mysql://localhost:3306/nrityasana?createDatabaseIfNotExist=true&serverTimezone=UTC'
$env:MYSQL_USERNAME = 'nrityasana'
$env:MYSQL_PASSWORD = 'nrityasana-dev-password'
mvn spring-boot:run
```

Spring Boot runs `schema.sql` on startup and creates the required tables. Do not use the development passwords in production.

## Production

Set these variables through the deployment secret store:

- `MYSQL_URL`
- `MYSQL_USERNAME`
- `MYSQL_PASSWORD`

The schema is initialized with `CREATE TABLE IF NOT EXISTS`; use a migration tool such as Flyway before production schema evolution.
