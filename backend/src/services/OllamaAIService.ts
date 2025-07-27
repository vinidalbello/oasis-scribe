import axios from 'axios'

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
    

  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, { 
        timeout: 5000 
      })
      
      if (response.status === 200) {
        const models = response.data.models || []
        const modelExists = models.some((model: any) => 
          model.name.includes(this.model.split(':')[0])
        )
        
        if (!modelExists) {
          console.log(`⚠️  Model ${this.model} not found. Available models:`, 
            models.map((m: any) => m.name))
          return false
        }
        
        return true
      }
      
      return false
    } catch (error) {

      return false
    }
  }

  async processOasisData(transcription: string, patientContext?: string): Promise<OasisProcessingResult> {
    const isAvailable = await this.isAvailable()
    
    if (!isAvailable) {
      console.log('⚠️  Ollama not available, cannot process OASIS data')
      throw new Error('Ollama service not available. Please ensure Ollama is running and the model is installed.')
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
          num_predict: 500,
          num_ctx: 4096
        }
      }, {
        timeout: 120000
      })

      const result = response.data.response
      if (!result || typeof result !== 'string') {
        throw new Error('Invalid response from Ollama')
      }
      
      return this.parseOasisResponse(result)
    } catch (error) {
      console.error('❌ Error processing OASIS data with Ollama:', error)
      throw new Error(`OASIS processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      let jsonText = response.trim()
      
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
      console.error('❌ Error parsing Ollama response:', error)
      throw new Error(`Failed to parse OASIS response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private validateOasisValue(value: any, min: number, max: number): number | null {
    if (value === null || value === undefined) return null
    const num = parseInt(value)
    if (isNaN(num) || num < min || num > max) return null
    return num
  }
} 