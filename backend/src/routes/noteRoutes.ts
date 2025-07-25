import { Router } from 'express'
import { pool } from '../database/init'
import { NoteRepository } from '../repositories/NoteRepository'
import { PatientRepository } from '../repositories/PatientRepository'
import { OasisRepository } from '../repositories/OasisRepository'
import { NoteProcessingService } from '../services/NoteProcessingService'
import { S3Service } from '../services/S3Service'
import multer from 'multer'
import path from 'path'

export const noteRoutes = Router()

const noteRepository = new NoteRepository(pool)
const patientRepository = new PatientRepository(pool)
const oasisRepository = new OasisRepository(pool)
const noteProcessingService = new NoteProcessingService(pool)

let s3Service: S3Service | null = null
const getS3Service = () => {
  if (!s3Service) {
    s3Service = new S3Service()
  }
  return s3Service
}

const storage = multer.memoryStorage()
const FIFTY_MB = 50 * 1024 * 1024

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/mpeg', 
      'audio/wav', 
      'audio/mp3', 
      'audio/m4a',
      'audio/webm',
      'audio/ogg'
    ]
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only audio files are allowed'))
    }
  },
  limits: {
    fileSize: FIFTY_MB
  }
})

noteRoutes.get('/', async (req, res, next) => {
  try {
    const notes = await noteRepository.findAll()
    
    return res.json({
      success: true,
      message: 'Notes retrieved successfully',
      data: notes.map(({ note, patientName }) => ({
        id: note.id,
        patientId: note.patientId,
        patientName,
        audioFileName: note.getAudioFileName(),
        transcriptionPreview: note.getTranscriptionPreview(),
        status: note.status,
        createdAt: note.getFormattedCreatedAt(),
        isCompleted: note.isCompleted(),
        hasError: note.hasError(),
        isProcessing: note.isProcessing()
      }))
    })
  } catch (error) {
    return next(error)
  }
})

noteRoutes.post('/', upload.single('audioFile'), async (req, res, next) => {
  try {
    const { patientId } = req.body
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      })
    }

    const patientIdNum = parseInt(patientId)
    if (isNaN(patientIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      })
    }

    const patient = await patientRepository.findById(patientIdNum)
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required'
      })
    }

    let audioFilePath: string
    
    if (getS3Service().isConfigured()) {
      console.log('📤 Uploading audio file to S3...')
      const s3Result = await getS3Service().uploadFile(req.file)
      audioFilePath = s3Result.key
      console.log(`✅ File uploaded to S3: ${s3Result.url}`)
    } else {
      console.log('⚠️  S3 not configured, using local storage fallback')
      const uploadDir = path.join(__dirname, '../../uploads/audio')
      const fs = require('fs')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      const filename = `audio-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`
      const filepath = path.join(uploadDir, filename)
      fs.writeFileSync(filepath, req.file.buffer)
      audioFilePath = `/uploads/audio/${filename}`
    }

    const note = await noteRepository.create({
      patientId: patientIdNum,
      audioFilePath,
      status: 'processing'
    })

    setImmediate(async () => {
      try {
        await noteProcessingService.processNote(note.id, (progress) => {
          console.log(`Note ${note.id} processing: ${progress.step} - ${progress.message} (${progress.progress}%)`)
        })
        console.log(`✅ Note ${note.id} processed successfully`)
      } catch (error) {
        console.error(`❌ Error processing note ${note.id}:`, error)
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Note created successfully. Processing audio...',
      data: {
        id: note.id,
        patientId: note.patientId,
        patientName: patient.name,
        audioFileName: note.getAudioFileName(),
        status: note.status,
        createdAt: note.getFormattedCreatedAt(),
        isProcessing: note.isProcessing()
      }
    })
  } catch (error) {
    return next(error)
  }
})

noteRoutes.get('/:id', async (req, res, next) => {
  try {
    const noteId = parseInt(req.params.id)
    
    if (isNaN(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      })
    }

    const result = await noteRepository.findByIdWithPatient(noteId)
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      })
    }

    const { note, patientName } = result

    return res.json({
      success: true,
      data: {
        id: note.id,
        patientId: note.patientId,
        patientName,
        audioFileName: note.getAudioFileName(),
        audioFilePath: note.audioFilePath,
        transcription: note.transcription,
        summary: note.summary,
        status: note.status,
        createdAt: note.getFormattedCreatedAt(),
        isCompleted: note.isCompleted(),
        hasError: note.hasError(),
        isProcessing: note.isProcessing()
      }
    })
  } catch (error) {
    return next(error)
  }
})

noteRoutes.get('/:id/oasis', async (req, res, next) => {
  try {
    const noteId = parseInt(req.params.id)
    
    if (isNaN(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      })
    }

    const result = await noteProcessingService.getNoteWithOasis(noteId)
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      })
    }

    const { note, patientName, oasisData } = result

    return res.json({
      success: true,
      data: {
        note: {
          id: note.id,
          patientId: note.patientId,
          patientName,
          transcription: note.transcription,
          summary: note.summary,
          status: note.status,
          createdAt: note.getFormattedCreatedAt(),
          isCompleted: note.isCompleted()
        },
        oasisData: oasisData ? {
          id: oasisData.id,
          fields: oasisData.getAllFieldsWithDescriptions(),
          isComplete: oasisData.isComplete(),
          completionPercentage: oasisData.getCompletionPercentage()
        } : null
      }
    })
  } catch (error) {
    return next(error)
  }
})

noteRoutes.post('/:id/reprocess', async (req, res, next) => {
  try {
    const noteId = parseInt(req.params.id)
    
    if (isNaN(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      })
    }

    const note = await noteRepository.findById(noteId)
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      })
    }

    await noteRepository.update(noteId, { status: 'processing' })

    setImmediate(async () => {
      try {
        await noteProcessingService.processNote(noteId, (progress) => {
          console.log(`Note ${noteId} reprocessing: ${progress.step} - ${progress.message} (${progress.progress}%)`)
        })
        console.log(`✅ Note ${noteId} reprocessed successfully`)
      } catch (error) {
        console.error(`❌ Error reprocessing note ${noteId}:`, error)
      }
    })

    return res.json({
      success: true,
      message: 'Note reprocessing started',
      data: {
        id: noteId,
        status: 'processing'
      }
    })
  } catch (error) {
    return next(error)
  }
}) 