import { View, Text, ActivityIndicator, SectionList, StyleSheet, Pressable, Image } from 'react-native'
import { MOODS } from '@/utils/types'
import { useAppContext } from '@/context/AppContext'
import { colors, typography, spacing, radius } from '@/utils/theme'
import { groupEntriesByDate } from '@/utils/function'


export default function DiaryList() {

    const { entries, setSelectedEntry, loading } = useAppContext()
    
    const groupedEntries = groupEntriesByDate(entries)

    // loading  
    if (loading && entries.length === 0)
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#014DB4" />
            </View>
        )

    // no entries
    if (entries.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>No entries</Text>
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



                return (
                    <Pressable
                        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                        onPress={() => setSelectedEntry(item)}
                    >
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>

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
    cardTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
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