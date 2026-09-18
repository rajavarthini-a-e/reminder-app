# MentorAI - System Architecture

MentorAI is an AI Accountability Mentor designed to bridge the gap between intention and execution. Rather than acting as a passive list of tasks, MentorAI continuously monitors progress, enforces accountability through escalating notifications, and requires topic-specific verification before granting task completion.

```mermaid
graph TD
    subgraph Frontend [React + Vite + TypeScript + Tailwind CSS]
        UI[Dashboard / Upload / Mentor Chat]
        Zustand[Zustand Store]
        Audio[Web Audio API Procedural Synth]
        Notif[Web Notification API]
        SSE_Client[EventSource SSE Subscriber]
    end

    subgraph Backend [Node.js + Express + TypeScript]
        API[Express REST API]
        Cron[node-cron Engine (1-min Tick)]
        ReminderEngine[Persistent Escalation Engine]
        ScoreEngine[Accountability Score Calculator]
        BehaviorEngine[AI Behavioral Memory]
        DocParser[PDF / DOCX / Markdown Parser]
        AILayer[OpenAI API Layer + Offline Engine]
    end

    subgraph Storage [SQLite Database]
        Prisma[(Prisma ORM: User, Goal, Milestone, Task, Reminder, Verification, Behavior)]
    end

    UI --> Zustand
    Zustand --> API
    SSE_Client <--|Real-time alerts| ReminderEngine
    Cron -->|Evaluates overdue| ReminderEngine
    ReminderEngine -->|Dispatches Level 1-4| Notif
    ReminderEngine -->|Plays audio frequencies| Audio
    API --> DocParser
    DocParser --> AILayer
    API --> ScoreEngine
    API --> BehaviorEngine
    API --> Prisma
    ReminderEngine --> Prisma
    ScoreEngine --> Prisma
```

---

## Key Subsystems

### 1. Persistent Escalation Engine
Traditional task managers notify the user once and stay quiet. In MentorAI, tasks that pass their scheduled time trigger persistent notifications that escalate in intensity every 15 minutes:

- **Level 1 (Friendly)**: Gentle harmonic chime (523Hz–659Hz). Positive encouragement.
- **Level 2 (Firm)**: Warning double beep (587Hz). Progress-focused reminder.
- **Level 3 (Strict)**: Urgent repeating staccato (740Hz–880Hz). No-nonsense tone.
- **Level 4 (Emergency)**: High-urgency oscillating sweep (600Hz–950Hz) + red glowing pulsing modal. Prevents user from sleeping before task is finished.

### 2. Mentor Verification Gate
When a user clicks "Done", the task is **not** immediately marked complete:
1. `POST /api/tasks/:id/verify-prompt` extracts the task topic and source context.
2. An AI question generator formulates a targeted challenge:
   - **LEARNING**: Explaining the mechanism (e.g. "Explain Star Schema vs Snowflake").
   - **CODING**: Query syntax, function logic, or time complexity.
   - **READING**: 3 actionable takeaways.
   - **WORKOUT**: Exercise breakdown, sets, reps, duration.
3. The user submits proof. If the answer is vague or trivial (e.g. "done", "yes"), the mentor rejects it.
4. Only upon passing is `completed = true` persisted, and milestone/goal progress rolled upward.

### 3. Accountability Score Algorithm
Calculates a real-time rating between 0 and 100:
$$\text{Score} = \text{Base}(70) + \Delta_{\text{streak}} + \Delta_{\text{completion}} + \Delta_{\text{verification}} - \Delta_{\text{overdue}} - \Delta_{\text{snoozes}} - \Delta_{\text{critical}}$$

- **Streak Bonus**: $+2$ per active day (capped at $+20$).
- **Completion Factor**: $\pm 10$ based on overall progress.
- **Verification Rigor**: $\pm 6$ based on challenge pass rate.
- **Overdue Penalty**: $-8$ per overdue pending task.
- **Snooze Penalty**: $-3$ per postponement logged.
- **Critical Penalty**: $-12$ per breached critical deadline.

### 4. AI Behavioral Memory
Tracks:
- Preferred study windows (e.g., automatically detecting evening study habit at 8:00 PM).
- High-friction subjects (recommending workload splitting for repeatedly delayed topics).
- Early completion rewards (unlocking tomorrow's lessons ahead of schedule).
