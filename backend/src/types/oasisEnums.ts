// OASIS Section G: Functional Status - Enums
// Based on official OASIS-E1 form specifications

export enum M1800Grooming {
  INDEPENDENT = 0,      // Able to groom self unaided
  SETUP_HELP = 1,       // Able to groom self with setup help
  INTERMITTENT_HELP = 2, // Someone must help patient
  DEPENDENT = 3         // Patient depends entirely upon someone else
}

export enum M1810DressUpper {
  INDEPENDENT = 0,      // Able to dress upper body unaided  
  SETUP_HELP = 1,       // Able to dress upper body with setup help
  INTERMITTENT_HELP = 2, // Someone must help patient
  DEPENDENT = 3         // Patient depends entirely upon someone else
}

export enum M1820DressLower {
  INDEPENDENT = 0,      // Able to dress lower body unaided
  SETUP_HELP = 1,       // Able to dress lower body with setup help
  INTERMITTENT_HELP = 2, // Someone must help patient
  DEPENDENT = 3         // Patient depends entirely upon someone else
}

export enum M1830Bathing {
  INDEPENDENT = 0,      // Able to bathe self in shower or tub independently
  SETUP_HELP = 1,       // With use of devices, able to bathe self
  INTERMITTENT_HELP = 2, // Able to bathe self with intermittent assistance
  ASSISTANCE = 3,       // Participates in bathing self but requires assistance
  DEPENDENT = 4         // Unable to use the toilet room
}

export enum M1840ToiletTransfer {
  INDEPENDENT = 0,      // Able to get to and from toilet independently
  SETUP_HELP = 1,       // When reminded, assisted, or supervised
  INTERMITTENT_HELP = 2, // Unable to get to and from toilet but can use
  DEPENDENT = 3         // Unable to get to and from toilet or bedside commode
}

export enum M1845ToiletingHygiene {
  INDEPENDENT = 0,      // Able to manage toileting hygiene and clothing management without assistance
  SETUP_HELP = 1,       // Able to manage if supplies/implements are laid out for the patient
  ASSISTANCE = 2,       // Someone must help maintain toileting hygiene and/or adjust clothing  
  DEPENDENT = 3         // Patient depends entirely upon another person to maintain toileting hygiene
}

export enum M1850Transferring {
  INDEPENDENT = 0,      // Able to independently transfer
  SUPERVISION = 1,      // Transfers with minimal human assistance or device
  LIMITED_ASSISTANCE = 2, // Unable to transfer self but able to bear weight
  EXTENSIVE_ASSISTANCE = 3, // Unable to transfer self, minimal weight bearing
  DEPENDENT = 4,        // Bedfast, unable to transfer
  NOT_ASSESSED = 5      // Not assessed because patient is not appropriate
}

export enum M1860Ambulation {
  INDEPENDENT = 0,      // Able to independently walk
  SUPERVISION = 1,      // With supervision, cuing, or coaxing
  LIMITED_ASSISTANCE = 2, // Requires use of device and assistance
  EXTENSIVE_ASSISTANCE = 3, // Able to walk with assistance of two people
  BEDFAST = 4,          // Chairfast, unable to ambulate
  NOT_ASSESSED = 5,     // Not assessed because patient uses wheelchair
  WHEELCHAIR = 6        // Not assessed because patient is bedfast
}

