import { OllamaAIService, OasisProcessingResult } from './OllamaAIService'
import { WhisperTranscriptionService, TranscriptionResult } from './WhisperTranscriptionService'
import { S3Service } from './S3Service'
import { NoteRepository } from '../repositories/NoteRepository'
import { OasisRepository } from '../repositories/OasisRepository'
import { PatientRepository } from '../repositories/PatientRepository'
import { Note, NoteStatus } from '../entities/Note'
import { OasisSectionG } from '../entities/OasisSectionG'
import {
  M1800Grooming,
  M1810DressUpper,
  M1820DressLower,
  M1830Bathing,
  M1840ToiletTransfer,
  M1845ToiletingHygiene,
  M1850Transferring,
  M1860Ambulation
} from '../types/oasisEnums'
import { Pool } from 'pg'
import path from 'path'
import fs from 'fs'
import os from 'os'

export interface ProcessingProgress {
  step: 'transcription' | 'oasis_analysis' | 'saving' | 'completed' | 'error'
  message: string
  progress: number
}

export class NoteProcessingService {
  private readonly aiService: OllamaAIService
  private readonly transcriptionService: WhisperTranscriptionService
  private readonly noteRepository: NoteRepository
  private readonly oasisRepository: OasisRepository
  private readonly patientRepository: PatientRepository
  private readonly s3Service: S3Service

  constructor(pool: Pool) {
    this.aiService = new OllamaAIService()
    this.transcriptionService = new WhisperTranscriptionService()
    this.noteRepository = new NoteRepository(pool)
    this.oasisRepository = new OasisRepository(pool)
    this.patientRepository = new PatientRepository(pool)
    this.s3Service = new S3Service()
  }

  private convertToM1800ForCreate(value: number | null): M1800Grooming | undefined {
    return value !== null ? (value as M1800Grooming) : undefined
  }

  private convertToM1810ForCreate(value: number | null): M1810DressUpper | undefined {
    return value !== null ? (value as M1810DressUpper) : undefined
  }

  private convertToM1820ForCreate(value: number | null): M1820DressLower | undefined {
    return value !== null ? (value as M1820DressLower) : undefined
  }

  private convertToM1830ForCreate(value: number | null): M1830Bathing | undefined {
    return value !== null ? (value as M1830Bathing) : undefined
  }

  private convertToM1840ForCreate(value: number | null): M1840ToiletTransfer | undefined {
    return value !== null ? (value as M1840ToiletTransfer) : undefined
  }

  private convertToM1845ForCreate(value: number | null): M1845ToiletingHygiene | undefined {
    return value !== null ? (value as M1845ToiletingHygiene) : undefined
  }

  private convertToM1850ForCreate(value: number | null): M1850Transferring | undefined {
    return value !== null ? (value as M1850Transferring) : undefined
  }

  private convertToM1860ForCreate(value: number | null): M1860Ambulation | undefined {
    return value !== null ? (value as M1860Ambulation) : undefined
  }

  private convertToM1800ForUpdate(value: number | null): M1800Grooming | null {
    return value !== null ? (value as M1800Grooming) : value
  }

  private convertToM1810ForUpdate(value: number | null): M1810DressUpper | null {
    return value !== null ? (value as M1810DressUpper) : value
  }

  private convertToM1820ForUpdate(value: number | null): M1820DressLower | null {
    return value !== null ? (value as M1820DressLower) : value
  }

  private convertToM1830ForUpdate(value: number | null): M1830Bathing | null {
    return value !== null ? (value as M1830Bathing) : value
  }

  private convertToM1840ForUpdate(value: number | null): M1840ToiletTransfer | null {
    return value !== null ? (value as M1840ToiletTransfer) : value
  }

  private convertToM1845ForUpdate(value: number | null): M1845ToiletingHygiene | null {
    return value !== null ? (value as M1845ToiletingHygiene) : value
  }

  private convertToM1850ForUpdate(value: number | null): M1850Transferring | null {
    return value !== null ? (value as M1850Transferring) : value
  }

  private convertToM1860ForUpdate(value: number | null): M1860Ambulation | null {
    return value !== null ? (value as M1860Ambulation) : value
  }

