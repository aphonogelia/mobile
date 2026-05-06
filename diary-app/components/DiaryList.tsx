import { useAppContext } from '@/context/AppContext'
import { groupEntriesByDate } from '@/utils/function'
import { colors, radius, spacing, typography } from '@/utils/theme'
import { MOODS } from '@/utils/types'
import { ActivityIndicator, Image, Pressable, SectionList, StyleSheet, Text, View } from 'react-native'


export default function DiaryList({ mode = 'preview', filterDate }: {
    mode?: 'preview' | 'full'
    filterDate?: string
}) {

    const { entries, setSelectedEntry, loading } = useAppContext()

    // filter by date if provided (calendar view)
    const filteredEntries = filterDate
        ? entries.filter(e => {
            if (!e.created_at) return false
            const d = new Date(e.created_at)
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            return `${y}-${m}-${day}` === filterDate
        })
        : entries

    // in preview mode, only show last 2
    const displayEntries = mode === 'preview'
        ? filteredEntries.slice(0, 2)
        : filteredEntries

    const groupedEntries = groupEntriesByDate(displayEntries)

    console.log('filterDate received:', filterDate)
    console.log('entry dates:', entries.map(e => e.created_at))
    console.log('displayEntries:', displayEntries.length, 'filteredEntries:', filteredEntries.length)

    if (loading && entries.length === 0)
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#014DB4" />
            </View>
        )

    if (displayEntries.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>No entries</Text>
            </View>
        )
    }

    if (mode === 'preview') {
        return (
            <View style={styles.list}>
                {displayEntries.map(item => {
                    const moodIds = Array.isArray(item.mood) ? item.mood : item.mood ? [item.mood] : []
                    const selectedMoods = MOODS.filter(m => moodIds.includes(m.id))
                    const time = item.created_at
                        ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : null

                    return (
                        <Pressable
                            key={item.id}
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
                                        <Image key={m.id} source={m.icon} style={styles.moodIcon} />
                                    ))}
                                    {selectedMoods.length === 1 && (
                                        <Text style={styles.moodLabel}>{selectedMoods[0].label}</Text>
                                    )}
                                </View>
                            )}
                        </Pressable>
                    )
                })}
            </View>
        )
    }

    return (
        <SectionList
            sections={groupedEntries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderSectionHeader={({ section }) => (
                <Text style={styles.sectionHeader}>{section.date}</Text>
            )}
            renderItem={({ item }) => {
                const moodIds = Array.isArray(item.mood) ? item.mood : item.mood ? [item.mood] : []
                const selectedMoods = MOODS.filter(m => moodIds.includes(m.id))

                // format time from created_at
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
                                    <Image key={m.id} source={m.icon} style={styles.moodIcon} />
                                ))}
                                {selectedMoods.length === 1 && (
                                    <Text style={styles.moodLabel}>{selectedMoods[0].label}</Text>
                                )}
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
    sectionHeader: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        color: colors.text.muted,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.surface.cardBorder,
        padding: spacing.sm,
    },
    cardPressed: { backgroundColor: colors.surface.glassHover },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: spacing.xs,
    },
    cardTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        flex: 1,
    },
    cardTime: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
        marginLeft: spacing.sm,
    },
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moodRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    moodIcon: { width: 15, height: 15 },
    moodLabel: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.text.secondary,
    },
})