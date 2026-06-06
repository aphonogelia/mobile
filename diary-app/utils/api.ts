import * as FileSystem from 'expo-file-system/legacy';
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


export async function moodStats(): Promise<any> {

  const { data, error } = await supabase
    .from('mood_percentages')
    .select('*')

  if (error) {
    console.error('❌ moodStats error:', error.message, error.details, error.hint)
    throw error
  }

  console.log('✅ moodStats success:', data)
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
    .maybeSingle()

  if (error) {
    console.error('❌ fetchEntryCount error:', error.message)
    throw error
  }

  console.log('✅ fetchEntryCount success:', data?.total_entries ?? 0)
   return data?.total_entries ?? 0
}

export async function editProfile(updates: { full_name?: string; avatar_url?: string }): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  console.log('🔐 editProfile session:', updates.full_name ? updates.full_name : 'no name', updates.avatar_url ? 'with avatar' : 'no avatar')

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
  const ext = uri.split('.').pop()
  const { data: { session } } = await supabase.auth.getSession()
  const path = `${session?.user?.id}/avatar.${ext}`
   console.log('🔐 uploadAvatar session:', uri)
  //   const response = await fetch(uri)
  //   const blob = await response.blob() // binary large object - but failing on android,
  //  so we switch to expo-file-system
  // ✅ Read file as base64, then convert to ArrayBuffer
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',  // ✅ use string literal instead
  })
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg'

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, bytes.buffer, {
      contentType,
      upsert: true,
    })

  if (error) {
    console.error('❌ uploadAvatar error:', error.message)
    throw error
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}` // add timestamp to prevent caching
}

