import whisper, { WhisperSegment } from 'whisper-node'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
}

export interface TranscriptionResult {
  text: string
  duration?: number
  language?: string
  segments?: Array<{
    start: string
    end: string
    speech: string
  }>
}

export class WhisperTranscriptionService {
  private readonly modelName: string

  constructor() {
    this.modelName = process.env.WHISPER_MODEL || 'base.en'

  }

  async transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
    try {

      
      if (!fs.existsSync(audioFilePath)) {
        throw new Error(`Audio file not found: ${audioFilePath}`)
      }

      const convertedPath = await this.convertToWav(audioFilePath)

      const options = {
        modelName: this.modelName,
        whisperOptions: {
          language: 'auto',
          word_timestamps: true,
          gen_file_txt: false,
          gen_file_subtitle: false,
          gen_file_vtt: false
        }
      }


      
      const transcript: WhisperSegment[] = await whisper(convertedPath, options)
      
      this.cleanupTempFile(convertedPath, audioFilePath)
      
      if (!transcript || transcript.length === 0) {
        throw new Error('No transcription result received')
      }

      const fullText = transcript.map((segment: WhisperSegment) => segment.speech).join(' ')
      
      const lastSegment = transcript[transcript.length - 1]
      const duration = lastSegment ? this.parseTimeToSeconds(lastSegment.end) : undefined


      
      return {
        text: fullText,
        duration,
        language: 'auto',
        segments: transcript.map((segment: WhisperSegment) => ({
          start: segment.start,
          end: segment.end,
          speech: segment.speech
        }))
      }
    } catch (error) {
      console.error('❌ Error during transcription:', error)
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async convertToWav(inputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ext = path.extname(inputPath).toLowerCase()
      
      if (ext === '.wav') {
        resolve(inputPath)
        return
      }

      const outputPath = inputPath.replace(path.extname(inputPath), '_converted.wav')
      

      
      ffmpeg(inputPath)
        .audioFrequency(16000)
        .audioChannels(1)
        .audioCodec('pcm_s16le')
        .format('wav')
        .output(outputPath)
        .on('end', () => {

          resolve(outputPath)
        })
        .on('error', (err: any) => {
          console.error(`❌ Conversion error:`, err)
          reject(new Error(`Audio conversion failed: ${err.message || 'Unknown conversion error'}`))
        })
        .run()
    })
  }

  private cleanupTempFile(convertedPath: string, originalPath: string): void {
    if (convertedPath !== originalPath && fs.existsSync(convertedPath)) {
      try {
        fs.unlinkSync(convertedPath)
  
      } catch (error) {
        console.warn(`⚠️ Could not cleanup temp file: ${convertedPath}`)
      }
    }
  }

  private parseTimeToSeconds(timeString: string): number {
    const parts = timeString.split(':')
    if (parts.length === 3) {
      const hours = parseInt(parts[0] || '0', 10)
      const minutes = parseInt(parts[1] || '0', 10)
      const seconds = parseFloat(parts[2] || '0')
      return hours * 3600 + minutes * 60 + seconds
    }
    return 0
  }

  async isModelAvailable(): Promise<boolean> {
    try {
      return typeof whisper === 'function'
    } catch (error) {
      console.log('ℹ️  Whisper model not available:', error)
      return false
    }
  }
} 