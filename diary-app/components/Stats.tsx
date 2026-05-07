import { useAppContext } from '@/context/AppContext'
import { moodStats } from '@/utils/api'
import { colors, radius, spacing, typography } from '@/utils/theme'
import { MOODS } from '@/utils/types'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'

type MoodStat = {
  mood: string
  count: number
  percentage: number
}

export default function Stats() {
  const { entries } = useAppContext()

  const [stats, setStats] = useState<MoodStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    moodStats()
      .then(setStats)
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false))
  }, [entries])

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
    <View style={styles.container}>
      <Text style={styles.heading}>Mood Breakdown</Text>
      <View style={styles.grid}>
        {stats.map(item => {
          const mood = MOODS.find(m => m.id === item.mood)
          if (!mood) return null

          return (
            <View key={item.mood} style={styles.card}>
              <View style={styles.cardTop}>
                <Image source={mood.icon} style={styles.icon} />
              <Text style={styles.count}>{item.count}×</Text>
              <Text style={styles.label} numberOfLines={1}>{mood.label}</Text>
                <Text style={styles.percentage}>{item.percentage}%</Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${item.percentage}%` }]} />
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { color: colors.semantic.error, fontSize: typography.sizes.sm },
  emptyText: { color: colors.text.muted, fontSize: typography.sizes.sm },

  container: {
    padding: spacing.sm,
  },
  heading: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  card: {
    width: '48.5%',
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.cardBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: { width: 22, height: 22 },
  percentage: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  barBg: {
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.surface.glass,
    overflow: 'hidden',
    marginVertical: 2,
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.text.primary,
  },
  count: {
    fontSize: 10,
    color: colors.text.muted,
  },
})