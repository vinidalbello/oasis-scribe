export class Patient {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly dateOfBirth: Date,
    public readonly patientId: string,
    public readonly address: string,
    public readonly phone: string,
    public readonly emergencyContact: string,
    public readonly diagnosis: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromDatabase(row: any): Patient {
    return new Patient(
      row.id,
      row.name,
      new Date(row.date_of_birth),
      row.patient_id,
      row.address,
      row.phone,
      row.emergency_contact,
      row.diagnosis,
      new Date(row.created_at),
      new Date(row.updated_at)
    )
  }

  getAge(): number {
    const today = new Date()
    const birthDate = new Date(this.dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  getDisplayName(): string {
    return `${this.name} (${this.patientId})`
  }

  getFormattedDateOfBirth(): string {
    return this.dateOfBirth.toLocaleDateString('en-US')
  }
} 