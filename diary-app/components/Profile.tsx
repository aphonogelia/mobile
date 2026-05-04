import { useAppContext } from '@/context/AppContext'
import { uploadAvatar } from '@/utils/api'
import { supabase } from '@/utils/supabase'
import { colors, radius } from '@/utils/theme'
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],  // square crop
            quality: 0.5,    // compress a bit
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

                <View style={styles.pic}>
                    <Image
                        source={profile.avatarUrl
                            ? { uri: profile.avatarUrl }
                            : require('@/assets/images/girl.png')
                        }
                        style={styles.avatar}
                    />
                    <View style={styles.right}>
                        <Text style={styles.userName}>
                            {profile.userName ? profile.userName : 'Nameless User'}
                        </Text>
                        <Text style={styles.entryCount}>
                            {profile.entryCount} {profile.entryCount === 1 ? 'entry' : 'entries'}
                        </Text>
                        <Pressable
                            style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
                            onPress={handleLogout}
                            hitSlop={8}
                        >
                            <Text style={styles.logoutText}>Logout</Text>
                        </Pressable>
                        <Pressable
                            style={styles.editBtn}
                            onPress={openSheet}
                            hitSlop={8}
                        >
                            <Text>⚙️</Text>
                        </Pressable>

                    </View>

                </View>
            </View>


            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={['30%']}
                enablePanDownToClose
                onClose={() => setView('menu')}
                backdropComponent={(props) => (
                    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
                )}
                style={{ zIndex: 999 }}
            >
                <BottomSheetView style={styles.sheetContent}>
                    {view === 'menu' ? (
                        <>
                            <Pressable style={styles.sheetOption} onPress={() => setView('name')}>
                                <Text style={styles.sheetOptionText}>✏️ Change name</Text>
                            </Pressable>
                            <Pressable style={styles.sheetOption} onPress={handleChangePhoto}>
                                <Text style={styles.sheetOptionText}>🖼️ Change photo</Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <TextInput
                                style={styles.input}
                                value={nameInput}
                                onChangeText={setNameInput}
                                placeholder="Your name"
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
    userName: { fontSize: 18, fontWeight: '600', color: colors.text.primary, letterSpacing: 0.9 },
    avatar: { width: 100, height: 100, borderRadius: 20 },
    pic: { flexDirection: 'row' },
    entryCount: { fontSize: 12, color: colors.text.secondary, letterSpacing: 0.5 },
    right: { marginLeft: 12, justifyContent: 'space-around', flexDirection: 'column' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
    logoutBtn: { paddingHorizontal: 30, paddingVertical: 6, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
    logoutBtnPressed: { backgroundColor: 'rgba(255,255,255,0.25)' },
    editBtn: { paddingHorizontal: 2, paddingVertical: 2 },
    logoutText: { fontSize: 12, fontWeight: '600', color: colors.text.primary, letterSpacing: 0.5 },
    sheetContent: { padding: 16, gap: 12 },
    sheetOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.1)' },
    sheetOptionText: { fontSize: 16, color: colors.text.primary, fontWeight: '500' },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        borderRadius: radius.md,
        padding: 12,
        color: colors.text.primary,
        fontSize: 16,
    }
})