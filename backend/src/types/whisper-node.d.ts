declare module 'whisper-node' {
  export interface WhisperOptions {
    language?: string
    gen_file_txt?: boolean
    gen_file_subtitle?: boolean
    gen_file_vtt?: boolean
    word_timestamps?: boolean
    timestamp_size?: number
  }

  export interface WhisperConfig {
    modelName?: string
    modelPath?: string
    whisperOptions?: WhisperOptions
  }

  export interface WhisperSegment {
    start: string
    end: string
    speech: string
  }

  function whisper(filePath: string, options?: WhisperConfig): Promise<WhisperSegment[]>
  
  export default whisper
} 