# MentorAI - Future Roadmap

MentorAI is engineered with modular abstractions so that extending to external notification channels and autonomous features is seamless.

---

## 1. External Notification Channels

MentorAI's `INotificationChannel` interface in `backend/src/services/notification/notification.interface.ts` is ready for the following integrations:

### WhatsApp Integration (Twilio / Meta Business API)
- Receive escalating WhatsApp reminders directly on mobile.
- Respond with "DONE" via WhatsApp to receive the verification question over text.
- Reply with the answer via text or voice note, verified by Whisper + LLM.

### Telegram Bot Integration
- Telegram bot webhook forwarding escalating alerts to a private chat or accountability group.
- Inline keyboard buttons: `[✅ Verify Now]`, `[⏳ Snooze 20m]`, `[🚨 Emergency Ack]`.

### Discord / Slack Webhooks
- Post public accountability score drops to a group channel when critical milestones are breached.

---

## 2. Voice Mentor (Audio Conversations)
- WebRTC / WebSocket streaming voice dialog replicating a strict personal coach.
- Spoken challenge questions requiring the user to verbally explain concepts.

---

## 3. GitHub & Calendar Webhook Sync
- Automatic verification for coding tasks by detecting merged GitHub Pull Requests.
- Two-way Google Calendar / Apple Calendar sync with scheduled study windows.
