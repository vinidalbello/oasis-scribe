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


  }

  async uploadFile(file: any): Promise<S3UploadResult> {
    try {
      const fileExtension = path.extname(file.originalname)
      const fileName = `${uuidv4()}${fileExtension}`
      const key = `audio/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`

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
      
      return {
        key,
        url,
        bucket: this.bucketName
      }
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      })

      const response = await this.s3Client.send(command)
      
      if (!response.Body) {
        throw new Error('No file content received from S3')
      }

      const chunks: Uint8Array[] = []
      for await (const chunk of response.Body as any) {
        chunks.push(chunk)
      }
      
      const buffer = Buffer.concat(chunks)
      
      return buffer
    } catch (error) {
      throw new Error(`Failed to download file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      })

      await this.s3Client.send(command)
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`
  }

  isConfigured(): boolean {
    const hasKey = !!process.env.AWS_ACCESS_KEY_ID
    const hasSecret = !!process.env.AWS_SECRET_ACCESS_KEY  
    const hasBucket = !!process.env.AWS_S3_BUCKET
    
    return hasKey && hasSecret && hasBucket
  }
} 