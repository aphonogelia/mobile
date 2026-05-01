import { View, Text, SectionList, StyleSheet, Pressable, Image } from 'react-native'
import { MOODS } from '@/types/types'
import { useAppContext } from '@/context/AppContext'
import { colors, typography, spacing, radius } from '@/constants/theme'
import { groupEntriesByDate } from '@/utils/function'

export default function DiaryList() {
    const { entries, setSelectedEntry } = useAppContext()
    const groupedEntries = groupEntriesByDate(entries)

    return (
        <View style={styles.container}>
            {entries.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No entries</Text>
                </View>
            ) : (
                <SectionList
                    sections={groupedEntries}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderSectionHeader={({ section }) => (
                        <Text style={styles.sectionHeader}>
                            {section.date}
                        </Text>
                    )}
                    renderItem={({ item }) => {
                        // 1. Normalize mood to an array (handles legacy string data or undefined)
                        const moodIds = Array.isArray(item.mood)
                            ? item.mood
                            : (item.mood ? [item.mood] : [])

                        // 2. Get the actual mood objects
                        const selectedMoods = MOODS.filter(m => moodIds.includes(m.id))

                        return (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.card,
                                    pressed && styles.cardPressed,
                                ]}
                                onPress={() => setSelectedEntry(item)}
                            >
                                <View style={styles.cardRight}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>
                                        {item.title}
                                    </Text>

                                    {/* 3. Render the row of icons */}
                                    {selectedMoods.length > 0 && (
                                        <View style={styles.moodRow}>
                                            {selectedMoods.map((m) => (
                                                <Image
                                                    key={m.id}
                                                    source={m.icon}
                                                    style={styles.moodSmallIcon}
                                                />
                                            ))}
                                            {/* Optional: Add a label if only one mood is selected */}
                                            {selectedMoods.length === 1 && (
                                                <Text style={styles.cardMood}>
                                                    {selectedMoods[0].label}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                        )
                    }}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({

    sectionHeader: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        color: colors.text.muted,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    container: {
        flex: 1,
    },
    list: {
        padding: spacing.sm,
        gap: spacing.xs,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.surface.cardBorder,
        padding: spacing.sm,
    },
    cardPressed: {
        backgroundColor: colors.surface.glassHover,
    },
    moodIcon: {
        width: 44,
        height: 44,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    cardRight: {
        flex: 1,
    },
    cardDate: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
        fontWeight: typography.weights.medium,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.xs,
    },
    cardTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    // cardMood: {
    //     fontSize: typography.sizes.sm,
    //     fontWeight: typography.weights.medium,
    // },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    emptyEmoji: {
        fontSize: 48,
    },
    emptyText: {
        fontSize: typography.sizes.lg,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },

    moodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    moodSmallIcon: {
        width: 15,
        height: 15,
    },

    cardMood: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.text.secondary,
    },
    moodContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    moodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface.card,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.surface.cardBorder,
    },
    miniIcon: {
        width: 14,
        height: 14,
        marginRight: 4,
    },
    moodLabel: {
        fontSize: 12,
        color: colors.text.primary,
    },
})