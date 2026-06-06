
export interface Entry {
  id: string
  title: string
  mood: MoodId[]
  content: string
  created_at: string // ISO timestamp
  updated_at?: string
}

export const CATEGORY_COLORS = {
  uplifting: '#f7e927',
  calm: '#fffab2',
  low: '#f899c0',
  activated: '#fc5097',
} as const


export type NewEntry = Omit<Entry, 'id' | 'created_at' | 'updated_at'>

export const MOODS = [
  { id: 'love', label: 'Love', category: 'uplifting' },
  { id: 'excited', label: 'Excited', category: 'uplifting' },
  { id: 'joy', label: 'Joy', category: 'uplifting' },
  { id: 'serene', label: 'Serene', category: 'calm' },
  { id: 'capable', label: 'Capable', category: 'calm' },
  { id: 'gratitude', label: 'Gratitude', category: 'calm' },
  { id: 'hope', label: 'Hope', category: 'calm' },
  { id: 'numb', label: 'Numb', category: 'low' },
  { id: 'fragile', label: 'Fragile', category: 'low' },
  { id: 'sad', label: 'Sad', category: 'low' },
  { id: 'powerless', label: 'Powerless', category: 'low' },
  { id: 'shame', label: 'Shame', category: 'low' },
  { id: 'overwhelmed', label: 'Overwhelmed', category: 'activated' },
  { id: 'fear', label: 'Fear', category: 'activated' },
  { id: 'tense', label: 'Tense', category: 'activated' },
  { id: 'anger', label: 'Anger', category: 'activated' },
] as const

export type MoodId = typeof MOODS[number]['id']
export type Mood = typeof MOODS[number]
export type MoodCategory = keyof typeof CATEGORY_COLORS

