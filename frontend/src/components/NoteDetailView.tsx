import { useState, useEffect, useCallback } from 'react'

interface Patient {
  id: number
  name: string
  patientId: string
  dateOfBirth: string
  age: number
  address: string
  phone: string
  emergencyContact: string
  diagnosis: string
}

interface OasisField {
  value: number | null
  description: string | null
}

interface OasisData {
  id: number
  fields: {
    M1800: OasisField
    M1810: OasisField
    M1820: OasisField
    M1830: OasisField
    M1840: OasisField
    M1845: OasisField
    M1850: OasisField
    M1860: OasisField
  }
  isComplete: boolean
  completionPercentage: number
}

interface Note {
  id: number
  patientId: number
  patientName: string
  transcription: string | null
  summary: string | null
  status: string
  createdAt: string
  isCompleted: boolean
}

interface NoteDetailViewProps {
  noteId: number
  onClose: () => void
}

const oasisFieldLabels = {
  M1800: 'M1800 - Grooming',
  M1810: 'M1810 - Current Ability to Dress Upper Body',
  M1820: 'M1820 - Current Ability to Dress Lower Body', 
  M1830: 'M1830 - Bathing',
  M1840: 'M1840 - Toilet Transferring',
  M1845: 'M1845 - Toileting Hygiene',
  M1850: 'M1850 - Transferring',
  M1860: 'M1860 - Ambulation/Locomotion'
}

export function NoteDetailView({ noteId, onClose }: NoteDetailViewProps) {
  const [note, setNote] = useState<Note | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [oasisData, setOasisData] = useState<OasisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNoteDetails = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const oasisResponse = await fetch(`/api/notes/${noteId}/oasis`)
      const oasisResult = await oasisResponse.json()

      if (!oasisResult.success) {
        throw new Error(oasisResult.message || 'Failed to load note')
      }

      setNote(oasisResult.data.note)
      setOasisData(oasisResult.data.oasisData)

      const patientResponse = await fetch(`/api/patients/${oasisResult.data.note.patientId}`)
      const patientResult = await patientResponse.json()

      if (patientResult.success) {
        setPatient(patientResult.data)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load note details')
    } finally {
      setIsLoading(false)
    }
  }, [noteId])

  useEffect(() => {
    loadNoteDetails()
  }, [loadNoteDetails])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error || 'Note not found'}</p>
          <button
            onClick={onClose}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-auto">
        <div className="bg-black text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Patient Note #{note.id}
              </h1>
              <p className="text-gray-300">
                Patient: {note.patientName} • Created: {note.createdAt}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded transition-colors hover:bg-gray-200"
            >
              × Close
            </button>
          </div>
        </div>

        <div className="flex">
          <div className="flex-1 p-6 space-y-8">
            
            <section>
              <h2 className="text-xl font-bold text-black mb-4">
                Transcription of Patient Interaction
              </h2>
              <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
                {note.transcription ? (
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {note.transcription}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No transcription available</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">
                Summary of Patient Interaction
              </h2>
              <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
                {note.summary ? (
                  <p className="text-gray-800 leading-relaxed">
                    {note.summary}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No summary available</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">
                OASIS Section G: Functional Status
              </h2>
              
              {oasisData ? (
                <div className="space-y-4">
                  <div className={`p-4 border rounded-lg mb-6 ${
                    oasisData.isComplete 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${
                        oasisData.isComplete 
                          ? 'text-green-800' 
                          : 'text-gray-800'
                      }`}>
                        Assessment Status: {oasisData.isComplete ? 'Complete' : `${oasisData.completionPercentage}% Complete`}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {Object.entries(oasisData.fields).map(([code, field]) => (
                      <div key={code} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-black text-lg mb-2">
                              {oasisFieldLabels[code as keyof typeof oasisFieldLabels]}
                            </h3>
                            <div className="flex items-center space-x-4">
                              <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded font-bold border">
                                Value: {field.value !== null ? field.value : 'Not Assessed'}
                              </div>
                            </div>
                            {field.description && (
                              <p className="text-gray-600 mt-2 text-sm">
                                {field.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">OASIS data not yet processed</p>
                </div>
              )}
            </section>
          </div>

          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
            <h2 className="text-xl font-bold text-black mb-6">
              Patient Metadata
            </h2>
            
            {patient ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="ml-2 text-black">{patient.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Patient ID:</span>
                      <span className="ml-2 text-black font-mono">{patient.patientId}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Date of Birth:</span>
                      <span className="ml-2 text-black">{patient.dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Age:</span>
                      <span className="ml-2 text-black">{patient.age} years</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Address:</span>
                      <span className="ml-2 text-black">{patient.address}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <span className="ml-2 text-black">{patient.phone}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Emergency Contact:</span>
                      <span className="ml-2 text-black">{patient.emergencyContact}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3">Medical Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Diagnosis:</span>
                      <span className="ml-2 text-black">{patient.diagnosis}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-black mb-2">Note Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className={`inline-block w-3 h-3 mr-2 rounded-full ${
                        note.status === 'completed' ? 'bg-green-500' :
                        note.status === 'processing' ? 'bg-gray-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-black capitalize">{note.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-gray-500 text-center">Loading patient data...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 