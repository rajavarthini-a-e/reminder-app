# MentorAI - Installation & Setup Guide

This guide walks you through running MentorAI locally.

## Prerequisites
- **Node.js**: v18.0.0 or later (v20+ or v24+ recommended)
- **npm**: v9.0.0 or later

---

## 1-Minute Quickstart

Clone or navigate to the repository directory:
```bash
cd mentor-os
```

### Install All Dependencies
```bash
npm run install:all
```
*This installs root, backend, and frontend packages.*

### Initialize & Seed Database
```bash
npm run prisma:push
npm run prisma:seed
```
*This creates the SQLite database (`dev.db`) and seeds the realistic 60-Day Data Analyst roadmap.*

### Start Full-Stack App
```bash
npm run dev
```

Your app will launch at:
- **Frontend Dashboard**: `http://localhost:5173`
- **Backend API & Scheduler**: `http://localhost:5000`

---

## Environment Configuration (`.env`)

Copy `.env.example` to `.env` or create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"

# Optional: Set your OpenAI API key for online LLM models (e.g. gpt-4o-mini)
# If left empty, MentorAI operates seamlessly using its built-in offline heuristic engine!
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini

# Webhook notification bridge (optional)
NOTIFICATION_WEBHOOK_URL=
```

---

## Running Individual Subsystems

### Run Backend Only
```bash
cd backend
npm run dev
```

### Run Frontend Only
```bash
cd frontend
npm run dev
```

### Compile for Production
```bash
npm run build
```
