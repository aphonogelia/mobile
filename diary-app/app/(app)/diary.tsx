import DiaryList from '@/components/DiaryList'
import EntryModal from '@/components/EntryModal'
import NewEntryForm from '@/components/NewEntryForm'
import Profile from '@/components/Profile'
import Stats from '@/components/Stats'
import { useAppContext } from '@/context/AppContext'
import { colors, radius, spacing } from '@/utils/theme'
import { useState } from 'react'
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'



export default function Diary() {

  const { selectedEntry, setSelectedEntry } = useAppContext()

  const [showForm, setShowForm] = useState(false)


  return (

    <ImageBackground
      source={require('../../assets/images/bgBlue.webp')}
      style={styles.bg}
      resizeMode="cover"
    >

      <SafeAreaView style={styles.safe}>

        <Profile onProfileEdit={() => setShowForm(true)} />
        <View style={styles.divider} />

          <DiaryList mode="preview" />

        <View style={styles.divider} />

        <View style={styles.statsContainer}>
          <Stats />
        </View>

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

      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({

  statsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 66, 153, 0.6)',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
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

})