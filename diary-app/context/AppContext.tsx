import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Entry, NewEntry } from '../types/types'
import { fetchEntries, createEntry, deleteEntry } from '../utils/api'
import { supabase } from '@/lib/supabase'


interface AppContextType {
  entries: Entry[]
  error: string | null
  loading: boolean
  addEntry: (entry: NewEntry) => Promise<void>
  removeEntry: (id: string) => Promise<void>
  refreshEntries: () => Promise<void>
  selectedEntry: Entry | null
  setSelectedEntry: (entry: Entry | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<Entry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)


  const refreshEntries = async () => {

    setLoading(true)
    try {
      const data = await fetchEntries()
      console.log('Entry fetched successfully')

      setEntries(data)
      setError(null)
    } catch (err) {
      setError('Failed to load entries')
    } finally {
      setLoading(false)
    }
  }

  const addEntry = async (entry: NewEntry) => {
    try {
      await createEntry(entry)
      console.log('Entry created successfully')
      await refreshEntries()
      console.log('Entry refreshed successfully')

    } catch (err) {
      setError('Failed to create entry')
    }
  }

  const removeEntry = async (id: string) => {
    try {
      await deleteEntry(id)
      console.log('Entry deleted successfully')

      await refreshEntries()
      console.log('Entry refreshed successfully')
    } catch (err) {
      setError('Failed to delete entry')
    }
  }



  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        refreshEntries()
      } else {
        setEntries([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AppContext.Provider value={{ entries, error, loading, addEntry, removeEntry, refreshEntries, selectedEntry, setSelectedEntry }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}