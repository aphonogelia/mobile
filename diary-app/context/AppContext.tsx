import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Entry, NewEntry } from '../utils/types'
import { fetchEntries, createEntry, deleteEntry, modifEntry } from '../utils/api'
import { supabase } from '@/utils/supabase'


interface AppContextType {
  entries: Entry[]
  error: string | null
  loading: boolean
  addEntry: (entry: NewEntry) => Promise<void>
  removeEntry: (id: string) => Promise<void>
  updateEntry: (id: string, entry: NewEntry) => Promise<void>
  refreshEntries: () => Promise<void>
  selectedEntry: Entry | null
  setSelectedEntry: (entry: Entry | null) => void
  clearError: () => void
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

  // const addEntry = async (entry: NewEntry) => {
  //   try {
  //     await createEntry(entry)
  //     console.log('Entry created successfully')
  //     await refreshEntries()
  //     console.log('Entry refreshed successfully')
  //   } catch (err) {
  //     setError('Failed to create entry')
  //   }
  // }

  const addEntry = async (entry: NewEntry) => {
    try {
      const created = await createEntry(entry)
      setEntries(prev => [created, ...prev])  // prepend, no refetch
    } catch {
      setError('Failed to create entry')
    }
  }


  // const removeEntry = async (id: string) => {
  //   try {
  //     await deleteEntry(id)
  //     console.log('Entry deleted successfully')

  //     await refreshEntries()
  //     console.log('Entry refreshed successfully')
  //   } catch (err) {
  //     setError('Failed to delete entry')
  //   }
  // }

  const removeEntry = async (id: string) => {
    try {
      await deleteEntry(id)
      setEntries(prev => prev.filter(e => e.id !== id))  // remove locally, no refetch
    } catch {
      setError('Failed to delete entry')
    }
  }

  // const updateEntry = async (id: string, entry: NewEntry) => {
  //   try {
  //     await modifEntry(id, entry)
  //     console.log('Entry updated successfully')

  //     await refreshEntries()
  //     console.log('Entry refreshed successfully')
  //   } catch (err) {
  //     setError('Failed to update entry')
  //   }
  // }

  const updateEntry = async (id: string, entry: NewEntry) => {
    try {
      const updated = await modifEntry(id, entry)
      setEntries(prev => prev.map(e => e.id === id ? updated : e))  // replace locally, no refetch
      setSelectedEntry(updated)  // keep selectedEntry in sync
    } catch {
      setError('Failed to update entry')
    }
  }

  const clearError = () => setError(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        refreshEntries()
      } else if (event === 'SIGNED_OUT') {
        setEntries([])
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AppContext.Provider value={{
      entries, error, loading,
      addEntry, removeEntry, refreshEntries,
      selectedEntry, setSelectedEntry, clearError, updateEntry
    }}>
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