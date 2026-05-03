import { View, StyleSheet, ImageBackground, Pressable, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import DiaryList from '@/components/DiaryList'
import NewEntryForm from '@/components/NewEntryForm'
import EntryModal from '@/components/EntryModal'
import { useAppContext } from '@/context/AppContext'
import { colors, radius } from '@/utils/theme'
import { supabase } from '@/utils/supabase'
import { router } from 'expo-router'


export default function Diary() {

  const { selectedEntry, setSelectedEntry, refreshEntries } = useAppContext()

  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState<any>(null)

  // getUser info for the profile
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    refreshEntries()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/(auth)/landing')
  }

  return (
    <ImageBackground
      source={require('../../assets/images/bgBlue.webp')}
      style={styles.bg}
      resizeMode="cover"
    >

      <SafeAreaView style={styles.safe}>

        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.userName}>
              {user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? ''}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
              onPress={handleLogout}
              hitSlop={8}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>

          <DiaryList />


          <Pressable
            style={({ pressed }) => [
              styles.fab,
              pressed && styles.fabPressed,
            ]}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.fabIcon}>+</Text>
          </Pressable>

          <NewEntryForm
            visible={showForm}
            editEntry={selectedEntry} // if new, selectedEntry is null, if edit, it's the entry to edit
            onClose={() => {
              setShowForm(false)
              setSelectedEntry(null)
            }
            }
          />

          <EntryModal
            visible={!!selectedEntry}
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
            onEdit={() => { setShowForm(true) }}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    backgroundColor: 'rgba(0, 66, 153, 0.6)',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabPressed: {
    backgroundColor: colors.surface.glassHover,
    transform: [{ scale: 0.95 }],
  },
  fabIcon: {
    fontSize: 28,
    color: colors.text.primary,
    lineHeight: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoutBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
})