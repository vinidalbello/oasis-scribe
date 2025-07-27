import { Pool } from 'pg'
import { OasisSectionG } from '../entities/OasisSectionG'
import {
  M1800Grooming,
  M1810DressUpper,
  M1820DressLower,
  M1830Bathing,
  M1840ToiletTransfer,
  M1845ToiletingHygiene,
  M1850Transferring,
  M1860Ambulation
} from '../types/oasisEnums'

export class OasisRepository {
  constructor(private readonly pool: Pool) {}

  async findByNoteId(noteId: number): Promise<OasisSectionG | null> {
    const query = `
      SELECT id, note_id, m1800_grooming, m1810_dress_upper, m1820_dress_lower,
             m1830_bathing, m1840_toilet_transfer, m1845_toileting_hygiene, m1850_transferring, m1860_ambulation,
             created_at, updated_at
      FROM oasis_section_g 
      WHERE note_id = $1
    `
    
    const result = await this.pool.query(query, [noteId])
    
    if (result.rows.length === 0) {
      return null
    }
    
    return OasisSectionG.fromDatabase(result.rows[0])
  }

  async findById(id: number): Promise<OasisSectionG | null> {
    const query = `
      SELECT id, note_id, m1800_grooming, m1810_dress_upper, m1820_dress_lower,
             m1830_bathing, m1840_toilet_transfer, m1845_toileting_hygiene, m1850_transferring, m1860_ambulation,
             created_at, updated_at
      FROM oasis_section_g 
      WHERE id = $1
    `
    
    const result = await this.pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    return OasisSectionG.fromDatabase(result.rows[0])
  }

  async create(oasisData: {
    noteId: number;
    m1800Grooming?: M1800Grooming | null;
    m1810DressUpper?: M1810DressUpper | null;
    m1820DressLower?: M1820DressLower | null;
    m1830Bathing?: M1830Bathing | null;
    m1840ToiletTransfer?: M1840ToiletTransfer | null;
    m1845ToiletingHygiene?: M1845ToiletingHygiene | null;
    m1850Transferring?: M1850Transferring | null;
    m1860Ambulation?: M1860Ambulation | null;
  }): Promise<OasisSectionG> {
    const query = `
      INSERT INTO oasis_section_g (
        note_id, m1800_grooming, m1810_dress_upper, m1820_dress_lower,
        m1830_bathing, m1840_toilet_transfer, m1845_toileting_hygiene, m1850_transferring, m1860_ambulation
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, note_id, m1800_grooming, m1810_dress_upper, m1820_dress_lower,
                m1830_bathing, m1840_toilet_transfer, m1845_toileting_hygiene, m1850_transferring, m1860_ambulation,
                created_at, updated_at
    `
    
    const values = [
      oasisData.noteId,
      oasisData.m1800Grooming ?? null,
      oasisData.m1810DressUpper ?? null,
      oasisData.m1820DressLower ?? null,
      oasisData.m1830Bathing ?? null,
      oasisData.m1840ToiletTransfer ?? null,
      oasisData.m1845ToiletingHygiene ?? null,
      oasisData.m1850Transferring ?? null,
      oasisData.m1860Ambulation ?? null
    ]
    
    const result = await this.pool.query(query, values)
    return OasisSectionG.fromDatabase(result.rows[0])
  }

  async update(id: number, oasisData: Partial<{
    m1800Grooming: M1800Grooming | null;
    m1810DressUpper: M1810DressUpper | null;
    m1820DressLower: M1820DressLower | null;
    m1830Bathing: M1830Bathing | null;
    m1840ToiletTransfer: M1840ToiletTransfer | null;
    m1845ToiletingHygiene: M1845ToiletingHygiene | null;
    m1850Transferring: M1850Transferring | null;
    m1860Ambulation: M1860Ambulation | null;
  }>): Promise<OasisSectionG | null> {
    const fields = []
    const values = []
    let paramCount = 1

    if (oasisData.m1800Grooming !== undefined) {
      fields.push(`m1800_grooming = $${paramCount++}`)
      values.push(oasisData.m1800Grooming)
    }
    
    if (oasisData.m1810DressUpper !== undefined) {
      fields.push(`m1810_dress_upper = $${paramCount++}`)
      values.push(oasisData.m1810DressUpper)
    }
    
    if (oasisData.m1820DressLower !== undefined) {
      fields.push(`m1820_dress_lower = $${paramCount++}`)
      values.push(oasisData.m1820DressLower)
    }
    
    if (oasisData.m1830Bathing !== undefined) {
      fields.push(`m1830_bathing = $${paramCount++}`)
      values.push(oasisData.m1830Bathing)
    }
    
    if (oasisData.m1840ToiletTransfer !== undefined) {
      fields.push(`m1840_toilet_transfer = $${paramCount++}`)
      values.push(oasisData.m1840ToiletTransfer)
    }
    
    if (oasisData.m1845ToiletingHygiene !== undefined) {
      fields.push(`m1845_toileting_hygiene = $${paramCount++}`)
      values.push(oasisData.m1845ToiletingHygiene)
    }
    
    if (oasisData.m1850Transferring !== undefined) {
      fields.push(`m1850_transferring = $${paramCount++}`)
      values.push(oasisData.m1850Transferring)
    }
    
    if (oasisData.m1860Ambulation !== undefined) {
      fields.push(`m1860_ambulation = $${paramCount++}`)
      values.push(oasisData.m1860Ambulation)
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `
      UPDATE oasis_section_g 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, note_id, m1800_grooming, m1810_dress_upper, m1820_dress_lower,
                m1830_bathing, m1840_toilet_transfer, m1845_toileting_hygiene, m1850_transferring, m1860_ambulation,
                created_at, updated_at
    `

    const result = await this.pool.query(query, values)
    
    if (result.rows.length === 0) {
      return null
    }
    
    return OasisSectionG.fromDatabase(result.rows[0])
  }

  async upsertByNoteId(noteId: number, oasisData: {
    m1800Grooming?: M1800Grooming | null;
    m1810DressUpper?: M1810DressUpper | null;
    m1820DressLower?: M1820DressLower | null;
    m1830Bathing?: M1830Bathing | null;
    m1840ToiletTransfer?: M1840ToiletTransfer | null;
    m1850Transferring?: M1850Transferring | null;
    m1860Ambulation?: M1860Ambulation | null;
  }): Promise<OasisSectionG> {
    const existing = await this.findByNoteId(noteId)
    
    if (existing) {
      const updated = await this.update(existing.id, oasisData)
      if (!updated) {
        throw new Error('Failed to update OASIS Section G')
      }
      return updated
    } else {
      return this.create({ noteId, ...oasisData })
    }
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM oasis_section_g WHERE id = $1'
    const result = await this.pool.query(query, [id])
    return result.rowCount !== null && result.rowCount > 0
  }

  async deleteByNoteId(noteId: number): Promise<boolean> {
    const query = 'DELETE FROM oasis_section_g WHERE note_id = $1'
    const result = await this.pool.query(query, [noteId])
    return result.rowCount !== null && result.rowCount > 0
  }
} 