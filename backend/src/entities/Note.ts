export type NoteStatus = 'processing' | 'completed' | 'error'

export class Note {
  constructor(
    public readonly id: number,
    public readonly patientId: number,
    public readonly audioFilePath: string | null,
    public readonly transcription: string | null,
    public readonly summary: string | null,
    public readonly status: NoteStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromDatabase(row: any): Note {
    return new Note(
      row.id,
      row.patient_id,
      row.audio_file_path,
      row.transcription,
      row.summary,
      row.status as NoteStatus,
      new Date(row.created_at),
      new Date(row.updated_at)
    )
  }

  static createNew(
    patientId: number,
    audioFilePath: string | null,
    transcription?: string,
    summary?: string,
    status: NoteStatus = 'processing'
  ): {
    patientId: number;
    audioFilePath: string | null;
    transcription: string | null;
    summary: string | null;
    status: NoteStatus;
  } {
    return {
      patientId,
      audioFilePath,
      transcription: transcription || null,
      summary: summary || null,
      status
    }
  }

  isCompleted(): boolean {
    return this.status === 'completed'
  }

  hasError(): boolean {
    return this.status === 'error'
  }

  isProcessing(): boolean {
    return this.status === 'processing'
  }

  getFormattedCreatedAt(): string {
    return this.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  getAudioFileName(): string | null {
    if (!this.audioFilePath) return null
    return this.audioFilePath.split('/').pop() || null
  }

  getTranscriptionPreview(): string | null {
    if (!this.transcription) return null
    return this.transcription.length > 100 
      ? this.transcription.substring(0, 100) + '...'
      : this.transcription
  }
} 