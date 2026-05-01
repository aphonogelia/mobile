import { View, StyleSheet, ImageBackground, Pressable, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'

import DiaryList from '@/components/DiaryList'
import NewEntryForm from '@/components/NewEntryForm'
import EntryModal from '@/components/EntryModal' // Import the display modal

import { useAppContext } from '@/context/AppContext'
import { colors, radius } from '@/constants/theme'
import { Entry } from '@/types/types'

export default function Diary() {
  const { selectedEntry, setSelectedEntry } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)


  return (
    <ImageBackground
      source={require('../../assets/images/bgBlue.webp')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>

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
            editEntry={editEntry}
            onClose={() => {
              setShowForm(false)
              setEditEntry(null)
            }
            }
          />

          <EntryModal
            visible={!!selectedEntry}
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
            onEdit={(entry) => {
              setEditEntry(entry)
              setShowForm(true)
            }}
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
    // Added a slight shadow for the FAB to pop against the BG
    elevation: 5,
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
})