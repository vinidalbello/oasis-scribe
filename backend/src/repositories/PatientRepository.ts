import { Pool } from 'pg'
import { Patient } from '../entities/Patient'

export class PatientRepository {
  constructor(private readonly pool: Pool) {}

  // Get all patients
  async findAll(): Promise<Patient[]> {
    const query = `
      SELECT id, name, date_of_birth, patient_id, address, phone, 
             emergency_contact, diagnosis, created_at, updated_at
      FROM patients 
      ORDER BY name ASC
    `
    
    const result = await this.pool.query(query)
    return result.rows.map(row => Patient.fromDatabase(row))
  }

  // Get patient by ID
  async findById(id: number): Promise<Patient | null> {
    const query = `
      SELECT id, name, date_of_birth, patient_id, address, phone,
             emergency_contact, diagnosis, created_at, updated_at
      FROM patients 
      WHERE id = $1
    `
    
    const result = await this.pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    return Patient.fromDatabase(result.rows[0])
  }

  // Get patient by external patient ID
  async findByPatientId(patientId: string): Promise<Patient | null> {
    const query = `
      SELECT id, name, date_of_birth, patient_id, address, phone,
             emergency_contact, diagnosis, created_at, updated_at
      FROM patients 
      WHERE patient_id = $1
    `
    
    const result = await this.pool.query(query, [patientId])
    
    if (result.rows.length === 0) {
      return null
    }
    
    return Patient.fromDatabase(result.rows[0])
  }

  // Create new patient
  async create(patientData: {
    name: string;
    dateOfBirth: Date;
    patientId: string;
    address: string;
    phone: string;
    emergencyContact: string;
    diagnosis: string;
  }): Promise<Patient> {
    const query = `
      INSERT INTO patients (name, date_of_birth, patient_id, address, phone, emergency_contact, diagnosis)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, date_of_birth, patient_id, address, phone, emergency_contact, diagnosis, created_at, updated_at
    `
    
    const values = [
      patientData.name,
      patientData.dateOfBirth,
      patientData.patientId,
      patientData.address,
      patientData.phone,
      patientData.emergencyContact,
      patientData.diagnosis
    ]
    
    const result = await this.pool.query(query, values)
    return Patient.fromDatabase(result.rows[0])
  }

  // Update patient
  async update(id: number, patientData: Partial<{
    name: string;
    dateOfBirth: Date;
    address: string;
    phone: string;
    emergencyContact: string;
    diagnosis: string;
  }>): Promise<Patient | null> {
    const fields = []
    const values = []
    let paramCount = 1

    if (patientData.name !== undefined) {
      fields.push(`name = $${paramCount++}`)
      values.push(patientData.name)
    }
    
    if (patientData.dateOfBirth !== undefined) {
      fields.push(`date_of_birth = $${paramCount++}`)
      values.push(patientData.dateOfBirth)
    }
    
    if (patientData.address !== undefined) {
      fields.push(`address = $${paramCount++}`)
      values.push(patientData.address)
    }
    
    if (patientData.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`)
      values.push(patientData.phone)
    }
    
    if (patientData.emergencyContact !== undefined) {
      fields.push(`emergency_contact = $${paramCount++}`)
      values.push(patientData.emergencyContact)
    }
    
    if (patientData.diagnosis !== undefined) {
      fields.push(`diagnosis = $${paramCount++}`)
      values.push(patientData.diagnosis)
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `
      UPDATE patients 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, date_of_birth, patient_id, address, phone, emergency_contact, diagnosis, created_at, updated_at
    `

    const result = await this.pool.query(query, values)
    
    if (result.rows.length === 0) {
      return null  
    }
    
    return Patient.fromDatabase(result.rows[0])
  }

  // Delete patient
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM patients WHERE id = $1'
    const result = await this.pool.query(query, [id])
    return result.rowCount !== null && result.rowCount > 0
  }
} 