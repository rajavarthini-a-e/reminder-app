# MentorAI - REST API Documentation

Base URL: `http://localhost:5000` (or configured `PORT`)

---

## 1. Dashboard & State

### `GET /api/dashboard`
Fetches complete dashboard state including primary goal, timeline day, today's mission, streaks, accountability score, and active reminders.

#### Response (`200 OK`)
```json
{
  "user": {
    "id": "usr_default_01",
    "name": "Alex Rivera",
    "timezone": "America/New_York"
  },
  "goalProgress": 60.0,
  "currentDay": 15,
  "totalDays": 60,
  "todayMission": {
    "id": "task_123",
    "title": "Learn SQL GROUP BY, HAVING & Aggregations",
    "estimatedMinutes": 45,
    "priority": "HIGH",
    "verificationType": "CODING",
    "activeEscalationLevel": 4
  },
  "streak": { "current": 5, "best": 12 },
  "score": {
    "score": 74,
    "grade": "B",
    "breakdown": [
      { "factor": "5-Day Streak", "impact": 10, "type": "bonus" },
      { "factor": "Unresolved Overdue Tasks", "impact": -8, "type": "penalty" }
    ]
  },
  "activeReminders": []
}
```

---

## 2. Tasks

### `GET /api/tasks/today`
Returns all tasks scheduled for today or currently overdue.

### `POST /api/tasks/:id/start`
Marks task as actively started and acknowledges pending notifications.

### `POST /api/tasks/:id/snooze`
Defers reminders for the given duration.
#### Body
```json
{
  "minutes": 20
}
```

### `POST /api/tasks/:id/verify-prompt`
Generates a strict topic-specific question based on uploaded curriculum context.
#### Response (`200 OK`)
```json
{
  "taskId": "task_123",
  "verificationId": "verif_456",
  "taskTitle": "Learn SQL GROUP BY, HAVING & Aggregations",
  "verificationType": "CODING",
  "question": "Explain why the HAVING clause exists when SQL already has WHERE. Provide an example query that groups by department and filters for average salary > 75000."
}
```

### `POST /api/tasks/:id/verify`
Submits user proof for mentor evaluation. Only marks completed if the response passes strict grading criteria.
#### Body
```json
{
  "answer": "HAVING filters aggregate groups whereas WHERE filters individual rows...",
  "question": "Explain why the HAVING clause exists...",
  "verificationId": "verif_456"
}
```
#### Response (`200 OK`)
```json
{
  "success": true,
  "passed": true,
  "score": 95,
  "feedback": "Verification approved. Your explanation demonstrates active synthesis and grasp of the core concepts.",
  "message": "Mastery verified! Task marked completed."
}
```

---

## 3. Plan Upload & Parsing

### `POST /api/upload-plan`
Accepts multipart file upload (`.pdf`, `.docx`, `.md`, `.txt`) or raw `planText` in JSON body.
#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "goal": "Become Data Analyst",
    "duration": 60,
    "milestones": [
      {
        "title": "Milestone 1: Relational Database & Advanced SQL",
        "tasks": [
          {
            "title": "SQL SELECT & Filtering Fundamentals",
            "estimatedMinutes": 45,
            "priority": "MEDIUM",
            "verificationType": "LEARNING",
            "topic": "SQL SELECT"
          }
        ]
      }
    ]
  }
}
```

### `POST /api/goals/save-plan`
Persists verified plan structure into Goal, Milestones, and Tasks in SQLite.

---

## 4. Interactive Mentor Chat

### `GET /api/mentor/chat`
Retrieves chat history.

### `POST /api/mentor/chat`
Sends a message to the strict AI mentor persona.
#### Body
```json
{
  "text": "Done with today's SQL practice."
}
```
#### Response (`200 OK`)
```json
{
  "userMessage": { "id": "1", "sender": "user", "text": "Done with today's SQL practice." },
  "mentorMessage": {
    "id": "2",
    "sender": "mentor",
    "text": "You claim you are finished. Prove it.\n\n👉 Explain why HAVING exists when SQL already has WHERE.",
    "actionRequired": "VERIFY"
  },
  "actionRequired": "VERIFY",
  "verificationQuestion": "Explain why HAVING exists..."
}
```

---

## 5. Reminders & Live Streams

### `GET /api/reminders/stream`
Server-Sent Events (SSE) endpoint broadcasting live reminder events to connected clients.

### `POST /api/reminders/test-alert`
Simulates instant escalation alerts (Levels 1 to 4) for testing sound and visual cues.
```json
{
  "level": 4
}
```
