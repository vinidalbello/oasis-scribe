# 🏥 OASIS Scribe - AI Healthcare Documentation System

Complete system for automatic transcription of medical audio and OASIS Section G field population using **real AI** (Whisper + Ollama).

## 🚀 Quick Start

### First Time Setup (Only Once)
```bash
npm run setup
```
This will:
- Install all dependencies (root, frontend, backend)
- Download Whisper AI models
- Start the database

### Daily Development
```bash
npm start
```
This starts both the database and development servers.

**Access:** http://localhost:5173

## 📋 Prerequisites

Make sure you have installed:
- **Node.js 18+**
- **Docker**
- **Ollama**

### Installing Ollama CLI

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [ollama.com/download](https://ollama.com/download)

**Alternative (all platforms):**
```bash
# Using npm
npm install -g ollama
```

## 🛠️ Environment Setup

### 1. Setup Ollama
```bash
# Start Ollama (keep running)
ollama serve

# Download model (another terminal tab)
ollama pull llama3.2:1b
```

### 2. Create Environment File
Create `backend/.env`:
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oasis_scribe
DB_USER=postgres
DB_PASSWORD=postgres123

# Server
PORT=3001
NODE_ENV=development

# AI
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
WHISPER_MODEL=base.en

# AWS S3 (Required)
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

## 🔧 Available Commands

```bash
# Setup & Development
npm run setup           # First-time setup (install + models + database)
npm start              # Start database + development servers
npm run dev            # Start development servers only

# Database Management
npm run docker:start   # Start database
npm run docker:stop    # Stop database
npm run docker:reset   # Reset database (clears data)
npm run db:status      # Check database status
```

## 🧪 Testing

1. Run `npm start`
2. Open http://localhost:5173
3. Select a patient
4. Upload audio file (MP3, WAV, M4A)
5. Wait for AI processing (~1-3 minutes)
6. View transcription + OASIS analysis

## 🚨 Troubleshooting

```bash
# Check services
curl http://localhost:3001/health    # Backend
curl http://localhost:11434/api/tags # Ollama
npm run db:status                    # Database

# Reset if needed
npm run docker:reset                 # Reset database
```

## 🎯 Key Features

### ✅ Real AI Processing
- **Whisper**: Speech-to-text transcription
- **Ollama LLaMA 3.2**: Medical text analysis
- **FFmpeg**: Automatic audio conversion
- **AWS S3**: File storage

### ✅ Modern Stack
- **Backend**: Node.js + TypeScript + Express + PostgreSQL
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **AI/ML**: Whisper + Ollama + FFmpeg

### ✅ Complete System
- Multiple audio formats (MP3, WAV, M4A, WEBM, OGG)
- Asynchronous processing with real-time updates
- Clean architecture with repository pattern
- Production-ready error handling

## 📁 Project Structure

```
oasis-scribe/
├── package.json           # Root scripts
├── backend/               # Node.js API
│   ├── src/
│   │   ├── entities/     # Database entities
│   │   ├── repositories/ # Data access
│   │   ├── services/     # Business logic
│   │   │   ├── WhisperTranscriptionService.ts
│   │   │   ├── OllamaAIService.ts
│   │   │   ├── S3Service.ts
│   │   │   └── NoteProcessingService.ts
│   │   ├── routes/       # API endpoints
│   │   └── database/     # DB config
├── frontend/             # React app
│   └── src/
│       ├── components/
│       └── App.tsx
└── docker-compose.db.yml # PostgreSQL
```

---

🚀 **Production-ready healthcare system with simplified setup!** 
