import { Router } from 'express'
import { pool } from '../database/init'
import { PatientRepository } from '../repositories/PatientRepository'

export const patientRoutes = Router()

// Initialize repository
const patientRepository = new PatientRepository(pool)

// GET /api/patients - Get all patients for the dropdown
patientRoutes.get('/', async (req, res, next) => {
  try {
    const patients = await patientRepository.findAll()
    
    return res.json({
      success: true,
      message: 'Patients retrieved successfully',
      data: patients.map(patient => ({
        id: patient.id,
        name: patient.name,
        patientId: patient.patientId,
        displayName: patient.getDisplayName(),
        age: patient.getAge(),
        diagnosis: patient.diagnosis
      }))
    })
  } catch (error) {
    return next(error)
  }
})

// GET /api/patients/:id - Get specific patient details
patientRoutes.get('/:id', async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.id)
    
    if (isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      })
    }

    const patient = await patientRepository.findById(patientId)
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      })
    }

    return res.json({
      success: true,
      data: {
        id: patient.id,
        name: patient.name,
        patientId: patient.patientId,
        dateOfBirth: patient.getFormattedDateOfBirth(),
        age: patient.getAge(),
        address: patient.address,
        phone: patient.phone,
        emergencyContact: patient.emergencyContact,
        diagnosis: patient.diagnosis,
        createdAt: patient.createdAt
      }
    })
  } catch (error) {
    return next(error)
  }
}) 