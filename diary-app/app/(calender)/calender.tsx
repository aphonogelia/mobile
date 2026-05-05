import DiaryList from '@/components/DiaryList'
import EntryModal from '@/components/EntryModal'
import NewEntryForm from '@/components/NewEntryForm'
import Profile from '@/components/Profile'
import Stats from '@/components/Stats'
import { useAppContext } from '@/context/AppContext'
import { colors, radius, spacing } from '@/utils/theme'
import { useState, useMemo } from 'react'
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type ViewMode = 'calendar' | 'list'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function Calender() {
  const { selectedEntry, setSelectedEntry, entries } = useAppContext()

  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  // Build a set of date strings that have entries, e.g. "2025-06-14"
  const entryDateSet = useMemo(() => {
    const set = new Set<string>()
    ;(entries ?? []).forEach((e: any) => {
      const d = new Date(e.created_at)
      set.add(toDateKey(d))
    })
    return set
  }, [entries])

  function toDateKey(d: Date) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }

  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }

  function prevMonth() {
    setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))
  }

  // Grid of days for the current calendar month
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < firstDow; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    return cells
  }, [calendarMonth])

  const today = new Date()

  return (
    <ImageBackground
      source={require('../../assets/images/bgBlue.webp')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <Profile onProfileEdit={() => setShowForm(true)} />
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

        {/* ── Top Half: Calendar or nothing extra in list mode ── */}
        {viewMode === 'calendar' && (
          <View style={styles.calendarContainer}>
            {/* Month nav */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                <Text style={styles.navArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthLabel}>
                {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                <Text style={styles.navArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day-of-week headers */}
            <View style={styles.dayHeaders}>
              {DAYS.map(d => (
                <Text key={d} style={styles.dayHeader}>{d}</Text>
              ))}
            </View>

            {/* Date grid */}
            <View style={styles.grid}>
              {calendarDays.map((day, idx) => {
                if (!day) return <View key={`empty-${idx}`} style={styles.cell} />
                const isToday = isSameDay(day, today)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const hasEntry = entryDateSet.has(toDateKey(day))
                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.cell,
                      isToday && styles.cellToday,
                      isSelected && styles.cellSelected,
                    ]}
                    onPress={() => setSelectedDate(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.cellText,
                      isToday && styles.cellTextToday,
                      isSelected && styles.cellTextSelected,
                    ]}>
                      {day.getDate()}
                    </Text>
                    {hasEntry && (
                      <View style={[styles.dot, isSelected && styles.dotSelected]} />
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        <View style={styles.divider} />

        {/* ── Bottom Half: Entries ── */}
        <View style={styles.listContainer}>
          {viewMode === 'calendar' && selectedDate && (
            <Text style={styles.listHeading}>
              {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          )}
          <DiaryList
            mode="full"
            filterDate={viewMode === 'calendar' ? selectedDate ?? undefined : undefined}
          />
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

  // Calendar
  calendarContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navBtn: {
    padding: 8,
  },
  navArrow: {
    fontSize: 26,
    color: colors.text.primary,
    lineHeight: 28,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  dayHeader: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    rowGap: 4,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cellSelected: {
    backgroundColor: colors.surface.card,
  },
  cellText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  cellTextToday: {
    fontWeight: '700',
  },
  cellTextSelected: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: colors.text.primary,
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