  async processNote(noteId: number, progressCallback?: (progress: ProcessingProgress) => void): Promise<void> {
    try {
      progressCallback?.({
        step: 'transcription',
        message: 'Starting audio transcription...',
        progress: 10
      })

      const note = await this.noteRepository.findById(noteId)
      if (!note) {
        throw new Error('Note not found')
      }

      if (!note.audioFilePath) {
        throw new Error('No audio file available for processing')
      }

      const patient = await this.patientRepository.findById(note.patientId)
      const patientContext = patient ? 
        `Patient: ${patient.name}, Age: ${patient.getAge()}, Diagnosis: ${patient.diagnosis}` : 
        undefined

      progressCallback?.({
        step: 'transcription',
        message: 'Transcribing audio with Whisper...',
        progress: 30
      })

      let audioFilePath: string
      let tempFilePath: string | null = null

      if (note.audioFilePath.startsWith('/uploads/')) {
        audioFilePath = path.join(__dirname, '../../', note.audioFilePath)
      } else {
        const audioBuffer = await this.s3Service.downloadFile(note.audioFilePath)
        
        const fileExtension = path.extname(note.audioFilePath) || '.mp3'
        tempFilePath = path.join(os.tmpdir(), `temp_audio_${Date.now()}${fileExtension}`)
        
        fs.writeFileSync(tempFilePath, audioBuffer)
        audioFilePath = tempFilePath
      }

      try {
        const transcriptionResult = await this.transcriptionService.transcribeAudio(audioFilePath)

        progressCallback?.({
          step: 'oasis_analysis',
          message: 'Analyzing transcription for OASIS data extraction...',
          progress: 60
        })

        const oasisResult = await this.aiService.processOasisData(
          transcriptionResult.text, 
          patientContext
        )

        progressCallback?.({
          step: 'saving',
          message: 'Saving results...',
          progress: 80
        })

        await this.noteRepository.update(noteId, {
          transcription: transcriptionResult.text,
          summary: this.generateSummary(oasisResult),
          status: 'completed'
        })

        await this.oasisRepository.create(
          OasisSectionG.createNew(noteId, {
            m1800Grooming: this.convertToM1800ForCreate(oasisResult.m1800Grooming),
            m1810DressUpper: this.convertToM1810ForCreate(oasisResult.m1810DressUpper),
            m1820DressLower: this.convertToM1820ForCreate(oasisResult.m1820DressLower),
            m1830Bathing: this.convertToM1830ForCreate(oasisResult.m1830Bathing),
            m1840ToiletTransfer: this.convertToM1840ForCreate(oasisResult.m1840ToiletTransfer),
            m1845ToiletingHygiene: this.convertToM1845ForCreate(oasisResult.m1845ToiletingHygiene),
            m1850Transferring: this.convertToM1850ForCreate(oasisResult.m1850Transferring),
            m1860Ambulation: this.convertToM1860ForCreate(oasisResult.m1860Ambulation)
          })
        )

        progressCallback?.({
          step: 'completed',
          message: 'Processing completed successfully!',
          progress: 100
        })

      } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath)
        }
      }
    } catch (error) {
      console.error('❌ Error processing note:', error)
      
      await this.noteRepository.update(noteId, {
        status: 'error'
      })

      progressCallback?.({
        step: 'error',
        message: `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0
      })

      throw error
    }
  }

  async transcribeOnly(noteId: number): Promise<TranscriptionResult> {
    const note = await this.noteRepository.findById(noteId)
    if (!note) {
      throw new Error('Note not found')
    }

    if (!note.audioFilePath) {
      throw new Error('No audio file available for transcription')
    }

    let audioFilePath: string
    let tempFilePath: string | null = null

    if (note.audioFilePath.startsWith('/uploads/')) {
      audioFilePath = path.join(__dirname, '../../', note.audioFilePath)
    } else {
      const audioBuffer = await this.s3Service.downloadFile(note.audioFilePath)
      
      const fileExtension = path.extname(note.audioFilePath) || '.mp3'
      tempFilePath = path.join(os.tmpdir(), `temp_audio_${Date.now()}${fileExtension}`)
      
      fs.writeFileSync(tempFilePath, audioBuffer)
      audioFilePath = tempFilePath
    }

    try {
      const result = await this.transcriptionService.transcribeAudio(audioFilePath)

      await this.noteRepository.update(noteId, {
        transcription: result.text
      })

      return result
    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
    }
  }

  async processOasisOnly(noteId: number): Promise<OasisProcessingResult> {
    const note = await this.noteRepository.findById(noteId)
    if (!note) {
      throw new Error('Note not found')
    }

    if (!note.transcription) {
      throw new Error('No transcription available for OASIS processing')
    }

    const patient = await this.patientRepository.findById(note.patientId)
    const patientContext = patient ? 
      `Patient: ${patient.name}, Age: ${patient.getAge()}, Diagnosis: ${patient.diagnosis}` : 
      undefined

    const result = await this.aiService.processOasisData(note.transcription, patientContext)

    await this.noteRepository.update(noteId, {
      summary: this.generateSummary(result)
    })

    const existingOasis = await this.oasisRepository.findByNoteId(noteId)
    if (existingOasis) {
      await this.oasisRepository.update(existingOasis.id, {
        m1800Grooming: this.convertToM1800ForUpdate(result.m1800Grooming),
        m1810DressUpper: this.convertToM1810ForUpdate(result.m1810DressUpper),
        m1820DressLower: this.convertToM1820ForUpdate(result.m1820DressLower),
        m1830Bathing: this.convertToM1830ForUpdate(result.m1830Bathing),
        m1840ToiletTransfer: this.convertToM1840ForUpdate(result.m1840ToiletTransfer),
        m1845ToiletingHygiene: this.convertToM1845ForUpdate(result.m1845ToiletingHygiene),
        m1850Transferring: this.convertToM1850ForUpdate(result.m1850Transferring),
        m1860Ambulation: this.convertToM1860ForUpdate(result.m1860Ambulation)
      })
    } else {
      await this.oasisRepository.create(
        OasisSectionG.createNew(noteId, {
          m1800Grooming: this.convertToM1800ForCreate(result.m1800Grooming),
          m1810DressUpper: this.convertToM1810ForCreate(result.m1810DressUpper),
          m1820DressLower: this.convertToM1820ForCreate(result.m1820DressLower),
          m1830Bathing: this.convertToM1830ForCreate(result.m1830Bathing),
          m1840ToiletTransfer: this.convertToM1840ForCreate(result.m1840ToiletTransfer),
          m1845ToiletingHygiene: this.convertToM1845ForCreate(result.m1845ToiletingHygiene),
          m1850Transferring: this.convertToM1850ForCreate(result.m1850Transferring),
          m1860Ambulation: this.convertToM1860ForCreate(result.m1860Ambulation)
        })
      )
    }

    return result
  }

  async getNoteWithOasis(noteId: number): Promise<{
    note: Note;
    patientName: string;
    oasisData?: OasisSectionG;
  } | null> {
    const noteResult = await this.noteRepository.findByIdWithPatient(noteId)
    if (!noteResult) {
      return null
    }

    const oasisData = await this.oasisRepository.findByNoteId(noteId)

    return {
      note: noteResult.note,
      patientName: noteResult.patientName,
      oasisData: oasisData || undefined
    }
  }

  private generateSummary(oasisResult: OasisProcessingResult): string {
    const filledFields = Object.values({
      m1800: oasisResult.m1800Grooming,
      m1810: oasisResult.m1810DressUpper,
      m1820: oasisResult.m1820DressLower,
      m1830: oasisResult.m1830Bathing,
      m1840: oasisResult.m1840ToiletTransfer,
      m1845: oasisResult.m1845ToiletingHygiene,
      m1850: oasisResult.m1850Transferring,
      m1860: oasisResult.m1860Ambulation
    }).filter(value => value !== null).length

    const totalFields = 8
    const completionRate = Math.round((filledFields / totalFields) * 100)

    return `OASIS Section G processed with real AI. ${filledFields}/${totalFields} fields completed (${completionRate}%). Confidence: ${oasisResult.confidence}%. ${oasisResult.reasoning}`
  }
} 