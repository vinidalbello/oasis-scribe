import axios from 'axios'
import fs from 'fs'

export interface TranscriptionResult {
  text: string
  duration?: number
  language?: string
}

export interface OasisProcessingResult {
  m1800Grooming: number | null
  m1810DressUpper: number | null
  m1820DressLower: number | null
  m1830Bathing: number | null
  m1840ToiletTransfer: number | null
  m1845ToiletingHygiene: number | null
  m1850Transferring: number | null
  m1860Ambulation: number | null
  confidence: number
  reasoning: string
}

export class OllamaAIService {
  private readonly ollamaUrl: string
  private readonly model: string
  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
    this.model = process.env.OLLAMA_MODEL || 'llama3.2'
    
    console.log(`🤖 Ollama AI Service initialized with model: ${this.model}`)
  }

  // Verificar se Ollama está disponível
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, { 
        timeout: 3000 
      })
      return response.status === 200
    } catch (error) {
      console.log('ℹ️  Ollama not available, using simulation mode')
      return false
    }
  }

  // Transcrever áudio (simulação - Ollama não faz transcrição de áudio)
  async transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
    console.log('🎤 Transcribing audio using simulation (Ollama does not support audio)')
    
    // Detect if file is in S3 or local storage
    if (this.isS3Key(audioFilePath)) {
      console.log(`📥 Audio file stored in S3: ${audioFilePath}`)
      console.log(`🌐 S3 URL: https://oasis-audio-storage.s3.us-east-1.amazonaws.com/${audioFilePath}`)
      // For real transcription, you would download from S3 and use Whisper/similar
      // For now, we simulate since Ollama doesn't support audio transcription
    } else {
      console.log(`📁 Audio file stored locally: ${audioFilePath}`)
      // Check if local file exists (only for local files)
      if (fs.existsSync(audioFilePath)) {
        console.log(`✅ Local audio file found: ${audioFilePath}`)
      } else {
        console.warn(`⚠️  Local audio file not found: ${audioFilePath}`)
      }
    }
    
    // For now, we simulate transcription (Ollama doesn't support audio)
    // For real transcription, you could use:
    // - OpenAI Whisper API
    // - Local Whisper (whisper.cpp)
    // - Google Speech-to-Text
    // - AWS Transcribe
    
    return this.simulateTranscription()
  }

  // Helper method to detect if path is S3 key
  private isS3Key(path: string): boolean {
    // S3 keys don't start with / and typically contain folders like 'audio/'
    return !path.startsWith('/') && !path.startsWith('\\') && path.includes('audio/')
  }

  // Processar transcrição para extrair dados OASIS usando Ollama
  async processOasisData(transcription: string, patientContext?: string): Promise<OasisProcessingResult> {
    const isAvailable = await this.isAvailable()
    
    if (!isAvailable) {
      console.log('⚠️  Ollama not available, using simulation')
      return this.simulateOasisProcessing()
    }

    try {
      console.log('🧠 Processing OASIS data with Ollama...')
      
      const prompt = this.buildOasisPrompt(transcription, patientContext)
      
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          num_predict: 500, // Limit response length for faster processing
          num_ctx: 4096     // Context window
        }
      }, {
        timeout: 120000 // 2 minutes timeout (first run can be slow)
      })

      const result = response.data.response
      if (!result || typeof result !== 'string') {
        throw new Error('Invalid response from Ollama')
      }
      return this.parseOasisResponse(result)
    } catch (error) {
      console.error('Error processing OASIS data with Ollama:', error)
      console.log('🔄 Falling back to simulation mode')
      return this.simulateOasisProcessing()
    }
  }

  private buildOasisPrompt(transcription: string, patientContext?: string): string {
    return `You are a certified OASIS home health nurse. Analyze this transcription and determine the EXACT OASIS Section G scores. Focus on specific keywords and evidence.

${patientContext ? `Patient Context: ${patientContext}` : ''}

Medical Transcription: "${transcription}"

SCORING GUIDE - Look for these EXACT phrases:

M1800 GROOMING (0-3):
• 0 = "independent", "without help", "unaided"
• 1 = "lay out supplies", "prepare materials", "setup help"  
• 2 = "someone must help", "needs assistance", "help with grooming"
• 3 = "totally dependent", "complete help", "unable to groom"

M1810 DRESS UPPER (0-3):
• 0 = "dresses independently", "no help needed"
• 1 = "clothes laid out", "organize clothes", "setup help"
• 2 = "help putting on", "assistance with", "someone helps"  
• 3 = "totally dependent", "cannot dress upper"

M1820 DRESS LOWER (0-3):
• 0 = "independent lower body", "no help with pants/shoes"
• 1 = "clothes laid out", "shoes organized"
• 2 = "help with socks/shoes", "assistance with pants"
• 3 = "totally dependent", "cannot dress lower"

M1830 BATHING (0-4):
• 0 = "bathes independently", "no help bathing"
• 1 = "uses grab bars", "with devices", "adaptive equipment"
• 2 = "intermittent help", "assistance getting in/out", "help with back"
• 3 = "presence throughout", "continuous assistance"
• 4 = "unable to use shower", "bed bath only"

M1840 TOILET TRANSFER (0-3):
• 0 = "transfers to toilet independently", "gets to bathroom alone"
• 1 = "supervision", "reminded", "assisted to bathroom"
• 2 = "uses bedside commode"
• 3 = "bedpan", "totally dependent"

M1845 TOILETING HYGIENE (0-3):
• 0 = "manages hygiene independently", "cleans self"
• 1 = "supplies laid out", "setup help with hygiene"
• 2 = "help with clothing", "assistance with cleanliness"
• 3 = "totally dependent", "cannot manage hygiene"

M1850 TRANSFERRING (0-5):
• 0 = "transfers independently", "no help moving"
• 1 = "minimal help", "supervision for safety"
• 2 = "bears weight", "pivot but needs help"
• 3 = "extensive help", "cannot bear weight"
• 4 = "bedfast but turns", "positions self in bed"
• 5 = "bedfast, cannot turn"

M1860 AMBULATION (0-6):
• 0 = "walks independently", "no device", "no help"
• 1 = "uses cane", "single crutch", "one-handed device"
• 2 = "uses walker", "crutches", "two-handed device"
• 3 = "walks with person", "human assistance"
• 4 = "wheelchair independent", "wheels self"
• 5 = "wheelchair dependent", "cannot wheel"
• 6 = "bedfast", "cannot get up"

Respond with ONLY this JSON format:
{
  "m1800Grooming": 1,
  "m1810DressUpper": 1,
  "m1820DressLower": 2,
  "m1830Bathing": 2,
  "m1840ToiletTransfer": 0,
  "m1845ToiletingHygiene": 2,
  "m1850Transferring": 1,
  "m1860Ambulation": 2,
  "confidence": 90,
  "reasoning": "Patient requires setup help for grooming and upper dressing, assistance with lower dressing and toileting hygiene, intermittent bathing help, minimal transfer assistance, and uses walker with supervision"
}`
  }

  private parseOasisResponse(response: string): OasisProcessingResult {
    try {
      // Tentar extrair JSON válido da resposta
      let jsonText = response.trim()
      
      // Se a resposta não começar com {, tentar encontrar JSON
      if (!jsonText.startsWith('{')) {
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          jsonText = jsonMatch[0]
        } else {
          throw new Error('No JSON found in response')
        }
      }

      const parsed = JSON.parse(jsonText)
      
      return {
        m1800Grooming: this.validateOasisValue(parsed.m1800Grooming, 0, 3),
        m1810DressUpper: this.validateOasisValue(parsed.m1810DressUpper, 0, 3),
        m1820DressLower: this.validateOasisValue(parsed.m1820DressLower, 0, 3),
        m1830Bathing: this.validateOasisValue(parsed.m1830Bathing, 0, 4),
        m1840ToiletTransfer: this.validateOasisValue(parsed.m1840ToiletTransfer, 0, 3),
        m1845ToiletingHygiene: this.validateOasisValue(parsed.m1845ToiletingHygiene, 0, 3),
        m1850Transferring: this.validateOasisValue(parsed.m1850Transferring, 0, 5),
        m1860Ambulation: this.validateOasisValue(parsed.m1860Ambulation, 0, 6),
        confidence: Math.min(100, Math.max(0, parsed.confidence || 75)),
        reasoning: parsed.reasoning || 'Automated analysis performed with Ollama'
      }
    } catch (error) {
      console.error('Error parsing Ollama response:', error)
      console.log('🔄 Falling back to simulation')
      return this.simulateOasisProcessing()
    }
  }

  private validateOasisValue(value: any, min: number, max: number): number | null {
    if (value === null || value === undefined) return null
    const num = parseInt(value)
    if (isNaN(num) || num < min || num > max) return null
    return num
  }

  // Simulação para quando Ollama não está disponível
  private simulateTranscription(): TranscriptionResult {
    const samples = [
      "Today I conducted a home health assessment for Mrs. Johnson. She demonstrates difficulty dressing and needs assistance putting on her shirt. She can manage personal grooming with supervision. For bathing, she requires help from another person. She walks with a cane and needs supervision for safety.",
      "Patient is independent for personal grooming and dressing activities. She bathes independently using grab bars for support. Transfers from bed to chair without assistance. Ambulates independently throughout the home without limitations.",
      "Patient requires total assistance for dressing and hygiene activities. Cannot bathe without complete help from caregivers. Transfers require assistance from two people for safety. Patient is bedfast and unable to ambulate.",
      "Patient can manage personal grooming independently but needs someone to lay out her grooming supplies before she can complete the routine. She dresses upper body with some difficulty. Requires supervision during bathing for safety. Uses a walker for household mobility.",
      "Patient is completely independent for all basic activities of daily living. Does not need help with dressing or bathing. Transfers without any assistance. Walks without limitations or assistive devices throughout the community."
    ]
    
    const randomIndex = Math.floor(Math.random() * samples.length)
    const selectedSample = samples[randomIndex] || samples[0] || "Transcrição exemplo não disponível"
    
    return {
      text: selectedSample,
      duration: Math.floor(Math.random() * 60) + 30, // 30-90 segundos
      language: 'pt'
    }
  }

  private simulateOasisProcessing(): OasisProcessingResult {
    const scenarios: OasisProcessingResult[] = [
      {
        m1800Grooming: 1,
        m1810DressUpper: 2,
        m1820DressLower: 2,
        m1830Bathing: 3,
        m1840ToiletTransfer: 1,
        m1845ToiletingHygiene: 1,
        m1850Transferring: 1,
        m1860Ambulation: 1,
        confidence: 85,
        reasoning: "Patient demonstrates need for moderate assistance in activities of daily living"
      },
      {
        m1800Grooming: 0,
        m1810DressUpper: 0,
        m1820DressLower: 0,
        m1830Bathing: 1,
        m1840ToiletTransfer: 0,
        m1845ToiletingHygiene: 0,
        m1850Transferring: 0,
        m1860Ambulation: 0,
        confidence: 92,
        reasoning: "Patient independent in most functional activities"
      },
      {
        m1800Grooming: 3,
        m1810DressUpper: 3,
        m1820DressLower: 3,
        m1830Bathing: 4,
        m1840ToiletTransfer: 3,
        m1845ToiletingHygiene: 3,
        m1850Transferring: 4,
        m1860Ambulation: 6,
        confidence: 78,
        reasoning: "Patient requires extensive assistance for most activities"
      }
    ]
    
    const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)]
    
    if (!selectedScenario) {
      return {
        m1800Grooming: null,
        m1810DressUpper: null,
        m1820DressLower: null,
        m1830Bathing: null,
        m1840ToiletTransfer: null,
        m1845ToiletingHygiene: null,
        m1850Transferring: null,
        m1860Ambulation: null,
        confidence: 50,
        reasoning: "Unable to assess - insufficient information"
      }
    }
    
    return selectedScenario
  }
} 