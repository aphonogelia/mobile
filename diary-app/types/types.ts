


export interface Entry {
  id: string
  title: string
  mood?: MoodId[]
  content: string
  created_at: string // ISO timestamp
  updated_at?: string
}

export type NewEntry = Omit<Entry, 'id' | 'created_at'>

export const MOODS = [
  { id: 'love', label: 'Love', icon: require('../assets/moods/love.png'), category: 'positive' },
  { id: 'excited', label: 'excited', icon: require('../assets/moods/excited.png'), category: 'positive' },
  { id: 'joy', label: 'Joy', icon: require('../assets/moods/joy.png'), category: 'positive' },
  { id: 'serene', label: 'Serene', icon: require('../assets/moods/serene.png'), category: 'positive' },
  { id: 'capable', label: 'Capable', icon: require('../assets/moods/capable.png'), category: 'positive' },
  { id: 'gratitude', label: 'Gratitude', icon: require('../assets/moods/gratitude.png'), category: 'positive' },
  { id: 'hope', label: 'Hope', icon: require('../assets/moods/hope.png'), category: 'positive' },
  { id: 'fragile', label: 'Fragile', icon: require('../assets/moods/fragile.png'), category: 'negative' },
  { id: 'numb', label: 'Numb', icon: require('../assets/moods/numb.png'), category: 'neutral' },
  { id: 'sad', label: 'Sad', icon: require('../assets/moods/sad.png'), category: 'negative' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: require('../assets/moods/overwhelmed.png'), category: 'negative' },
  { id: 'shame', label: 'Shame', icon: require('../assets/moods/shame.png'), category: 'negative' },
  { id: 'fear', label: 'Fear', icon: require('../assets/moods/fear.png'), category: 'negative' },
  { id: 'powerless', label: 'Powerless', icon: require('../assets/moods/powerless.png'), category: 'negative' },
  { id: 'tense', label: 'Tense', icon: require('../assets/moods/tense.png'), category: 'negative' },
  { id: 'anger', label: 'Anger', icon: require('../assets/moods/anger.png'), category: 'negative' },
] as const

export type MoodId = typeof MOODS[number]['id']
export type Mood = typeof MOODS[number]
