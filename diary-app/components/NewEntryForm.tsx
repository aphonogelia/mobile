import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import {
    Alert, Keyboard, View, Text, TextInput, Pressable,
    Modal, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Image,
} from 'react-native'
import { colors, fontFamilies, radius } from '@/utils/theme'
import { Entry, MOODS, MoodId, CATEGORY_COLORS, MoodCategory } from '@/utils/types'

type Props = {
    visible: boolean
    onClose: () => void
    editEntry?: Entry | null
}

const autoTitle = (content: string) =>
    content.trim().replace(/\n+/g, ' ').slice(0, 30) + '...'

export default function NewEntryForm({ visible, onClose, editEntry }: Props) {

    const { addEntry, updateEntry, error, clearError } = useAppContext()

    const [title, setTitle] = useState('')
    const [selectedMoods, setSelectedMoods] = useState<MoodId[]>([])
    const [content, setContent] = useState('')
    const isSaving = useRef(false)

    const canSave = content.trim().length > 0
    const mood = selectedMoods

    const toggleMood = (id: MoodId) =>
        setSelectedMoods(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])

    const resetForm = () => {
        setTitle('')
        setSelectedMoods([])
        setContent('')
    }

    useEffect(() => {
        if (!visible) return
        if (editEntry) {
            setTitle(editEntry.title ?? '')
            setSelectedMoods(editEntry.mood ?? [])
            setContent(editEntry.content ?? '')
        } else {
            resetForm()
        }
    }, [visible, editEntry])

    useEffect(() => {
        if (error) {
            Alert.alert('Error', error)
            clearError()
        }
    }, [error, clearError])

    const handleSave = async () => {
        console.log('handleSave called, isSaving:', isSaving.current)

        if (!canSave || isSaving.current) return
        isSaving.current = true
        try {
            const payload = { title: title.trim() || autoTitle(content), mood, content: content.trim() }
            if (editEntry) {
                await updateEntry(editEntry.id, payload)
            } else {
                await addEntry(payload)
            }
            resetForm()
            onClose()
        } finally {
            isSaving.current = false
        }
    }

    const handleClose = () => { resetForm(); onClose() }

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
            <Pressable style={styles.container} onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView style={styles.container} behavior="padding">
                    <View style={styles.container}>
                        <View style={styles.handle} />

                        <View style={styles.topRow}>
                            <Text style={styles.dateLabel}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </Text>
                            <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={8}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </Pressable>
                        </View>

                        <TextInput
                            style={styles.titleInput}
                            placeholder="Title"
                            placeholderTextColor="#ffffff"
                            maxLength={80}
                            value={title}
                            onChangeText={setTitle}
                            underlineColorAndroid="transparent"
                        />

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.moodScrollContent}
                            style={styles.moodScroll}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.moodGrid}>
                                {[0, 1].map(row => (
                                    <View key={row} style={styles.moodRow}>
                                        {MOODS.filter((_, i) => i % 2 === row).map(m => {
                                            const isSelected = selectedMoods.includes(m.id as MoodId)
                                            return (
                                                <Pressable
                                                    key={m.id}
                                                    style={[styles.moodBtn, isSelected && styles.moodBtnSelected]}
                                                    onPress={() => toggleMood(m.id as MoodId)}
                                                >
                                                    <View style={[styles.labelPill, { backgroundColor: CATEGORY_COLORS[m.category as MoodCategory] + '22' }]}>
                                                        <Text style={[styles.moodBtnLabel, isSelected && styles.moodBtnLabelSelected, { color: CATEGORY_COLORS[m.category as MoodCategory] }]}>
                                                            {m.label}
                                                        </Text>
                                                    </View>
                                                </Pressable>
                                            )
                                        })}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        <ScrollView
                            style={styles.bodyScroll}
                            contentContainerStyle={styles.bodyScrollContent}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="interactive"
                        >
                            <TextInput
                                style={styles.bodyInput}
                                placeholder="..."
                                placeholderTextColor="#8BAAD4"
                                value={content}
                                onChangeText={setContent}
                                multiline
                                textAlignVertical="top"
                                underlineColorAndroid="transparent"
                                scrollEnabled={false}
                            />
                        </ScrollView>

                        <Pressable
                            style={({ pressed }) => [styles.fab, !canSave && styles.fabDisabled, pressed && styles.fabPressed]}
                            onPress={handleSave}
                            disabled={!canSave || isSaving.current}
                        >
                            <View style={styles.fabIconWrapper}>
                                <Text style={styles.fabIcon}>✓</Text>
                            </View>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Pressable>
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
        width: 36, height: 4,
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
    closeBtn: {
        width: 30, height: 30,
        borderRadius: 999,
        backgroundColor: colors.surface.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: { fontSize: 12, color: colors.text.primary, fontFamily: fontFamilies.bold },

    titleInput: {
        fontSize: 22,
        fontFamily: fontFamilies.heading,
        color: colors.text.primary,
        letterSpacing: -0.3,
        paddingHorizontal: 18,
        paddingVertical: 8,
        flexShrink: 0,
    },

    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.surface.cardBorder,
        marginHorizontal: 18,
        flexShrink: 0,
    },

    moodScroll: {
        flexShrink: 0,
        flexGrow: 0,
        height: 82,
        maxHeight: 82,
        overflow: 'hidden',
    },
    moodScrollContent: { paddingHorizontal: 18, paddingVertical: 10 },
    moodGrid: { flexDirection: 'column', gap: 6 },
    moodRow: { flexDirection: 'row', gap: 6 },

    moodBtn: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.surface.cardBorder,
    },
    moodBtnSelected: {
        borderColor: colors.accent.primary,
    },
    moodBtnIcon: { width: 14, height: 14 },
    moodBtnIconUnselected: { opacity: 0.45 },
    moodBtnLabel: { fontSize: 11, fontFamily: fontFamilies.medium, color: colors.text.secondary },
    moodBtnLabelSelected: { color: colors.accent.primary },
    labelPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: radius.full,
        alignSelf: 'flex-start',
    },
    bodyScroll: {
        flex: 1,
    },
    bodyScrollContent: {
        flexGrow: 1,
        paddingBottom: 80,
    },
    bodyInput: {
        paddingHorizontal: 18,
        paddingTop: 12,
        fontSize: 16,
        color: colors.text.primary,
        lineHeight: 26,
        textAlignVertical: 'top',
        minHeight: 300,
    },
    fab: {
        position: 'absolute',
        bottom: 28,
        right: 24,
        width: 52, height: 52,
        borderRadius: 999,
        backgroundColor: colors.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: colors.accent.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    fabDisabled: {
        backgroundColor: colors.accent.primary,
        opacity: 0.45,
        elevation: 0,
    },
    fabPressed: { transform: [{ scale: 0.94 }] },
    fabIconWrapper: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        // Nudge to optically center the ✓ glyph
        marginTop: Platform.OS === 'ios' ? 1 : 0,
    },
    fabIcon: {
        fontSize: 22,
        color: '#1A140B',
        fontFamily: fontFamilies.bold,
        includeFontPadding: false,
        textAlignVertical: 'center',
        lineHeight: 22,
    },
})