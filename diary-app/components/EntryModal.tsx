import { Alert, View, Text, Pressable, Modal, ScrollView, StyleSheet, Image } from 'react-native'
import { MOODS, type Entry } from '@/types/types'
import { useAppContext } from '@/context/AppContext'

type Props = {
  entry: Entry | null
  visible: boolean
  onClose: () => void
  onEdit: (entry: Entry) => void
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function EntryModal({ entry, visible, onClose, onEdit }: Props) {
  const { removeEntry } = useAppContext()

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

  const handleEdit = () => {
    onClose()
    onEdit(entry)
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
          <Text style={styles.dateLabel}>{formatDate(entry.created_at)}</Text>
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
                <View key={m.id} style={styles.moodBadge}>
                  <Image source={m.icon} style={styles.moodIcon} />
                  <Text style={styles.moodLabel}>{m.label}</Text>
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
    backgroundColor: '#F0F5FF',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#C2D4EE',
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
    color: '#5A7FB5',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
    marginRight: 12,
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
    backgroundColor: '#F0F5FF', // Match container bg
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C2D4EE',
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
    borderColor: '#E07A5F',
    backgroundColor: '#FFF5F2', // Light tint for better visibility
  },
  deleteBtnText: {
    color: '#E07A5F',
    fontWeight: '600',
    fontSize: 13,
  },
  // Added Missing Edit Button styles
  editBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#014DB4',
    shadowColor: '#014DB4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: '#DDE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 12, color: '#3A6199', fontWeight: '700' },

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
    backgroundColor: '#E4EDFA',
    borderWidth: 1,
    borderColor: '#C2D4EE',
  },
  moodIcon: { width: 14, height: 14 },
  moodLabel: { fontSize: 11, fontWeight: '600', color: '#4A6FA5' },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0A1F3D',
    letterSpacing: -0.3,
    lineHeight: 32,
    marginBottom: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C2D4EE',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: '#1A2E44',
    lineHeight: 26,
  },
})