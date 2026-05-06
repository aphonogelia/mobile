import Cal from '@/components/Cal'
import DiaryList from '@/components/DiaryList'
import EntryModal from '@/components/EntryModal'
import NewEntryForm from '@/components/NewEntryForm'
import Profile from '@/components/Profile'
import { useAppContext } from '@/context/AppContext'
import { colors, radius, spacing } from '@/utils/theme'
import { useEffect, useState } from 'react'
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type ViewMode = 'calendar' | 'list'

export default function Calendar() {

  const { selectedEntry, setSelectedEntry, entries, setCurrentView, selectedDate, setSelectedDate } = useAppContext()

  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')

  useEffect(() => { setCurrentView('calendar') }, [])

  console.log('filterDate:', selectedDate?.toISOString().split('T')[0])
  console.log('selectedDate raw:', selectedDate)
  console.log('selectedDate local:', selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : null)
  console.log('selectedDate utc:', selectedDate?.toISOString().split('T')[0])

  return (
    <ImageBackground
      source={require('../../assets/images/bgBlue.webp')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>

        <Profile />

        <View style={styles.divider} />

        {/* ── Toggle ── */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'calendar' && styles.toggleActive]}
            onPress={() => setViewMode('calendar')}
            activeOpacity={0.75}
          >
            <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>
              📅 Calendar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.75}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              📋 List
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'calendar' && <Cal />}


        <View style={styles.divider} />

        {/* ── Bottom Half: Entries ── */}
        <View style={styles.listContainer}>
          <DiaryList
            mode="full"
            filterDate={
              viewMode === 'calendar' && selectedDate
                ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
                : undefined
            } />
        </View>

        {/* ── FAB ── */}
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>

        <NewEntryForm
          visible={showForm}
          editEntry={selectedEntry}
          onClose={() => {
            setShowForm(false)
            setSelectedEntry(null)
          }}
        />

        <EntryModal
          visible={!!selectedEntry}
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={() => setShowForm(true)}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

const CELL_SIZE = 40

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radius.md,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.md - 2,
  },
  toggleActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.text.primary,
  },

  // List
  listContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 66, 153, 0.6)',
  },
  listHeading: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.75,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 2,
  },

  // FAB
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