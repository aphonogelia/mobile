import { supabase } from '@/utils/supabase'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { createEntry, deleteEntry, editProfile, fetchEntries, fetchEntryCount, modifEntry } from '../utils/api'
import { Entry, NewEntry } from '../utils/types'

interface UserProfile {
  userName: string | null
  avatarUrl: string | null
  entryCount: number
}

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
  profile: UserProfile | null
  updateProfile: (updates: { userName?: string, avatarUrl?: string }) => Promise<void>
  setError: (error: string | null) => void
  currentView: 'home' | 'calendar'
  setCurrentView: (view: 'home' | 'calendar') => void
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<Entry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [entryCount, setEntryCount] = useState<number>(0)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'home' | 'calendar'>('home')
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
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

  const countEntry = async () => {
    try {
      const count = await fetchEntryCount()
      setEntryCount(count)
    } catch (err) {
      setError('Failed to fetch entry count')
    }
  }


  const addEntry = async (entry: NewEntry) => {
    try {
      const created = await createEntry(entry)
      setEntries(prev => [created, ...prev])  // prepend, no refetch
      setEntryCount(prev => prev + 1)
    } catch {
      setError('Failed to create entry')
    }
  }


  const removeEntry = async (id: string) => {
    try {
      await deleteEntry(id)
      setEntries(prev => prev.filter(e => e.id !== id))  // remove locally, no refetch
      setEntryCount(prev => prev - 1)
    } catch {
      setError('Failed to delete entry')
    }
  }

  const updateEntry = async (id: string, entry: NewEntry) => {
    try {
      const updated = await modifEntry(id, entry)
      setEntries(prev => prev.map(e => e.id === id ? updated : e))  // replace locally, no refetch
      setSelectedEntry(updated)  // keep selectedEntry in sync
    } catch {
      setError('Failed to update entry')
    }
  }

  const updateProfile = async (updates: { userName?: string; avatarUrl?: string }) => {
    try {
      await editProfile({
        full_name: updates.userName,
        avatar_url: updates.avatarUrl
      })
      if (updates.userName) setUserName(updates.userName)
      if (updates.avatarUrl) setAvatarUrl(updates.avatarUrl)
    } catch {
      setError('Failed to update profile')
    }
  }


  const fetchNameURL = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .single()

      if (!error) {
        setUserName(data.full_name)
        setAvatarUrl(data.avatar_url)
      }
    } catch {
      console.error('Failed to fetch name and avatar URL')
    }
  }


  const clearError = () => setError(null)

  // listener is set up to react to auth events (sign in/out) and refresh or clear 
  // entries accordingly
  useEffect(() => {

    // handle already-logged-in user on app load
    // supabase.auth.getSession().then(({ data: { session } }) => {
    //   if (session) {
    //     refreshEntries()
    //     fetchNameURL()
    //     countEntry()
    //   }
    // })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        refreshEntries()
        fetchNameURL()
        countEntry()
      } else if (event === 'SIGNED_OUT') {
        setEntries([])
        setUserName(null)
        setEntryCount(0)
        setAvatarUrl(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AppContext.Provider value={{
      entries, error, loading,
      addEntry, removeEntry, refreshEntries,
      selectedEntry, setSelectedEntry,
      clearError, updateEntry,
      profile: { entryCount, userName, avatarUrl },
      updateProfile,
      setError,
      currentView, setCurrentView,
      selectedDate, setSelectedDate

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