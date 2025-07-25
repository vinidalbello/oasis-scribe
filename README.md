# OASIS Scribe - Healthcare Documentation System

An AI-powered audio transcription and analysis system for OASIS Section G assessments using Node.js, React, PostgreSQL, and Ollama.

## System Requirements

- Node.js 18+ and npm
- Docker 20.10+ (for PostgreSQL only)
- Git

## Architecture Overview

- **Frontend**: React + TypeScript + Vite + TailwindCSS (runs locally)
- **Backend**: Node.js + Express + TypeScript (runs locally)
- **Database**: PostgreSQL (runs in Docker)
- **AI Processing**: Ollama (local installation)
- **File Storage**: AWS S3

## Quick Setup Guide

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd oasis-scribe

# Install all dependencies (root, frontend, and backend)
npm run install:all
```

### Step 2: Database Setup (Docker)

```bash
# Start PostgreSQL in Docker
npm run docker:start

# Wait a few seconds for the database to initialize, then check status
npm run db:status
```

### Step 3: Configure Environment Variables

**Backend Environment (.env file):**

Create `backend/.env` with:

```env
# Database Configuration (local connection to Docker PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oasis_scribe
DB_USER=postgres
DB_PASSWORD=postgres123

# Server Configuration
PORT=3001
NODE_ENV=development

# AWS S3 Configuration (required for audio file storage)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=oasis-audio-storage (s3_name_here)

# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

### Step 4: Setup Ollama (AI Service)

**For macOS:**
```bash
# Install via Homebrew (recommended)
brew install ollama
```

**For Linux:**
```bash
# Install via curl
curl -fsSL https://ollama.ai/install.sh | sh
```

**For Windows:**
```bash
# Download from https://ollama.ai/download/windows
```

**Pull and verify the model:**
```bash
# Pull the required model
ollama pull llama3.2

# Verify Ollama is running
curl http://localhost:11434/api/tags
```

### Step 5: Setup AWS S3

1. **Create S3 Bucket:**
   - Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
   - Create a new bucket (e.g., `oasis-audio-storage`)
   - Set region to `us-east-1` (or update `.env` accordingly)

2. **Create IAM User:**
   - Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
   - Create a new user with programmatic access
   - Attach `AmazonS3FullAccess` policy
   - Copy the Access Key ID and Secret Access Key to your `.env` file

### Step 6: Start the Application

```bash
# Start the application (all services)
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Database**: PostgreSQL in Docker (localhost:5432)

## Available Commands

### Application Commands
```bash
npm run dev          # Start frontend and backend
npm run dev:frontend # Start only frontend
npm run dev:backend  # Start only backend
```

### Database Commands
```bash
npm run docker:start # Start PostgreSQL container
npm run docker:stop  # Stop PostgreSQL container
npm run docker:reset # Reset database (delete all data)
npm run docker:logs  # View database logs
npm run db:status    # Check database status
```

## Environment Configuration

### Database Connection
The application uses PostgreSQL running in Docker. The database runs on `localhost:5432` and connects to your local backend.

### AWS S3 Setup (Important!)
Audio files are stored in AWS S3. You MUST configure your AWS credentials in `backend/.env`:

1. **Access Key ID**: Your AWS programmatic access key
2. **Secret Access Key**: Your AWS secret (shown only once when created)
3. **Bucket Name**: The S3 bucket you created
4. **Region**: The AWS region where your bucket is located

### Ollama Configuration
The AI service requires Ollama running locally with the `llama3.2:3b` model. The system will connect to `http://localhost:11434`.

## Verification Steps

1. **Check Database**: `npm run db:status`
2. **Check Ollama**: `curl http://localhost:11434/api/tags`
3. **Check S3**: Upload a test audio file through the web interface
4. **Check Application**: Visit http://localhost:5173

## Usage Instructions

1. **Access the application** at http://localhost:5173
2. **Select a patient** from the dropdown (patients are pre-loaded)
3. **Upload an audio file** (MP3, WAV, M4A, etc.)
4. **Submit for processing** - the AI will:
   - Transcribe the audio
   - Extract OASIS Section G assessments
   - Generate a summary
5. **View results** in the Patient Notes section
6. **Click on any note** to view detailed OASIS assessments

## Troubleshooting

### Common Issues

**"Database connection failed"**
```bash
# Check if PostgreSQL container is running
npm run db:status

# If not running, start it
npm run docker:start
```

**"Ollama not responding"**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start Ollama (it should auto-start on macOS)
ollama serve
```

**"S3 upload failed"**
- Verify your AWS credentials in `backend/.env`
- Check if your S3 bucket exists and is accessible
- Ensure your IAM user has S3 permissions

**"Port already in use"**
```bash
# Find and kill processes using ports 3001 or 5173
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Reset Everything
```bash
# Stop all services
npm run docker:stop

# Reset database
npm run docker:reset

# Start fresh
npm run docker:start
npm run dev
```

## Project Structure

```
oasis-scribe/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx       # Main application
│   │   └── ...
│   └── package.json
├── backend/           # Node.js API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── entities/     # Database models
│   │   └── ...
│   ├── .env             # Environment variables
│   └── package.json
├── docker-compose.db.yml # PostgreSQL container
├── package.json        # Root package with scripts
└── README.md
```

## Development Setup

For development, each service runs independently:

1. **Database**: PostgreSQL in Docker container
2. **Backend**: Node.js development server with hot reload
3. **Frontend**: Vite development server with HMR
4. **Ollama**: Local AI service
5. **S3**: Cloud storage for audio files

## Security Notes

- Never commit `.env` files containing AWS credentials
- Use IAM roles with minimal required permissions
- Consider using AWS IAM roles instead of access keys in production
- Keep your Ollama installation updated

## Performance Considerations

- Audio files are uploaded directly to S3 (not stored locally)
- Database connections are pooled for efficiency
- Frontend builds are optimized for production
- Ollama runs locally for faster AI processing

## Support

For issues:
1. Check the troubleshooting section above
2. Verify all services are running correctly
3. Check the console logs for specific error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Important**: This system requires active internet connection for S3 uploads and periodic access to download Ollama models. 