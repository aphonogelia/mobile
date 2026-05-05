import { useAppContext } from '@/context/AppContext'
import { uploadAvatar } from '@/utils/api'
import { supabase } from '@/utils/supabase'
import { colors, radius, spacing, typography } from '@/utils/theme'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'


export default function Profile({ onProfileEdit }: { onProfileEdit: () => void }) {

    const { profile, updateProfile } = useAppContext()
    const bottomSheetRef = useRef<BottomSheet>(null)
    const openSheet = () => bottomSheetRef.current?.expand()
    const closeSheet = () => bottomSheetRef.current?.close()
    const [view, setView] = useState<'menu' | 'name'>('menu')
    const [nameInput, setNameInput] = useState(profile?.userName ?? '')
    if (!profile) return null

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.replace('/(auth)/landing')
    }

    const handleChangePhoto = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) return

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        })

        if (!result.canceled) {
            const uri = result.assets[0].uri
            const publicUrl = await uploadAvatar(uri)
            await updateProfile({ avatarUrl: publicUrl })
            closeSheet()
        }
    }

    return (
        <>
            <View style={styles.header}>
                {/* Left: avatar */}
                <Image
                    source={profile.avatarUrl
                        ? { uri: profile.avatarUrl }
                        : require('@/assets/images/girl.png')
                    }
                    style={styles.avatar}
                />

                {/* Center: name + entry count */}
                <View style={styles.info}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {profile.userName ?? 'Nameless User'}
                    </Text>
                    <Text style={styles.entryCount}>
                        {profile.entryCount} {profile.entryCount === 1 ? 'entry' : 'entries'}
                    </Text>
                </View>

                {/* Right: actions */}
                <View style={styles.actions}>
                    <Pressable
                        style={styles.iconBtn}
                        onPress={() => router.replace('/calendar')}
                        hitSlop={8}
                    >
                        <Text style={styles.iconBtnText}>📅</Text>
                    </Pressable>
                    <Pressable
                        style={styles.iconBtn}
                        onPress={openSheet}
                        hitSlop={8}
                    >
                        <Text style={styles.iconBtnText}>⚙️</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
                        onPress={handleLogout}
                        hitSlop={8}
                    >
                        <Text style={styles.logoutText}>Out</Text>
                    </Pressable>
                </View>
            </View>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={['25%']}
                enablePanDownToClose
                onClose={() => setView('menu')}
                backdropComponent={(props) => (
                    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
                )}
                style={{ zIndex: 999 }}
                containerStyle={{ zIndex: 999, elevation: 999 }}
                backgroundStyle={{ backgroundColor: colors.brand.deep, borderColor: colors.border.light, borderWidth: 1 }}
                handleIndicatorStyle={{ backgroundColor: colors.text.muted }}
            >
                <BottomSheetView style={styles.sheetContent}>
                    {view === 'menu' ? (
                        <>
                            <Pressable style={styles.sheetOption} onPress={() => setView('name')}>
                                <Text style={styles.sheetOptionText}>✏️ Name</Text>
                            </Pressable>
                            <Pressable style={styles.sheetOption} onPress={handleChangePhoto}>
                                <Text style={styles.sheetOptionText}>🖼️ Photo</Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <TextInput
                                style={styles.input}
                                value={nameInput}
                                onChangeText={setNameInput}
                                placeholder="Your name"
                                placeholderTextColor={colors.text.muted}
                                autoFocus
                            />
                            <Pressable style={styles.sheetOption} onPress={async () => {
                                await updateProfile({ userName: nameInput })
                                closeSheet()
                            }}>
                                <Text style={styles.sheetOptionText}>Save</Text>
                            </Pressable>
                        </>
                    )}
                </BottomSheetView>
            </BottomSheet>
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: radius.full,
        borderWidth: 2,
        borderColor: colors.border.medium,
    },
    info: {
        flex: 1,
    },
    userName: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        letterSpacing: 0.3,
    },
    entryCount: {
        fontSize: typography.sizes.xs,
        color: colors.text.muted,
        marginTop: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    iconBtn: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.surface.glass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    iconBtnText: {
        fontSize: 14,
    },
    logoutBtn: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: radius.full,
        backgroundColor: colors.surface.glass,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    logoutBtnPressed: {
        backgroundColor: colors.surface.glassHover,
    },
    logoutText: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        letterSpacing: 0.5,
    },
    sheetContent: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
    },
    sheetOption: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.surface.card,
        borderWidth: 1,
        borderColor: colors.border.light,
        alignItems: 'center',
    },
    sheetOptionText: {
        fontSize: typography.sizes.md,
        color: colors.text.primary,
        fontWeight: typography.weights.medium,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border.medium,
        borderRadius: radius.md,
        padding: spacing.md,
        color: colors.text.primary,
        fontSize: typography.sizes.md,
        backgroundColor: colors.surface.glass,
    },
})