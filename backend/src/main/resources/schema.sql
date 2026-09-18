CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    sender_id VARCHAR(36) NOT NULL,
    sender_email VARCHAR(254) NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    recipient_id VARCHAR(36) NOT NULL,
    recipient_email VARCHAR(254) NOT NULL,
    message_text VARCHAR(500) NOT NULL,
    sent_at TIMESTAMP(6) NOT NULL,
    INDEX idx_chat_thread (sender_id, recipient_id, sent_at)
);

CREATE TABLE IF NOT EXISTS live_classes (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    start_time DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    meeting_url VARCHAR(2048) NOT NULL,
    created_by VARCHAR(254) NOT NULL
);

CREATE TABLE IF NOT EXISTS class_attendees (
    class_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, user_id)
);

CREATE TABLE IF NOT EXISTS media_items (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_media_user (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id VARCHAR(100) PRIMARY KEY,
    profile_picture_url VARCHAR(2048),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);