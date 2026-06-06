import Cal from '@/components/Cal'
import DiaryList from '@/components/DiaryList'
import EntryModal from '@/components/EntryModal'
import NewEntryForm from '@/components/NewEntryForm'
import Profile from '@/components/Profile'
import { useAppContext } from '@/context/AppContext'
import { colors, radius, spacing } from '@/utils/theme'
import { useRef, useState } from 'react'
import {
  Image,
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
  { key: 'calendar', icon: require('../../assets/images/calendar.png'), title: 'Calendar' },
  { key: 'list', icon: require('../../assets/images/view-list.png'), title: 'Entries' },
  { key: 'profile', icon: require('../../assets/images/profile.png'), title: 'Profile' },
]

export default function Diary() {
  const { selectedEntry, setSelectedEntry, selectedDate, profile } = useAppContext()

  const [activeTab, setActiveTab] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const pagerRef = useRef<PagerView>(null)

  const goToTab = (index: number) => {
    console.log('goToTab', index)
    pagerRef.current?.setPage(index)
    setActiveTab(index)
  }

  const filterDate = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : undefined

  const PagerViewComponent = PagerView as any

  const fab = (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      onPress={() => {
        console.log('FAB pressed')
        setShowForm(true)
      }}
    >
      <Text style={styles.fabIcon}>+</Text>
    </Pressable>
  )

  return (
    <>
      <ImageBackground
        source={require('../../assets/images/bgBlue.webp')}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.overlayBase} />
          <View style={styles.overlayTopGlow} />
        </View>
        <SafeAreaView style={styles.safe}>
          <PagerViewComponent
            ref={pagerRef}
            style={styles.pager}
            initialPage={0}
            onPageSelected={(e: any) => setActiveTab(e.nativeEvent.position)}
          >
            <View key="calendar" style={styles.page}>
              <Cal />
              <View style={styles.divider} />
              <View style={styles.listContainer}><DiaryList filterDate={filterDate} /></View>
              {fab}
            </View>
            <View key="list" style={styles.page}>
              <View style={styles.listContainer}><DiaryList /></View>
              {fab}
            </View>
            <View key="profile" style={styles.page}>
              <Profile />
            </View>
          </PagerViewComponent>

          <View style={styles.tabBar}>
            {TABS.map((tab, i) => (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabBtn}
                onPress={() => goToTab(i)}
                activeOpacity={0.75}
              >
                <View style={[styles.tabIconWrap, activeTab === i && styles.tabIconWrapActive]}>
                  <View style={[styles.tabGlow, activeTab === i && styles.tabGlowActive]} />
                  <Image
                    source={tab.icon}
                    style={[styles.tabIcon, activeTab === i && styles.tabIconActive]}
                  />
                  <View style={[styles.tabDot, activeTab === i && styles.tabDotActive]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Modals outside ImageBackground — never clipped by overlay */}
      <NewEntryForm
        visible={showForm}
        editEntry={selectedEntry}
        onClose={() => { setShowForm(false); setSelectedEntry(null) }}
      />
      <EntryModal
        visible={!!selectedEntry}
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onEdit={() => setShowForm(true)}
      />
    </>
  )
}


const styles = StyleSheet.create({
  bg: {
    flex: 1,
    opacity: 0.95,
  },
  safe: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 7, 14, 0.82)',
  },
  overlayTopGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(200, 169, 110, 0.06)',
  },


  pager: { flex: 1 },
  page: { flex: 1 },

  listContainer: {
    flex: 1,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(4, 7, 14, 0.46)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
    paddingBottom: 4,
    paddingTop: 10,
    paddingHorizontal: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  tabIconWrapActive: {
    shadowColor: colors.accent.primary,
    shadowOpacity: 0.34,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  tabGlow: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  tabGlowActive: {
    backgroundColor: 'rgba(200, 169, 110, 0.12)',
    shadowColor: colors.accent.primary,
    shadowOpacity: 0.65,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  tabIcon: {
    width: 26,
    height: 26,
    opacity: 0.42,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(200, 169, 110, 0)',
  },
  tabDotActive: {
    backgroundColor: colors.accent.primary,
    shadowColor: colors.accent.primary,
    shadowOpacity: 0.95,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  fabPressed: {
    transform: [{ scale: 0.96 }],
  },
  fabIcon: {
    fontSize: 28,
    color: '#1A140B',
    lineHeight: 32,
  },
})