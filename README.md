# 🏥 OASIS Scribe - Medical Audio Transcription & Analysis System

Complete system for automatic transcription of medical audio and OASIS Section G field population using **real AI** (Whisper + Ollama).

## 🎯 **Overview**

Healthcare documentation system that automatically transcribes medical consultations and fills OASIS (Outcome and Assessment Information Set) Section G forms using real AI processing.

**Main Flow:**
1. **Audio Upload** (MP3, WAV, M4A)
2. **Real Transcription** with Whisper (OpenAI)
3. **Intelligent Analysis** with Ollama (LLaMA 3.2)
4. **Automatic Field Population** for OASIS assessments
5. **Visualization** of transcription and structured data

## 🚀 **Technologies Used**

### **Backend**
- **Node.js** + **TypeScript** + **Express**
- **PostgreSQL** (database)
- **Whisper** (real audio transcription)
- **Ollama** (LLaMA 3.2 for analysis)
- **FFmpeg** (automatic audio conversion)
- **AWS S3** (audio storage)

### **Frontend**
- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** (styling)

### **AI/ML**
- **whisper-node** (audio transcription)
- **Ollama** (text analysis and data extraction)
- **FFmpeg** (automatic format conversion)

## 📋 **Prerequisites**

Make sure you have installed:
- **Node.js 18+**
- **Docker**
- **FFmpeg**
- **Python 3.8+**
- **Ollama**

## 🛠️ **Quick Setup**

### **1. Clone & Install**
```bash
git clone <repository-url>
cd GetLimeAI
npm run install:all
```

### **2. Start Database**
```bash
npm run docker:start
```

### **3. Setup AI Models**
```bash
# Start Ollama (keep running)
ollama serve &

# Download models
ollama pull llama3.2:1b
cd backend && npx whisper-node download && cd ..
```

### **4. Environment Setup**
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

### **5. Initialize Database**
```bash
cd backend && npm run build && node dist/database/init.js && cd ..
```

### **6. Run Application**
```bash
npm run dev
```

**Access:** http://localhost:5173

## 🧪 **Testing**

1. Open http://localhost:5173
2. Select a patient
3. Upload audio file (MP3, WAV, M4A)
4. Wait for AI processing (~1-3 minutes)
5. View transcription + OASIS analysis

## 🔧 **Available Commands**

```bash
# Setup
npm run install:all      # Install all dependencies
npm run docker:start     # Start database
npm run docker:stop      # Stop database
npm run docker:reset     # Reset database

# Development
npm run dev             # Run full system
npm run dev:backend     # Backend only
npm run dev:frontend    # Frontend only

# Database
npm run db:status       # Check database
npm run docker:logs     # View database logs

# AI
ollama serve            # Start Ollama
ollama list             # List models
ollama pull llama3.2:1b # Download model
```

## 🚨 **Troubleshooting**

```bash
# Kill ports
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:11434 | xargs kill -9 # Ollama

# Check services
curl http://localhost:3001/health    # Backend
curl http://localhost:11434/api/tags # Ollama
npm run db:status                    # Database

# Reset database
npm run docker:reset

# Re-download Whisper
cd backend && rm -rf node_modules/.whisper && npx whisper-node download
```

## 📁 **Project Structure**

```
GetLimeAI/
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

## 🎯 **Key Features**

### **✅ Real AI**
- **Whisper**: Real speech-to-text
- **Ollama LLaMA 3.2**: Medical text analysis
- **FFmpeg**: Audio conversion
- **AWS S3**: File storage

### **✅ Complete System**
- Multiple audio formats (MP3, WAV, M4A, WEBM, OGG)
- Asynchronous processing
- Real-time updates
- PostgreSQL database
- RESTful API

### **✅ Clean Architecture**
- Repository Pattern
- Service Layer
- Strict TypeScript
- Error handling
- AWS S3 integration

### **✅ Modern Stack**
- React 18 + hooks
- TypeScript strict mode
- Tailwind CSS
- Vite build
- Docker database

## 🎯 **Demo**

This project demonstrates:
1. **Real AI Integration** (Whisper + Ollama)
2. **Full-Stack Architecture**
3. **Clean Code** implementation
4. **Production-Ready System**
5. **Healthcare Application**

**Setup time:** ~15 minutes  
**Demo time:** ~5 minutes

---

🚀 **Production-ready healthcare system with real AI processing!** 