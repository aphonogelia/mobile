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
      <View style={styles.card}>
        {stats.map((item, index) => {
          const mood = MOODS.find(m => m.id === item.mood)
          if (!mood) return null

          return (
            <View key={item.mood}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <Image source={mood.icon} style={styles.icon} />
                <Text style={styles.label} numberOfLines={1}>{mood.label}</Text>
                <Text style={styles.count}>{item.count}×</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${item.percentage}%` }]} />
                </View>
                <Text style={styles.percentage}>{item.percentage}%</Text>
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

  // single card
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginHorizontal: 2,
  },

  // each mood row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  icon: { width: 20, height: 20 },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    width: 80,
  },
  count: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'right',
    paddingRight: spacing.sm,
    width: 30,
  },
  barBg: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.55)', 
  },
  percentage: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    width: 50,
    textAlign: 'right',
    paddingLeft: spacing.sm,
  },
})