// Helper functions to get enum descriptions
export const getOasisDescription = {
  M1800: (value: M1800Grooming): string => {
    const descriptions = {
      [M1800Grooming.INDEPENDENT]: "Able to groom self unaided",
      [M1800Grooming.SETUP_HELP]: "Able to groom self with setup help", 
      [M1800Grooming.INTERMITTENT_HELP]: "Someone must help patient",
      [M1800Grooming.DEPENDENT]: "Patient depends entirely upon someone else"
    }
    return descriptions[value]
  },

  M1810: (value: M1810DressUpper): string => {
    const descriptions = {
      [M1810DressUpper.INDEPENDENT]: "Able to dress upper body unaided",
      [M1810DressUpper.SETUP_HELP]: "Able to dress upper body with setup help",
      [M1810DressUpper.INTERMITTENT_HELP]: "Someone must help patient", 
      [M1810DressUpper.DEPENDENT]: "Patient depends entirely upon someone else"
    }
    return descriptions[value]
  },

  M1820: (value: M1820DressLower): string => {
    const descriptions = {
      [M1820DressLower.INDEPENDENT]: "Able to dress lower body unaided",
      [M1820DressLower.SETUP_HELP]: "Able to dress lower body with setup help",
      [M1820DressLower.INTERMITTENT_HELP]: "Someone must help patient",
      [M1820DressLower.DEPENDENT]: "Patient depends entirely upon someone else"
    }
    return descriptions[value]
  },

  M1830: (value: M1830Bathing): string => {
    const descriptions = {
      [M1830Bathing.INDEPENDENT]: "Able to bathe self in shower or tub independently",
      [M1830Bathing.SETUP_HELP]: "With use of devices, able to bathe self",
      [M1830Bathing.INTERMITTENT_HELP]: "Able to bathe self with intermittent assistance",
      [M1830Bathing.ASSISTANCE]: "Participates in bathing self but requires assistance",
      [M1830Bathing.DEPENDENT]: "Unable to use the toilet room"
    }
    return descriptions[value]
  },

  M1840: (value: M1840ToiletTransfer): string => {
    const descriptions = {
      [M1840ToiletTransfer.INDEPENDENT]: "Able to get to and from toilet independently",
      [M1840ToiletTransfer.SETUP_HELP]: "When reminded, assisted, or supervised",
      [M1840ToiletTransfer.INTERMITTENT_HELP]: "Unable to get to and from toilet but can use",
      [M1840ToiletTransfer.DEPENDENT]: "Unable to get to and from toilet or bedside commode"
    }
    return descriptions[value]
  },

  M1845: (value: M1845ToiletingHygiene): string => {
    const descriptions = {
      [M1845ToiletingHygiene.INDEPENDENT]: "Able to manage toileting hygiene and clothing management without assistance",
      [M1845ToiletingHygiene.SETUP_HELP]: "Able to manage if supplies/implements are laid out for the patient",
      [M1845ToiletingHygiene.ASSISTANCE]: "Someone must help maintain toileting hygiene and/or adjust clothing",
      [M1845ToiletingHygiene.DEPENDENT]: "Patient depends entirely upon another person to maintain toileting hygiene"
    }
    return descriptions[value]
  },

  M1850: (value: M1850Transferring): string => {
    const descriptions = {
      [M1850Transferring.INDEPENDENT]: "Able to independently transfer",
      [M1850Transferring.SUPERVISION]: "Transfers with minimal human assistance or device",
      [M1850Transferring.LIMITED_ASSISTANCE]: "Unable to transfer self but able to bear weight",
      [M1850Transferring.EXTENSIVE_ASSISTANCE]: "Unable to transfer self, minimal weight bearing",
      [M1850Transferring.DEPENDENT]: "Bedfast, unable to transfer",
      [M1850Transferring.NOT_ASSESSED]: "Not assessed because patient is not appropriate"
    }
    return descriptions[value]
  },

  M1860: (value: M1860Ambulation): string => {
    const descriptions = {
      [M1860Ambulation.INDEPENDENT]: "Able to independently walk",
      [M1860Ambulation.SUPERVISION]: "With supervision, cuing, or coaxing",
      [M1860Ambulation.LIMITED_ASSISTANCE]: "Requires use of device and assistance",
      [M1860Ambulation.EXTENSIVE_ASSISTANCE]: "Able to walk with assistance of two people",
      [M1860Ambulation.BEDFAST]: "Chairfast, unable to ambulate",
      [M1860Ambulation.NOT_ASSESSED]: "Not assessed because patient uses wheelchair",
      [M1860Ambulation.WHEELCHAIR]: "Not assessed because patient is bedfast"
    }
    return descriptions[value]
  }
} 