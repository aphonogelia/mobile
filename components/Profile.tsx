import { useAppContext } from '@/context/AppContext'
import { uploadAvatar } from '@/utils/api'
import { supabase } from '@/utils/supabase'
import { colors, radius, shadows, spacing, typography, fontFamilies } from '@/utils/theme'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Stats from './Stats'

export default function Profile() {
  const { profile, updateProfile } = useAppContext()

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(profile?.userName ?? '')
  const inputRef = useRef<TextInput>(null)

  if (!profile) return null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/(auth)/landing')
  }

  const pickImage = async (aspect: [number, number]) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return null
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      quality: 0.7,
    })
    return result.canceled ? null : result.assets[0].uri
  }

  const handleChangePhoto = async () => {
    const uri = await pickImage([1, 1])
    if (!uri) return
    const publicUrl = await uploadAvatar(uri)
    await updateProfile({ avatarUrl: publicUrl })
  }

  const startEditingName = () => {
    setEditingName(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSaveName = async () => {
    if (nameInput.trim()) await updateProfile({ userName: nameInput.trim() })
    setEditingName(false)
  }

  const handleCancelName = () => {
    setNameInput(profile.userName ?? '')
    setEditingName(false)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ── */}
      <View style={styles.hero}>

        {/* Logout button — top-right corner */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
          onPress={handleLogout}
          hitSlop={8}
        >
          <Ionicons name="log-out-outline" size={25} color={colors.text.muted} />
        </Pressable>

        {/* Avatar */}
        <Pressable onPress={handleChangePhoto} hitSlop={4}>
          {({ pressed }) => (
            <View style={[styles.avatarWrapper, pressed && styles.pressed]}>
              <Image
                source={
                  profile.avatarUrl
                    ? { uri: profile.avatarUrl }
                    : require('@/assets/images/girl.png')
                }
                style={styles.avatar}
              />
              <View style={styles.editBadge}>
                <Ionicons name="camera-outline" size={13} color={colors.text.primary} />
              </View>
            </View>
          )}
        </Pressable>

        {/* Name row */}
        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              ref={inputRef}
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name"
              placeholderTextColor={colors.text.muted}
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <Pressable onPress={handleSaveName} hitSlop={8}>
              <Ionicons name="checkmark" size={18} color={colors.accent.primary} />
            </Pressable>
            <Pressable onPress={handleCancelName} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.text.muted} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {profile.userName ?? 'Nameless User'}
            </Text>
            <Pressable onPress={startEditingName} hitSlop={8}>
              <Ionicons name="pencil-outline" size={14} color={colors.text.muted} />
            </Pressable>
          </View>
        )}

        {/* Entry count */}
        <Text style={styles.entryCount}>
          {profile.entryCount} {profile.entryCount === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      {/* ── Stats ── */}
      <Stats />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: spacing.xl },

  // ── Hero ──
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    borderRadius: radius.lg,
    margin: spacing.sm,
    paddingHorizontal: spacing.md,
    // needed so the absolute logout btn is contained
    position: 'relative',
  },

  // Logout — top-right corner of the hero card
  logoutBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 25,
    height: 25,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnPressed: { opacity: 0.6 },

  avatarWrapper: { position: 'relative', marginBottom: spacing.sm },
  pressed: { opacity: 0.8 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border.medium,
    ...shadows.card,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.surface.dark,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // name display
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // name editing
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  nameInput: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent.primary,
    paddingVertical: 2,
    minWidth: 120,
    letterSpacing: 0.2,
  },

  entryCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 0,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
})