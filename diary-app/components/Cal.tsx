import { useAppContext } from '@/context/AppContext'
import { colors, fontFamilies, spacing } from '@/utils/theme'
import { useRef, useMemo, useState, useEffect } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PagerView from 'react-native-pager-view'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]
const CELL_SIZE = 40
const PAGER_COUNT = 3  // prev, current, next
const MID = 1          // index of the "current" page

export default function Cal() {
    const { entries, selectedDate, setSelectedDate } = useAppContext()
    const pagerRef = useRef<any>(null)
    const isAnimating = useRef(false)

    const [baseMonth, setBaseMonth] = useState(() => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })

    // The three months rendered in the pager: prev, current, next
    const months = useMemo(() => [-1, 0, 1].map(offset =>
        new Date(baseMonth.getFullYear(), baseMonth.getMonth() + offset, 1)
    ), [baseMonth])

    const entryDateSet = useMemo(() => {
        const set = new Set<string>()
            ; (entries ?? []).forEach((e: any) => set.add(toDateKey(new Date(e.created_at))))
        return set
    }, [entries])

    function toDateKey(d: Date) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }

    function isSameDay(a: Date, b: Date) {
        return a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
    }

    function calendarDays(month: Date) {
        const year = month.getFullYear()
        const m = month.getMonth()
        const firstDow = new Date(year, m, 1).getDay()
        const daysInMonth = new Date(year, m + 1, 0).getDate()
        const cells: (Date | null)[] = []
        for (let i = 0; i < firstDow; i++) cells.push(null)
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d))
        return cells
    }

    // Add this derived value alongside your other useMemo hooks:
    const currentRowCount = useMemo(() => {
        const year = baseMonth.getFullYear()
        const m = baseMonth.getMonth()
        const firstDow = new Date(year, m, 1).getDay()
        const daysInMonth = new Date(year, m + 1, 0).getDate()
        return Math.ceil((firstDow + daysInMonth) / 7)
    }, [baseMonth])

    const pagerHeight = currentRowCount * CELL_SIZE + (currentRowCount - 1) * 4

    const animatedHeight = useRef(new Animated.Value(pagerHeight)).current

    useEffect(() => {
        Animated.timing(animatedHeight, {
            toValue: pagerHeight,
            duration: 250,
            useNativeDriver: false, // height can't use native driver
        }).start()
    }, [pagerHeight])

    function onPageSelected(position: number) {
        if (isAnimating.current) return
        if (position === MID) return // stayed on current

        isAnimating.current = true
        const direction = position < MID ? -1 : 1

        // Shift the base month
        setBaseMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1))

        // Snap back to center without animation after state updates
        requestAnimationFrame(() => {
            pagerRef.current?.setPageWithoutAnimation(MID)
            setTimeout(() => { isAnimating.current = false }, 50)
        })
    }

    function goToPrev() {
        pagerRef.current?.setPage(0)
    }

    function goToNext() {
        pagerRef.current?.setPage(2)
    }

    function goToToday() {
        const now = new Date()
        setBaseMonth(new Date(now.getFullYear(), now.getMonth(), 1))
        setSelectedDate(now)
        pagerRef.current?.setPageWithoutAnimation(MID)
    }

    const today = new Date()
    const PagerViewComponent = PagerView as any

    return (
        <View style={styles.calendarContainer}>
            <View style={styles.monthNav}>
                <TouchableOpacity onPress={goToPrev} style={styles.navBtn}>
                    <Text style={styles.navArrow}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToToday} activeOpacity={0.7}>
                    <Text style={styles.monthLabel}>
                        {MONTHS[baseMonth.getMonth()]} {baseMonth.getFullYear()}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToNext} style={styles.navBtn}>
                    <Text style={styles.navArrow}>›</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.dayHeaders}>
                {DAYS.map(d => (
                    <Text key={d} style={styles.dayHeader}>{d}</Text>
                ))}
            </View>

            <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
                <PagerViewComponent
                    ref={pagerRef}
                    style={{ flex: 1 }}
                    initialPage={MID}
                    onPageSelected={(e: any) => onPageSelected(e.nativeEvent.position)}
                >
                    {months.map((month, idx) => {
                        const days = calendarDays(month)
                        return (
                            <View key={idx} style={styles.grid}>
                                {days.map((day, cellIdx) => {
                                    if (!day) return <View key={`empty-${cellIdx}`} style={styles.cell} />
                                    const isToday = isSameDay(day, today)
                                    const isSelected = !!selectedDate && isSameDay(day, selectedDate)
                                    const hasEntry = entryDateSet.has(toDateKey(day))
                                    return (
                                        <TouchableOpacity
                                            key={day.toISOString()}
                                            style={[styles.cell, isToday && styles.cellToday, isSelected && styles.cellSelected]}
                                            onPress={() => setSelectedDate(day)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[
                                                styles.cellText,
                                                isToday && styles.cellTextToday,
                                                isSelected && styles.cellTextSelected,
                                            ]}>
                                                {day.getDate()}
                                            </Text>
                                            {hasEntry && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        )
                    })}
                </PagerViewComponent>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    calendarContainer: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
    },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    navBtn: { padding: 8 },
    navArrow: {
        fontSize: 26,
        color: colors.text.primary,
        lineHeight: 28,
    },
    monthLabel: {
        fontSize: 22,
        fontFamily: fontFamilies.heading,
        color: colors.text.primary,
        letterSpacing: 0.2,
    },
    dayHeaders: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 4,
    },
    dayHeader: {
        width: CELL_SIZE,
        textAlign: 'center',
        fontSize: 12,
        fontFamily: fontFamilies.medium,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
    },

    cell: {
        width: `${100 / 7}%`,
        height: CELL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: CELL_SIZE / 2,
    },
    cellToday: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
    cellSelected: { backgroundColor: colors.surface.card },
    cellText: { fontSize: 14, color: colors.text.primary, fontFamily: fontFamilies.medium },
    cellTextToday: { fontFamily: fontFamilies.bold },
    cellTextSelected: { color: colors.text.primary, fontFamily: fontFamilies.bold },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    dotSelected: { backgroundColor: colors.text.primary },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 4,
        alignContent: 'flex-start', // important: don't stretch rows to fill height
    },
})