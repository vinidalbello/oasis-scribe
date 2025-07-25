import { Pool } from 'pg'
import { Note, NoteStatus } from '../entities/Note'

export interface NoteWithPatient {
  note: Note;
  patientName: string;
}

export class NoteRepository {
  constructor(private readonly pool: Pool) {}

  // Get all notes with patient information
  async findAll(): Promise<NoteWithPatient[]> {
    const query = `
      SELECT n.id, n.patient_id, n.audio_file_path, n.transcription, n.summary, 
             n.status, n.created_at, n.updated_at, p.name as patient_name
      FROM notes n
      INNER JOIN patients p ON n.patient_id = p.id
      ORDER BY n.created_at DESC
    `
    
    const result = await this.pool.query(query)
    return result.rows.map(row => ({
      note: Note.fromDatabase(row),
      patientName: row.patient_name
    }))
  }

  // Get notes by patient ID
  async findByPatientId(patientId: number): Promise<Note[]> {
    const query = `
      SELECT id, patient_id, audio_file_path, transcription, summary, 
             status, created_at, updated_at
      FROM notes 
      WHERE patient_id = $1
      ORDER BY created_at DESC
    `
    
    const result = await this.pool.query(query, [patientId])
    return result.rows.map(row => Note.fromDatabase(row))
  }

  // Get note by ID
  async findById(id: number): Promise<Note | null> {
    const query = `
      SELECT id, patient_id, audio_file_path, transcription, summary,
             status, created_at, updated_at
      FROM notes 
      WHERE id = $1
    `
    
    const result = await this.pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    return Note.fromDatabase(result.rows[0])
  }

  // Get note with patient information by ID
  async findByIdWithPatient(id: number): Promise<NoteWithPatient | null> {
    const query = `
      SELECT n.id, n.patient_id, n.audio_file_path, n.transcription, n.summary,
             n.status, n.created_at, n.updated_at, p.name as patient_name
      FROM notes n
      INNER JOIN patients p ON n.patient_id = p.id
      WHERE n.id = $1
    `
    
    const result = await this.pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    return {
      note: Note.fromDatabase(row),
      patientName: row.patient_name
    }
  }

  // Create new note
  async create(noteData: {
    patientId: number;
    audioFilePath: string | null;
    transcription?: string | null;
    summary?: string | null;
    status?: NoteStatus;
  }): Promise<Note> {
    const query = `
      INSERT INTO notes (patient_id, audio_file_path, transcription, summary, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, patient_id, audio_file_path, transcription, summary, status, created_at, updated_at
    `
    
    const values = [
      noteData.patientId,
      noteData.audioFilePath,
      noteData.transcription || null,
      noteData.summary || null,
      noteData.status || 'processing'
    ]
    
    const result = await this.pool.query(query, values)
    return Note.fromDatabase(result.rows[0])
  }

  // Update note
  async update(id: number, noteData: Partial<{
    audioFilePath: string | null;
    transcription: string | null;
    summary: string | null;
    status: NoteStatus;
  }>): Promise<Note | null> {
    const fields = []
    const values = []
    let paramCount = 1

    if (noteData.audioFilePath !== undefined) {
      fields.push(`audio_file_path = $${paramCount++}`)
      values.push(noteData.audioFilePath)
    }
    
    if (noteData.transcription !== undefined) {
      fields.push(`transcription = $${paramCount++}`)
      values.push(noteData.transcription)
    }
    
    if (noteData.summary !== undefined) {
      fields.push(`summary = $${paramCount++}`)
      values.push(noteData.summary)
    }
    
    if (noteData.status !== undefined) {
      fields.push(`status = $${paramCount++}`)
      values.push(noteData.status)
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `
      UPDATE notes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, patient_id, audio_file_path, transcription, summary, status, created_at, updated_at
    `

    const result = await this.pool.query(query, values)
    
    if (result.rows.length === 0) {
      return null
    }
    
    return Note.fromDatabase(result.rows[0])
  }

  // Delete note
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM notes WHERE id = $1'
    const result = await this.pool.query(query, [id])
    return result.rowCount !== null && result.rowCount > 0
  }

  // Get recent notes (for dashboard/preview)
  async findRecent(limit: number = 10): Promise<NoteWithPatient[]> {
    const query = `
      SELECT n.id, n.patient_id, n.audio_file_path, n.transcription, n.summary,
             n.status, n.created_at, n.updated_at, p.name as patient_name
      FROM notes n
      INNER JOIN patients p ON n.patient_id = p.id
      ORDER BY n.created_at DESC
      LIMIT $1
    `
    
    const result = await this.pool.query(query, [limit])
    return result.rows.map(row => ({
      note: Note.fromDatabase(row),
      patientName: row.patient_name
    }))
  }
} 