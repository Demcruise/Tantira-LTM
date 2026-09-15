export interface Rep {
  name: string;
  capacity: number;
  territory: string[]; // HQ cities this rep owns
  specialties: string[]; // industries this rep is strongest in
}

export const REPS: Rep[] = [
  { name: "Rina Marlina", capacity: 8, territory: ["Jakarta", "Bandung"], specialties: ["Retail", "Logistics"] },
  { name: "Adi Nugraha", capacity: 8, territory: ["Surabaya", "Semarang", "Denpasar"], specialties: ["Technology", "Manufacturing"] },
  { name: "Sari Handayani", capacity: 8, territory: ["Jakarta", "Medan"], specialties: ["Financial Services", "Healthcare"] },
];

// Same territory taxonomy assignment routing already uses — scoped roles restrict
// to one of these rather than inventing a separate "team" concept.
export const ALL_TERRITORIES = Array.from(new Set(REPS.flatMap((r) => r.territory))).sort();
