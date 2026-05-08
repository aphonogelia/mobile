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
        source={
          profile?.backgroundUrl
            ? { uri: profile.backgroundUrl }
            : require('../../assets/images/bgBlue.webp')
        }
        style={styles.bg}
        resizeMode="cover"
      >

        <View style={styles.overlay} pointerEvents="none" />
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
                <Image
                  source={tab.icon}
                  style={[styles.tabIcon, activeTab === i && styles.tabIconActive]}
                />

              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>

        {/* Modals outside ImageBackground — render on top of everything */}
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


      </ImageBackground>
    </>
  )
}


const styles = StyleSheet.create({
  bg: { flex: 1 ,
    opacity: 0.95,
  },
  safe: { flex: 1 },
  overlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(178, 187, 211, 0.29)',
},

  pager: { flex: 1 },
  page: { flex: 1 },

  listContainer: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.20)',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.light,
    paddingBottom: 4,
    paddingTop: 8,
    paddingHorizontal: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    width: 26,
    height: 26,
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
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