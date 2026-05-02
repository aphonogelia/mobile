
import { supabase } from './supabase' // you'll need to create this
import { Entry, NewEntry } from './types'

export async function createEntry(entry: NewEntry): Promise<Entry> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('❌ fetchEntries error: No user logged in')
    throw new Error('No user logged in')
  }
  const { data, error } = await supabase
    .from('entries')
    .insert({ ...entry, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('❌ createEntry error:', error.message, error.details, error.hint)
    throw error
  }

  console.log('✅ createEntry success:', data)
  return data
}


export async function fetchEntries(): Promise<Entry[]> {

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ fetchEntries error:', error.message, error.details, error.hint)
    throw error
  }

  // console.log('✅ fetchEntries success:', data)
  return data
}

export async function modifEntry(id: string, updates: Partial<NewEntry>): Promise<Entry> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No user logged in')

  const { data, error } = await supabase
    .from('entries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('❌ modifEntry error:', error.message, error.details, error.hint)
    throw error
  }

  console.log('✅ modifEntry success:', data)
  return data
}



export async function deleteEntry(id: string): Promise<void> {

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('❌ deleteEntry error:', error.message, error.details, error.hint)
    throw error
  }

  console.log('✅ deleteEntry success:', id)

}
