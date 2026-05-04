
import { supabase } from './supabase'; // you'll need to create this
import { Entry, NewEntry } from './types';


export async function createEntry(entry: NewEntry): Promise<Entry> {

  const { data, error } = await supabase
    .from('entries')
    .insert(entry)
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

export async function fetchEntryCount(): Promise<number> {
  const { data, error } = await supabase
    .from('user_entry_stats')
    .select('*')
    .single()

  if (error) {
    console.error('❌ fetchEntryCount error:', error.message)
    throw error
  }

  console.log('✅ fetchEntryCount success:', data.total_entries)
  return data.total_entries
}

export async function editProfile(updates: { full_name?: string; avatar_url?: string }): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', session?.user?.id)

  if (error) {
    console.error('❌ editProfile error:', error.message, error.details, error.hint)
    throw error
  }

  console.log('✅ editProfile success')

}


export async function uploadAvatar(uri: string): Promise<string> {
  const ext = uri.split('.').pop() // filename
  const { data: { session } } = await supabase.auth.getSession()
  const path = `${session?.user?.id}/avatar.${ext}`

  const response = await fetch(uri)
  const blob = await response.blob() // binary large object

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { upsert: true }) // insert or update

  if (error) {
    console.error('❌ uploadAvatar error:', error.message)
    throw error
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}




