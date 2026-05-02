import { useState, useRef, useEffect } from 'react'
import { Entry, MOODS, MoodId } from '@/utils/types'
import { useAppContext } from '@/context/AppContext'
import {
    Alert, Keyboard, View, Text, TextInput, Pressable,
    Modal, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Image,
} from 'react-native'



type Props = {
    visible: boolean
    onClose: () => void
    editEntry?: Entry | null
}

const autoTitle = (content: string) =>
    content.trim().replace(/\n+/g, ' ').slice(0, 17) + '...'

export default function NewEntryForm({ visible, onClose, editEntry }: Props) {

    const { addEntry, updateEntry, error, clearError } = useAppContext()

    const [title, setTitle] = useState('')
    const [selectedMoods, setSelectedMoods] = useState<MoodId[]>([])
    const [content, setContent] = useState('')
    const isSaving = useRef(false)

    const canSave = content.trim().length > 0
    const mood = selectedMoods.length > 0 ? selectedMoods : undefined

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
    }, [visible])

    useEffect(() => {
        if (error) {
            Alert.alert('Error', error)
            clearError()
        }
    }, [error])

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
                            placeholderTextColor="#8BAAD4"
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
                                                    <Image source={m.icon} style={[styles.moodBtnIcon, !isSelected && styles.moodBtnIconUnselected]} />
                                                    <Text style={[styles.moodBtnLabel, isSelected && styles.moodBtnLabelSelected]}>{m.label}</Text>
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

                        <KeyboardAvoidingView style={styles.kavFab} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                            <Pressable
                                style={({ pressed }) => [styles.fab, !canSave && styles.fabDisabled, pressed && styles.fabPressed]}
                                onPress={handleSave}
                                disabled={!canSave || isSaving.current}
                            >
                                <Text style={styles.fabIcon}>↑</Text>
                            </Pressable>
                        </KeyboardAvoidingView>
                    </View>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    )
}

// styles unchanged

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F0F5FF',
    },

    handle: {
        width: 36, height: 4,
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
    },
    closeBtn: {
        width: 30, height: 30,
        borderRadius: 999,
        backgroundColor: '#DDE8F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: { fontSize: 12, color: '#3A6199', fontWeight: '700' },

    titleInput: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0A1F3D',
        letterSpacing: -0.3,
        paddingHorizontal: 18,
        paddingVertical: 8,
        flexShrink: 0,
    },

    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#C2D4EE',
        marginHorizontal: 18,
        flexShrink: 0,
    },
    kavFab: {
        position: 'absolute',
        bottom: 0,
        right: 0,
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
    moodBtnSelected: {
        backgroundColor: '#D0E2FF',
        borderColor: '#014DB4',
    },
    moodBtnIcon: { width: 14, height: 14 },
    moodBtnIconUnselected: { opacity: 0.45 },
    moodBtnLabel: { fontSize: 11, fontWeight: '600', color: '#4A6FA5' },
    moodBtnLabelSelected: { color: '#014DB4' },
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
        color: '#1A2E44',
        lineHeight: 26,
        textAlignVertical: 'top',
        minHeight: 300,   // fallback floor so it always looks full
    },
    fab: {
        position: 'absolute',
        bottom: 28,
        right: 24,
        width: 52, height: 52,
        borderRadius: 999,
        backgroundColor: '#014DB4',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#001433',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabDisabled: { backgroundColor: '#A0BDE8' },
    fabPressed: { transform: [{ scale: 0.94 }] },
    fabIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
})