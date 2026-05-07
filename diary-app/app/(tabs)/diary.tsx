import Cal from '@/components/Cal'
import DiaryList from '@/components/DiaryList'
import EntryModal from '@/components/EntryModal'
import NewEntryForm from '@/components/NewEntryForm'
import Profile from '@/components/Profile'
import { useAppContext } from '@/context/AppContext'
import { colors, radius, spacing } from '@/utils/theme'
import { useRef, useState } from 'react'
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import PagerView from 'react-native-pager-view'
import { SafeAreaView } from 'react-native-safe-area-context'

const TABS = [
  { key: 'list', label: '📋', title: 'Entries' },
  { key: 'calendar', label: '📅', title: 'Calendar' },
  { key: 'profile', label: '👤', title: 'Profile' },
]

export default function Diary() {
  const {
    selectedEntry,
    setSelectedEntry,
    selectedDate,
    profile,
  } = useAppContext()

  const [activeTab, setActiveTab] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const pagerRef = useRef<PagerView>(null)

  const goToTab = (index: number) => {
    pagerRef.current?.setPage(index)
    setActiveTab(index)
  }

  const filterDate = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : undefined

  const fab = (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      onPress={() => setShowForm(true)}
    >
      <Text style={styles.fabIcon}>+</Text>
    </Pressable>
  )

  return (
    <ImageBackground
      source={
        profile?.backgroundUrl
          ? { uri: profile.backgroundUrl }
          : require('../../assets/images/bgBlue.webp')
      }
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>


        {/* ── Swipeable pages ── */}
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={e => setActiveTab(e.nativeEvent.position)}
        >

          {/* Page 0 — Entries list */}
          <View key="list" style={styles.page}>
            <View style={styles.listContainer}>
              <DiaryList />
            </View>
            {fab}
          </View>

          {/* Page 1 — Calendar + filtered list */}
          <View key="calendar" style={styles.page}>
            <Cal />
            <View style={styles.divider} />
            <View style={styles.listContainer}>
              <DiaryList filterDate={filterDate} />
            </View>
            {fab}
          </View>

          {/* Page 2 — Profile + mood stats */}
          <View key="profile" style={styles.page}>
            <Profile />
            <View style={styles.divider} />

          </View>

        </PagerView>

      </SafeAreaView>

      {/* ── Modals outside pager so they overlay everything ── */}
      <NewEntryForm
        visible={showForm}
        editEntry={selectedEntry}
        onClose={() => {
          setShowForm(false)
          setSelectedEntry(null)
        }}
      />
      <EntryModal
        visible={!!selectedEntry}
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onEdit={() => setShowForm(true)}
      />

      <View style={styles.divider} />

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === i && styles.tabBtnActive]}
            onPress={() => goToTab(i)}
            activeOpacity={0.75}
          >
            <Text style={styles.tabEmoji}>{tab.label}</Text>
            <Text style={[styles.tabLabel, activeTab === i && styles.tabLabelActive]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.light,
    paddingBottom: 4,
    paddingTop: 8,
    paddingHorizontal: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    borderRadius: 0,
  },
  tabBtnActive: {
    backgroundColor: 'transparent',
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.text.primary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },

  pager: { flex: 1 },
  page: { flex: 1 },

  listContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 66, 153, 0.6)',
  },
  statsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 66, 153, 0.6)',
  },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabPressed: {
    backgroundColor: colors.surface.glassHover,
    transform: [{ scale: 0.95 }],
  },
  fabIcon: {
    fontSize: 28,
    color: colors.text.primary,
    lineHeight: 32,
  },
})