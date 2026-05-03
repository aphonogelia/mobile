import { View, Text, Pressable, StyleSheet, ImageBackground } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from '@/utils/supabase'
import { useState } from 'react'
import { router } from 'expo-router'


WebBrowser.maybeCompleteAuthSession()

export default function Landing() {

    const [showButtons, setShowButtons] = useState(false)
    const redirectTo = makeRedirectUri({ native: 'diaryapp://' })

    const handleLogin = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Current session:', session)
        if (session) {
            router.replace('/diary')
        } else {
            setShowButtons(true)
        }
    }

    const signInWith = async (provider: 'github' | 'google') => {

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo,
                skipBrowserRedirect: true,
                queryParams: {
                    prompt: 'select_account',
                }
            },
        })

        if (error) { console.error(error); return }

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

        if (result.type === 'success') {
            const url = new URL(result.url)
            const params = new URLSearchParams(url.hash.substring(1))
            const access_token = params.get('access_token')
            const refresh_token = params.get('refresh_token')

            console.log('access_token:', access_token)
            console.log('refresh_token:', refresh_token)

            if (access_token && refresh_token) {
                await supabase.auth.setSession({ access_token, refresh_token })
                router.replace('/diary')
            }
        }
    }


    return (
        <ImageBackground
            source={require('../../assets/images/bgBW.png')}
            style={styles.container}
            resizeMode="cover"
        >

            <View style={styles.buttonContainer}>

                {!showButtons ? (
                    <Pressable style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </Pressable>
                ) : (
                    <>

                        <View style={styles.buttonContainer}>
                            <Pressable style={styles.button} onPress={() => signInWith('github')}>
                                <FontAwesome name="github" size={18} color="#333" />
                                <Text style={styles.buttonText}>Login with GitHub</Text>
                            </Pressable>

                            <Pressable style={styles.button} onPress={() => signInWith('google')}>
                                <FontAwesome name="google" size={18} color="#333" />
                                <Text style={styles.buttonText}>Login with Google</Text>
                            </Pressable>
                        </View>
                    </>
                )}
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    button: {
        width: 200,
        height: 50,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.8)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    buttonText: {
        fontSize: 14,
        color: '#333',
    },
})