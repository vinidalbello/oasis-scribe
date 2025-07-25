import { useState, useEffect, useCallback } from 'react'
import { NoteDetailView } from './components/NoteDetailView'

interface Patient {
  id: number
  name: string
  patientId: string
  displayName: string
  age: number
  diagnosis: string
}

interface Note {
  id: number
  patientId: number
  patientName: string
  audioFileName: string | null
  transcriptionPreview: string | null
  status: string
  createdAt: string
  isProcessing: boolean
  isCompleted: boolean
}



function App() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [recentNotes, setRecentNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
    const [pollingInterval, setPollingInterval] = useState<number | null>(null)

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
  }, [pollingInterval])

  const loadPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      const data = await response.json()
      
      if (data.success) {
        setPatients(data.data)
      } else {
        setMessage('Error loading patients: ' + data.message)
      }
    } catch {
      setMessage('Error connecting to patients API')
    }
  }

  const loadRecentNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/notes')
      const data = await response.json()
      
      if (data.success) {
        const notes = data.data.slice(0, 5)
        setRecentNotes(notes)
        
        const hasProcessingNotes = notes.some((note: Note) => note.isProcessing)
        
        if (!hasProcessingNotes && (message.includes('Processing audio') || message.includes('Note created successfully'))) {
          setMessage('')
        }
        
        if (!hasProcessingNotes && pollingInterval) {
          stopPolling()
        }
      }
    } catch {
      console.error('Error loading notes')
    }
  }, [message, pollingInterval, stopPolling])

    const startPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }
    
    const interval = setInterval(() => {
      loadRecentNotes()
    }, 3000)
    
    setPollingInterval(interval)
  }

  useEffect(() => {
    loadPatients()
    loadRecentNotes()
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval, loadRecentNotes])

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm', 'audio/ogg']
      
      if (!allowedTypes.includes(file.type)) {
        setMessage('Only audio files are allowed (MP3, WAV, M4A, etc.)')
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        setMessage('File too large. Maximum size: 50MB')
        return
      }

      setAudioFile(file)
      setMessage('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPatientId) {
      setMessage('Please select a patient')
      return
    }

    if (!audioFile) {
      setMessage('Please select an audio file')
      return
    }

    setIsSubmitting(true)
    setMessage('Uploading audio file...')

    try {
      const formData = new FormData()
      formData.append('patientId', selectedPatientId)
      formData.append('audioFile', audioFile)

      const response = await fetch('/api/notes', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        
        setSelectedPatientId('')
        setAudioFile(null)
        const fileInput = document.getElementById('audioFile') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }

        setTimeout(() => {
          loadRecentNotes()
        }, 500)
        
        startPolling()
      } else {
        setMessage('Error: ' + data.message)
      }
    } catch {
      setMessage('Error uploading file')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNoteClick = (noteId: number) => {
    setSelectedNoteId(noteId)
  }

  const selectedPatient = patients.find(p => p.id.toString() === selectedPatientId)


  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <div className="bg-gray-50 border rounded-lg p-8">
            <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-black">
              OASIS Scribe
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              AI Healthcare Documentation for OASIS Section G
            </p>
            <div className="mt-4 flex justify-center">
              <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm font-medium border">
                Section G: Functional Status Assessment
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-300 rounded-lg p-8 mb-8">
          <div className="border-b border-gray-200 pb-4 mb-8">
            <h2 className="text-3xl font-bold text-black">
              Create New Assessment
            </h2>
            <p className="text-gray-600 mt-2">Upload audio recording for AI-powered OASIS documentation</p>
          </div>
          
          <div className="mb-8">
            <label htmlFor="patientSelect" className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
              Select Patient
            </label>
            <select
              id="patientSelect"
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value)
                setAudioFile(null)
                setMessage('')
                const fileInput = document.getElementById('audioFile') as HTMLInputElement
                if (fileInput) {
                  fileInput.value = ''
                }
              }}
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-gray-200 transition-all duration-200 bg-white text-black font-medium text-lg"
              disabled={isSubmitting}
            >
              <option value="">-- Select a patient --</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.displayName} - {patient.age} years old - {patient.diagnosis}
                </option>
              ))}
            </select>
          </div>

          {selectedPatient && (
            <div className="bg-gray-50 border-l-4 border-gray-500 rounded-r-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-black mb-3">
                Patient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                <div>
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span className="ml-2 font-medium">{selectedPatient.name}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Patient ID:</span>
                  <span className="ml-2 font-medium font-mono">{selectedPatient.patientId}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Age:</span>
                  <span className="ml-2 font-medium">{selectedPatient.age} years old</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">Diagnosis:</span>
                  <span className="ml-2 font-medium">{selectedPatient.diagnosis}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <label htmlFor="audioFile" className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
              Audio Recording
            </label>
            {!selectedPatientId ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 bg-gray-50">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">
                    <strong>Select a patient first</strong>
                  </p>
                  <p className="text-sm text-gray-400">
                    You must select a patient before uploading an audio file
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="audioFile"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-gray-200 transition-all duration-200 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 file:cursor-pointer"
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 mt-3 text-center">
                  <strong>Supported formats:</strong> MP3, WAV, M4A, OGG, WEBM (max. 50MB)
                </p>
              </div>
            )}
          </div>

          {audioFile && selectedPatientId && (
            <div className="bg-gray-50 border-l-4 border-gray-500 rounded-r-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-semibold">
                    <span className="font-bold">Selected file:</span> {audioFile.name}
                  </p>
                  <p className="text-gray-700 mt-1">
                    <span className="font-semibold">Size:</span> {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="text-gray-600">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full font-bold py-5 px-8 rounded-lg transition-all duration-200 mb-6 text-lg bg-white text-black border-2 border-gray-800 hover:bg-gray-100"
            disabled={isSubmitting || !selectedPatientId || !audioFile}
            style={{
              backgroundColor: selectedPatientId && audioFile && !isSubmitting ? '#000000' : '#ffffff',
              color: selectedPatientId && audioFile && !isSubmitting ? '#ffffff' : '#000000',
              cursor: selectedPatientId && audioFile && !isSubmitting ? 'pointer' : 'not-allowed'
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Audio...
              </span>
            ) : !selectedPatientId ? (
              'Select a patient first'
            ) : !audioFile ? (
              'Upload an audio file first'
            ) : (
              'Submit for AI Processing'
            )}
          </button>
        </form>

        {recentNotes.length > 0 && (
          <div className="bg-white border border-gray-300 rounded-lg p-8 mb-8">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-black">Patient Notes</h2>
                  <p className="text-gray-600 mt-2">All notes with patient name, date/time, and preview - Click to view full details</p>
                </div>
                {pollingInterval && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Auto-updating
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {recentNotes.map(note => (
                <div 
                  key={note.id} 
                  className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 cursor-pointer"
                  onClick={() => handleNoteClick(note.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-bold text-black text-xl">{note.patientName}</h3>
                        <span className="text-gray-500 text-sm">#{note.id}</span>
                        <span className="text-gray-500 text-sm">{note.createdAt}</span>
                      </div>
                      
                      {note.transcriptionPreview && (
                        <div className="bg-white border border-gray-200 rounded p-3 mb-3">
                          <p className="text-sm text-gray-700 italic">
                            "Preview: {note.transcriptionPreview}"
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="flex items-center">
                          <span className="ml-1">{note.audioFileName || 'No audio file'}</span>
                        </span>
                        {note.isCompleted && (
                          <span className="flex items-center text-gray-700 font-medium">
                            Click to view complete OASIS assessment
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <span className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wide whitespace-nowrap ml-4 ${
                      note.status === 'processing' ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                      note.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-300' :
                      note.status === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {note.status === 'processing' ? 'Processing' :
                       note.status === 'completed' ? 'Ready' :
                       note.status === 'error' ? 'Error' : note.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedNoteId && (
          <NoteDetailView 
            noteId={selectedNoteId} 
            onClose={() => setSelectedNoteId(null)} 
          />
        )}

        <div className="bg-white border border-gray-300 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-black mb-6">
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded">
              <span className="w-4 h-4 bg-green-500 mr-3 rounded-full"></span>
              <div>
                <div className="font-semibold text-black">Frontend</div>
                <div className="text-sm text-gray-600">React + TypeScript</div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded">
              <span className="w-4 h-4 bg-green-500 mr-3 rounded-full"></span>
              <div>
                <div className="font-semibold text-black">Backend</div>
                <div className="text-sm text-gray-600">Node.js + Express</div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded">
              <span className="w-4 h-4 bg-green-500 mr-3 rounded-full"></span>
              <div>
                <div className="font-semibold text-black">Database</div>
                <div className="text-sm text-gray-600">PostgreSQL</div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded">
              <span className="w-4 h-4 bg-gray-500 mr-3 rounded-full"></span>
              <div>
                <div className="font-semibold text-black">Patients</div>
                <div className="text-sm text-gray-600">{patients.length} loaded</div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded">
              <span className="w-4 h-4 bg-gray-500 mr-3 rounded-full"></span>
              <div>
                <div className="font-semibold text-black">AI Processing</div>
                <div className="text-sm text-gray-600">Simulation Mode</div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded">
              <span className="w-4 h-4 bg-gray-400 mr-3 rounded-full"></span>
              <div>
                <div className="font-semibold text-black">Production</div>
                <div className="text-sm text-gray-600">Ready for OpenAI</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
