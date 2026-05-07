import { useAppContext } from '@/context/AppContext'
import { colors, spacing } from '@/utils/theme'
import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

const CELL_SIZE = 40

export default function Cal() {

    const { entries, selectedDate, setSelectedDate } = useAppContext()

    const [calendarMonth, setCalendarMonth] = useState(() => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })


    const entryDateSet = useMemo(() => {
        const set = new Set<string>()
            ; (entries ?? []).forEach((e: any) => {
                set.add(toDateKey(new Date(e.created_at)))
            })
        return set
    }, [entries])

    function toDateKey(d: Date) {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    function isSameDay(a: Date, b: Date) {
        return a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
    }

    const calendarDays = useMemo(() => {
        const year = calendarMonth.getFullYear()
        const month = calendarMonth.getMonth()
        const firstDow = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const cells: (Date | null)[] = []
        for (let i = 0; i < firstDow; i++) cells.push(null)
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
        return cells
    }, [calendarMonth])

    const today = new Date()

    console.log('entryDateSet:', Array.from(entryDateSet))
    console.log('today key:', toDateKey(today))

    console.log('entries raw vs local:', entries.map((e: any) => {
        const d = new Date(e.created_at)
        return {
            raw: e.created_at,
            utcDate: d.toISOString().split('T')[0],
            localDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        }
    }))

    return (
        <View style={styles.calendarContainer}>
            <View style={styles.monthNav}>
                <TouchableOpacity
                    onPress={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                    style={styles.navBtn}
                >
                    <Text style={styles.navArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthLabel}>
                    {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </Text>
                <TouchableOpacity
                    onPress={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                    style={styles.navBtn}
                >
                    <Text style={styles.navArrow}>›</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.dayHeaders}>
                {DAYS.map(d => (
                    <Text key={d} style={styles.dayHeader}>{d}</Text>
                ))}
            </View>

            <View style={styles.grid}>
                {calendarDays.map((day, idx) => {
                    if (!day) return <View key={`empty-${idx}`} style={styles.cell} />
                    const isToday = isSameDay(day, today)
                    const isSelected = selectedDate && isSameDay(day, selectedDate)
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
                            {hasEntry && (
                                <View style={[styles.dot, isSelected && styles.dotSelected]} />
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>
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
        fontSize: 17,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: 0.3,
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
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 4,
    },
    cell: {
        width: `${100 / 7}%`,
        height: CELL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: CELL_SIZE / 2,
    },
    cellToday: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },
    cellSelected: { backgroundColor: colors.surface.card },
    cellText: { fontSize: 14, color: colors.text.primary, fontWeight: '500' },
    cellTextToday: { fontWeight: '700' },
    cellTextSelected: { color: colors.text.primary, fontWeight: '700' },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    dotSelected: { backgroundColor: colors.text.primary },
})