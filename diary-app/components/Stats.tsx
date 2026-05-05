import { useAppContext } from '@/context/AppContext'
import { moodStats } from '@/utils/api'
import { colors, radius, spacing, typography } from '@/utils/theme'
import { MOODS } from '@/utils/types'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native'

type MoodStat = {
    mood: string
    count: number
    percentage: number
}

export default function Stats() {

    const [stats, setStats] = useState<MoodStat[]>([])
    const [loading, setLoading] = useState(true)
    const { error, setError } = useAppContext()

    useEffect(() => {
        moodStats()
            .then(setStats)
            .catch(() => setError('Failed to load stats'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <View style={styles.centered}>
            <ActivityIndicator color={colors.brand.mid} />
        </View>
    )

    if (error) return (
        <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
        </View>
    )

    if (stats.length === 0) return (
        <View style={styles.centered}>
            <Text style={styles.emptyText}>No mood data yet</Text>
        </View>
    )

    return (
        <ScrollView contentContainerStyle={styles.list}>
            <Text style={styles.heading}>Mood Breakdown</Text>
            {stats.map((item) => {
                const mood = MOODS.find(m => m.id === item.mood)
                if (!mood) return null

                return (
                    <View key={item.mood} style={styles.row}>
                        <Image source={mood.icon} style={styles.icon} />
                        <View style={styles.info}>
                            <Text style={styles.label}>{mood.label}</Text>
                            <View style={styles.barBg}>
                                <View style={[styles.barFill, { width: `${item.percentage}%` }]} />
                            </View>
                            <Text style={styles.percentage}>{item.percentage}%</Text>
                        </View>
                    </View>
                )
            })}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: colors.semantic.error,
        fontSize: typography.sizes.md,
    },
    emptyText: {
        color: colors.text.muted,
        fontSize: typography.sizes.md,
    },
    heading: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface.card,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.surface.cardBorder,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
    },
    icon: {
        width: 20,
        height: 20,
    },
    info: {
        flex: 1,
        flexDirection: 'row',   // 👈 put label, bar, percentage all in one line
        alignItems: 'center',
        gap: spacing.sm,
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.text.primary,
        width: 80,              // fixed width so bars align
    },
    barBg: {
        flex: 1,
        height: 4,
        borderRadius: radius.full,
        backgroundColor: colors.surface.glass,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: radius.full,
        backgroundColor: colors.brand.mid,
    },
    percentage: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
        width: 36,
        textAlign: 'right',
    },
    list: {
        padding: spacing.sm,
        gap: 4,                 // tighter gap between rows
    },
})