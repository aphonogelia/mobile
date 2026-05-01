import { useEffect, useState } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { AppProvider } from '@/context/AppContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'


export default function RootLayout() {

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true)
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (loading) return

    const inAuth = segments[0] === '(auth)'

    if (!session && !inAuth) {
      router.replace('/(auth)/landing')
    } else if (session && inAuth) {
      router.replace('/(app)/diary')
    }
  }, [session, loading, segments])

  if (loading) return null

  return (
    <AppProvider>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </AppProvider>
  )
}
