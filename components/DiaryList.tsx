import { useAppContext } from '@/context/AppContext'
import { groupEntriesByDate } from '@/utils/function'
import { colors, fontFamilies, radius, spacing, typography } from '@/utils/theme'
import { MOODS, CATEGORY_COLORS, MoodCategory } from '@/utils/types'
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View } from 'react-native'

export default function DiaryList({ filterDate }: { filterDate?: string }) {

  const { entries, setSelectedEntry, loading } = useAppContext()

  const displayEntries = filterDate
    ? entries.filter(e => {
      if (!e.created_at) return false
      const d = new Date(e.created_at)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}` === filterDate
    })
    : entries

  const groupedEntries = groupEntriesByDate(displayEntries)

  if (loading && entries.length === 0)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#014DB4" />
      </View>
    )

  if (displayEntries.length === 0)
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No entries</Text>
      </View>
    )

  return (
    <SectionList
      sections={groupedEntries}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.date}</Text>
      )}
      renderItem={({ item }) => {
        const moodIds = Array.isArray(item.mood) ? item.mood : item.mood ? [item.mood] : []
        const selectedMoods = MOODS.filter(m => moodIds.includes(m.id))
        const time = item.created_at
          ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : null

        return (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => setSelectedEntry(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              {time && <Text style={styles.cardTime}>{time}</Text>}
            </View>

            {selectedMoods.length > 0 && (
              <View style={styles.moodRow}>
                {selectedMoods.map(m => (
                  <View key={m.id} style={[styles.labelPill, { backgroundColor: CATEGORY_COLORS[m.category as MoodCategory] + '22' }]}>
                    <Text style={[styles.moodBtnLabel, { color: CATEGORY_COLORS[m.category as MoodCategory] }]}>
                      {m.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  list: { padding: spacing.sm, gap: spacing.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: typography.sizes.lg, color: colors.text.secondary },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: {
    fontSize: typography.sizes.sm,
    fontFamily: fontFamilies.bold,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surface.cardBorder,
    padding: spacing.sm,
  },
  cardPressed: {
    backgroundColor: colors.surface.glassHover
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: fontFamilies.medium,
    color: colors.text.primary,
    flex: 1,
  },
  cardTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginLeft: spacing.sm,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },

  moodBtnLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: fontFamilies.medium,
    color: colors.text.secondary
  },

  labelPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
})