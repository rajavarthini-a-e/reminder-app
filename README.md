# MentorAI 🛡️

> **An AI Accountability Mentor that acts like a strict personal coach.**
> It doesn't just list tasks—it continuously reminds you until you execute, understands your uploaded roadmaps (PDF, Word, Markdown), and strictly verifies your mastery before anything is checked off.

![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)
![React](https://img.shields.io/badge/React-18.3-cyan.svg)
![Express](https://img.shields.io/badge/Express-4.21-white.svg)
![Prisma](https://img.shields.io/badge/Prisma-SQLite-indigo.svg)

---

## ⚡ Quick Start

```bash
# 1. Install all dependencies
npm run setup

# 2. Launch full-stack app
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API & Scheduler**: `http://localhost:5000`

---

## 🎯 Key Features

1. **Upload Roadmap**: Upload PDF, DOCX, Markdown, or paste ChatGPT study plans. Extracts Goal, Duration, Milestones, and Daily Tasks with estimated durations.
2. **Persistent Escalation Engine**: Reminders never disappear when ignored. They escalate through 4 distinct levels:
   - **Level 1 (Friendly)**: Gentle encouragement chime.
   - **Level 2 (Firm)**: Progress warning pulse.
   - **Level 3 (Strict)**: Urgent repeating alert.
   - **Level 4 (Emergency)**: Full red-glowing siren alert to finish before sleeping.
3. **Mentor Verification Mode**: Clicking "Done" will **never** immediately check off a task. The mentor asks a topic-grounded challenge question (code, takeaways, or concepts) and verifies your answer before marking complete.
4. **Accountability Score (0-100)**: Real-time rating dynamically factoring streaks, overdue delays, verification rigor, and critical deadline adherence.
5. **Goal Hierarchy**: Rollup progress: $\text{Goal} \rightarrow \text{Milestone} \rightarrow \text{Task}$.
6. **AI Behavioral Memory**: Learns habitual study times (e.g. 8:00 PM), splits friction-heavy tasks, and unlocks lessons early for fast execution.
7. **Procedural Web Audio Alerts**: Built-in harmonic frequencies via Web Audio API oscillators—no missing MP3 files.
8. **Modular Notification Service**: Ready for WhatsApp, Telegram, Discord, and Slack integrations.

---

## 📁 Project Structure

```
mentor-os/
├── frontend/             # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Dashboard widgets, Verification modal, Escalation banner
│   │   ├── pages/        # Landing, Dashboard, Upload, Mentor Chat
│   │   ├── services/     # API client, Web Audio synth, Browser notifications
│   │   └── store/        # Zustand state store
├── backend/              # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/       # Dashboard, Tasks, Plans, Mentor, Reminders
│   │   └── services/     # AI layer, Parser, Scheduler, Reminder, Score, Behavior
├── prisma/               # Prisma SQLite schema & realistic seed dataset
├── shared/               # Shared TypeScript types and interfaces
└── docs/                 # Architecture, API specifications, and Future roadmap
```

---

## 📖 Documentation

- [Project Architecture](./docs/ARCHITECTURE.md)
- [REST API Reference](./docs/API.md)
- [Installation Guide](./docs/INSTALLATION.md)
- [Future Roadmap & Integrations](./docs/ROADMAP.md)
