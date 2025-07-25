-- GetLimeAI Database Schema
-- OASIS Section G: Functional Status

-- Table: patients
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    patient_id VARCHAR(50) UNIQUE NOT NULL, -- External patient identifier
    address TEXT,
    phone VARCHAR(20),
    emergency_contact VARCHAR(255),
    diagnosis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: notes
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    audio_file_path VARCHAR(500), -- Path to uploaded audio file
    transcription TEXT, -- Raw audio transcription
    summary TEXT, -- AI-generated summary
    status VARCHAR(20) DEFAULT 'processing', -- processing, completed, error
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: oasis_section_g (Functional Status)
CREATE TABLE IF NOT EXISTS oasis_section_g (
    id SERIAL PRIMARY KEY,
    note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
    
    -- M1800: Grooming (0-3)
    m1800_grooming INTEGER CHECK (m1800_grooming >= 0 AND m1800_grooming <= 3),
    
    -- M1810: Dress Upper Body (0-3)
    m1810_dress_upper INTEGER CHECK (m1810_dress_upper >= 0 AND m1810_dress_upper <= 3),
    
    -- M1820: Dress Lower Body (0-3)
    m1820_dress_lower INTEGER CHECK (m1820_dress_lower >= 0 AND m1820_dress_lower <= 3),
    
    -- M1830: Bathing (0-4)
    m1830_bathing INTEGER CHECK (m1830_bathing >= 0 AND m1830_bathing <= 4),
    
    -- M1840: Toilet Transferring (0-3)
    m1840_toilet_transfer INTEGER CHECK (m1840_toilet_transfer >= 0 AND m1840_toilet_transfer <= 3),
    
    -- M1845: Toileting Hygiene (0-3)
    m1845_toileting_hygiene INTEGER CHECK (m1845_toileting_hygiene >= 0 AND m1845_toileting_hygiene <= 3),
    
    -- M1850: Transferring (0-5)
    m1850_transferring INTEGER CHECK (m1850_transferring >= 0 AND m1850_transferring <= 5),
    
    -- M1860: Ambulation/Locomotion (0-6)
    m1860_ambulation INTEGER CHECK (m1860_ambulation >= 0 AND m1860_ambulation <= 6),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data: Insert 3 fake American patients
INSERT INTO patients (name, date_of_birth, patient_id, address, phone, emergency_contact, diagnosis) VALUES 
(
    'Margaret Johnson',
    '1945-03-15',
    'PAT001',
    '1247 Oak Street, Springfield, IL 62701',
    '(217) 555-0123',
    'Robert Johnson (son) - (217) 555-0124',
    'Type 2 Diabetes Mellitus, Hypertension'
),
(
    'William Thompson',
    '1938-08-22',
    'PAT002', 
    '892 Maple Avenue, Albany, NY 12203',
    '(518) 555-0198',
    'Patricia Thompson (wife) - (518) 555-0199',
    'Chronic Obstructive Pulmonary Disease (COPD), Arthritis'
),
(
    'Dorothy Miller',
    '1952-12-03',
    'PAT003',
    '456 Elm Drive, Phoenix, AZ 85032', 
    '(602) 555-0167',
    'Charles Miller (husband) - (602) 555-0168',
    'Cerebrovascular Accident (Stroke), Mobility Impairment'
)
ON CONFLICT (patient_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_patient_id ON notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_oasis_note_id ON oasis_section_g(note_id); 