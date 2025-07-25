import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

export interface S3UploadResult {
  key: string
  url: string
  bucket: string
}

export class S3Service {
  private readonly s3Client: S3Client
  private readonly bucketName: string
  private readonly region: string

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1'
    this.bucketName = process.env.AWS_S3_BUCKET || 'oasis-audio-storage'
    
    
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    })

    console.log(`🗄️  S3 Service initialized - Bucket: ${this.bucketName}, Region: ${this.region}`)
  }

  async uploadFile(file: any): Promise<S3UploadResult> {
    try {
      const fileExtension = path.extname(file.originalname)
      const fileName = `${uuidv4()}${fileExtension}`
      const key = `audio/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`

      console.log(`📤 Uploading file to S3: ${key}`)

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString()
          }
        }
      })

      const result = await upload.done()
      
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`
      
      console.log(`✅ File uploaded successfully: ${url}`)

      return {
        key,
        url,
        bucket: this.bucketName
      }
    } catch (error) {
      console.error('❌ Error uploading file to S3:', error)
      throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Download arquivo do S3 (para processamento de áudio)
  async downloadFile(key: string): Promise<Buffer> {
    try {
      console.log(`📥 Downloading file from S3: ${key}`)

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      })

      const response = await this.s3Client.send(command)
      
      if (!response.Body) {
        throw new Error('No file content received from S3')
      }

      // Converter stream para buffer
      const chunks: Uint8Array[] = []
      for await (const chunk of response.Body as any) {
        chunks.push(chunk)
      }
      
      const buffer = Buffer.concat(chunks)
      console.log(`✅ File downloaded successfully: ${buffer.length} bytes`)
      
      return buffer
    } catch (error) {
      console.error('❌ Error downloading file from S3:', error)
      throw new Error(`Failed to download file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Deletar arquivo do S3 (limpeza)
  async deleteFile(key: string): Promise<void> {
    try {
      console.log(`🗑️  Deleting file from S3: ${key}`)

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      })

      await this.s3Client.send(command)
      console.log(`✅ File deleted successfully: ${key}`)
    } catch (error) {
      console.error('❌ Error deleting file from S3:', error)
      throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Gerar URL assinada para acesso temporário (opcional)
  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`
  }

  // Verificar se S3 está configurado
  isConfigured(): boolean {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET
    )
  }
} 