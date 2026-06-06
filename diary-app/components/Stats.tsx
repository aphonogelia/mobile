import { useAppContext } from '@/context/AppContext'
import { moodStats } from '@/utils/api'
import { colors, fontFamilies, radius, spacing, typography } from '@/utils/theme'
import { MOODS, MoodCategory, CATEGORY_COLORS } from '@/utils/types'
import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'


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
      <Text style={styles.sectionHeading}>Mood breakdown</Text>
      <View style={styles.card}>
        {stats.map((item, index) => {
          const mood = MOODS.find(m => m.id === item.mood)
          if (!mood) return null

          const barColor = CATEGORY_COLORS[mood.category as MoodCategory]

          return (
            <View key={item.mood}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                {/* Label + count */}
                <View style={styles.labelGroup}>
                  <View style={[styles.labelPill, { backgroundColor: barColor + '22' }]}>
                    <Text style={[styles.label, { color: barColor }]}>{mood.label}</Text>
                  </View>                  
                  <Text style={styles.count}>{item.count}×</Text>
                </View>

                {/* Progress bar */}
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${item.percentage}%` as any }]} />
                </View>

                {/* Percentage */}
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
  errorText: { color: colors.accent.error, fontSize: typography.sizes.sm },
  emptyText: { color: colors.text.muted, fontSize: typography.sizes.sm },

  container: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },

  sectionHeading: {
    fontSize: typography.sizes.xs,
    fontFamily: fontFamilies.medium,
    color: colors.text.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },

  // card wrapper
  card: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  // each mood row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: spacing.sm,
  },

  // left: label + count stacked vertically
  labelGroup: {
    width: 120,
    flexShrink: 0,
  },
  label: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: fontFamilies.medium,
  },
  labelPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  count: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 1,
  },

  // center: progress bar
  barTrack: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.text.primary,   // the cyan-blue brand color
  },

  // right: percentage
  percentage: {
    width: 60,
    textAlign: 'right',
    fontSize: typography.sizes.md,
    fontFamily: fontFamilies.bold,
    color: colors.text.primary,        // the golden secondary color
    flexShrink: 0,
  },
})