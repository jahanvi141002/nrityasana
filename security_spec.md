# Security Specification: Nrityasana Firestore ABAC & Rules

## 1. Data Invariants
1. **User Scope Isolation**: A user can only read, write, and update their own `/users/{userId}/*` subcollections (profile, progress, practice_logs, media, ai_generations). No practitioner can access another practitioner's private records or PII.
2. **Identity Integrity**: For all document creations, `request.auth.uid` must match the `userId` in the document and path variable. Authors cannot spoof sender IDs or user IDs.
3. **Admin Privilege Isolation**: Only verified administrators present in `/admins/{adminId}` can create, edit, or delete scheduled `/live_classes/{classId}` documents or broadcast official announcements.
4. **Attendee Synchronicity**: Dancers can only register or unregister their own UID as an attendee under `/live_classes/{classId}/attendees/{userId}`.
5. **Chat Message Integrity**:Dancers can only create chat messages where `senderId == request.auth.uid`. Reading messages is restricted to participants (sender or recipient) or broadcast messages where `recipientId == 'all'`.
6. **Boundary Limits**: All string fields and IDs are constrained with `isValidId()` and `.size()` limits to prevent Denial-of-Wallet attacks.
7. **Immutable Fields**: `id`, `userId`, `classId`, and `createdAt` cannot be modified during updates.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1 (Identity Spoofing - Profile)**: Non-admin practitioner attempts to write to `/users/victim_user_123/profile/main` with `{ "userId": "victim_user_123" }`. (Expected: PERMISSION_DENIED)
2. **Payload 2 (Ghost Field Injection)**: Practitioner sends practice log with unapproved key `{ "id": "log-1", "userId": "auth_user", "practiceId": "k-tatkar", "title": "Tatkar", "discipline": "Kathak", "minutesPracticed": 20, "completedAt": "2026-09-23T00:00:00Z", "isAdmin": true }`. (Expected: PERMISSION_DENIED)
3. **Payload 3 (Oversized Document ID)**: Attacker attempts to create practice log at an ID of 500 characters. (Expected: PERMISSION_DENIED)
4. **Payload 4 (Chat Sender Forgery)**: User 'attacker_uid' attempts to create a chat message with `"senderId": "guru_radhika"`. (Expected: PERMISSION_DENIED)
5. **Payload 5 (Unauthenticated Write)**: Unauthenticated visitor attempts to write to `/chat_messages/msg_1`. (Expected: PERMISSION_DENIED)
6. **Payload 6 (PII Snooping)**: User 'user_a' tries to read `/users/user_b/profile/main`. (Expected: PERMISSION_DENIED)
7. **Payload 7 (Live Class Hijacking)**: Regular student attempts to create or overwrite a `/live_classes/class_master` document. (Expected: PERMISSION_DENIED)
8. **Payload 8 (Attendee Impersonation)**: User 'user_a' tries to register 'user_b' into `/live_classes/c1/attendees/user_b`. (Expected: PERMISSION_DENIED)
9. **Payload 9 (Oversized Text Attack)**: Attacker tries to inject a 50,000 character string into a chat message text. (Expected: PERMISSION_DENIED)
10. **Payload 10 (Chat Message Snooping)**: User 'user_c' attempts to read a direct message between 'user_a' and 'user_b'. (Expected: PERMISSION_DENIED)
11. **Payload 11 (Immortal Field Tampering)**: User attempts to update `userId` or `practiceId` in an existing practice log. (Expected: PERMISSION_DENIED)
12. **Payload 12 (Self-Promoted Admin)**: User attempts to create a document in `/admins/{request.auth.uid}`. (Expected: PERMISSION_DENIED)
