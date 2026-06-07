import { useAppContext } from '@/context/AppContext'
import { CATEGORY_COLORS, MoodCategory, MOODS, type Entry } from '@/utils/types'
import { colors, fontFamilies, typography, radius } from '@/utils/theme'
import { useEffect } from 'react'
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

type Props = {
  entry: Entry | null
  visible: boolean
  onClose: () => void
  onEdit: () => void
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

export default function EntryModal({ entry, visible, onClose, onEdit }: Props) {

  const { removeEntry, error, clearError } = useAppContext()

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error)
      clearError()
    }
  }, [error, clearError])

  if (!entry) return null

  const moodIds = Array.isArray(entry.mood)
    ? entry.mood
    : (entry.mood ? [entry.mood] : [])

  const selectedMoods = MOODS.filter(m => moodIds.includes(m.id))

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeEntry(entry.id)
          onClose()
        },
      },
    ])
  }

  const { date, time } = formatDate(entry.created_at)


  const handleEdit = () => {
    onEdit()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.handle} />

        <View style={styles.topRow}>
          <View style={styles.dateTimeCol}>
            <Text style={styles.dateLabel}>{date}</Text>
            <Text style={styles.timeLabel}>{time}</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {selectedMoods.length > 0 && (
            <View style={styles.moodList}>
              {selectedMoods.map((m) => (
                <View
                  key={m.id}
                  style={[styles.labelPill, { backgroundColor: CATEGORY_COLORS[m.category as MoodCategory] + '22' }]}
                >
                  <Text style={[styles.moodLabel, { color: CATEGORY_COLORS[m.category as MoodCategory] }]}>
                    {m.label}
                  </Text>
                </View>
              ))}
            </View>
          )}



          <Text style={styles.title}>{entry.title}</Text>
          <View style={styles.divider} />
          {entry.content && <Text style={styles.body}>{entry.content}</Text>}


        </ScrollView>

        {/* Bottom action bar */}
        <View style={styles.bottomBar}>
          <Pressable onPress={handleEdit} style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgba(4, 8, 16, 0.96)',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 10,
    flexShrink: 0,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.text.muted,
    fontFamily: fontFamilies.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Fixed Bottom Bar layout
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 34, // Extra padding for iPhone "home bar" area
    backgroundColor: 'rgba(4, 8, 16, 0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surface.cardBorder,
  },
  scroll: {
    flex: 1, // This allows the scroll area to take up all space above the buttons
  },
  content: {
    padding: 18,
    paddingTop: 4,
    paddingBottom: 20, // Bottom padding for the text inside the scroll
  },
  // Enhanced Delete Button
  deleteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 138, 0.35)',
    backgroundColor: 'rgba(255, 107, 138, 0.10)',
  },
  deleteBtnText: {
    color: colors.accent.error,
    fontFamily: fontFamilies.medium,
    fontSize: 13,
  },
  // Added Missing Edit Button styles
  editBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.accent.primary,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editBtnText: {
    color: '#1A140B',
    fontFamily: fontFamilies.bold,
    fontSize: 13,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 12, color: colors.text.primary, fontFamily: fontFamilies.bold },

  moodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.cardBorder,
  },

  moodLabel: {
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
  title: {
    fontSize: 26,
    fontFamily: fontFamilies.heading,
    color: colors.text.primary,
    letterSpacing: -0.3,
    lineHeight: 32,
    marginBottom: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surface.cardBorder,
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 26,
  },
  dateTimeCol: {
    flex: 1,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  timeLabel: {
    fontSize: 9,
    color: colors.text.muted,
    fontFamily: fontFamilies.medium,
    marginTop: 2,
    letterSpacing: 0.5,
  },
})