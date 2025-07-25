import {
  M1800Grooming,
  M1810DressUpper, 
  M1820DressLower,
  M1830Bathing,
  M1840ToiletTransfer,
  M1845ToiletingHygiene,
  M1850Transferring,
  M1860Ambulation,
  getOasisDescription
} from '../types/oasisEnums'

export class OasisSectionG {
  constructor(
    public readonly id: number,
    public readonly noteId: number,
    public readonly m1800Grooming: M1800Grooming | null,
    public readonly m1810DressUpper: M1810DressUpper | null,
    public readonly m1820DressLower: M1820DressLower | null,
    public readonly m1830Bathing: M1830Bathing | null,
    public readonly m1840ToiletTransfer: M1840ToiletTransfer | null,
    public readonly m1845ToiletingHygiene: M1845ToiletingHygiene | null,
    public readonly m1850Transferring: M1850Transferring | null,
    public readonly m1860Ambulation: M1860Ambulation | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // Factory method to create OasisSectionG from database row
  static fromDatabase(row: any): OasisSectionG {
    return new OasisSectionG(
      row.id,
      row.note_id,
      row.m1800_grooming,
      row.m1810_dress_upper,
      row.m1820_dress_lower,
      row.m1830_bathing,
      row.m1840_toilet_transfer,
      row.m1845_toileting_hygiene,
      row.m1850_transferring,
      row.m1860_ambulation,
      new Date(row.created_at),
      new Date(row.updated_at)
    )
  }

  // Factory method for creating new OASIS Section G (for insertion)
  static createNew(
    noteId: number,
    data: {
      m1800Grooming?: M1800Grooming;
      m1810DressUpper?: M1810DressUpper;
      m1820DressLower?: M1820DressLower;
      m1830Bathing?: M1830Bathing;
      m1840ToiletTransfer?: M1840ToiletTransfer;
      m1845ToiletingHygiene?: M1845ToiletingHygiene;
      m1850Transferring?: M1850Transferring;
      m1860Ambulation?: M1860Ambulation;
    }
  ): {
    noteId: number;
    m1800Grooming: M1800Grooming | null;
    m1810DressUpper: M1810DressUpper | null;
    m1820DressLower: M1820DressLower | null;
    m1830Bathing: M1830Bathing | null;
    m1840ToiletTransfer: M1840ToiletTransfer | null;
    m1845ToiletingHygiene: M1845ToiletingHygiene | null;
    m1850Transferring: M1850Transferring | null;
    m1860Ambulation: M1860Ambulation | null;
  } {
    return {
      noteId,
      m1800Grooming: data.m1800Grooming ?? null,
      m1810DressUpper: data.m1810DressUpper ?? null,
      m1820DressLower: data.m1820DressLower ?? null,
      m1830Bathing: data.m1830Bathing ?? null,
      m1840ToiletTransfer: data.m1840ToiletTransfer ?? null,
      m1845ToiletingHygiene: data.m1845ToiletingHygiene ?? null,
      m1850Transferring: data.m1850Transferring ?? null,
      m1860Ambulation: data.m1860Ambulation ?? null
    }
  }

  // Get all OASIS fields as an object with descriptions
  getAllFieldsWithDescriptions(): Record<string, { value: number | null; description: string | null }> {
    return {
      M1800: {
        value: this.m1800Grooming,
        description: this.m1800Grooming !== null ? getOasisDescription.M1800(this.m1800Grooming) : null
      },
      M1810: {
        value: this.m1810DressUpper,
        description: this.m1810DressUpper !== null ? getOasisDescription.M1810(this.m1810DressUpper) : null
      },
      M1820: {
        value: this.m1820DressLower,
        description: this.m1820DressLower !== null ? getOasisDescription.M1820(this.m1820DressLower) : null
      },
      M1830: {
        value: this.m1830Bathing,
        description: this.m1830Bathing !== null ? getOasisDescription.M1830(this.m1830Bathing) : null
      },
      M1840: {
        value: this.m1840ToiletTransfer,
        description: this.m1840ToiletTransfer !== null ? getOasisDescription.M1840(this.m1840ToiletTransfer) : null
      },
      M1845: {
        value: this.m1845ToiletingHygiene,
        description: this.m1845ToiletingHygiene !== null ? getOasisDescription.M1845(this.m1845ToiletingHygiene) : null
      },
      M1850: {
        value: this.m1850Transferring,
        description: this.m1850Transferring !== null ? getOasisDescription.M1850(this.m1850Transferring) : null
      },
      M1860: {
        value: this.m1860Ambulation,
        description: this.m1860Ambulation !== null ? getOasisDescription.M1860(this.m1860Ambulation) : null
      }
    }
  }

  // Check if OASIS form is complete (all fields filled)
  isComplete(): boolean {
    return this.m1800Grooming !== null &&
           this.m1810DressUpper !== null &&
           this.m1820DressLower !== null &&
           this.m1830Bathing !== null &&
           this.m1840ToiletTransfer !== null &&
           this.m1845ToiletingHygiene !== null &&
           this.m1850Transferring !== null &&
           this.m1860Ambulation !== null
  }

  // Get completion percentage
  getCompletionPercentage(): number {
    const fields = [
      this.m1800Grooming,
      this.m1810DressUpper,
      this.m1820DressLower,
      this.m1830Bathing,
      this.m1840ToiletTransfer,
      this.m1845ToiletingHygiene,
      this.m1850Transferring,
      this.m1860Ambulation
    ]
    
    const filledFields = fields.filter(field => field !== null).length
    return Math.round((filledFields / fields.length) * 100)
  }
} 