import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display'
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { Slot } from 'expo-router'
import { AppProvider } from '@/context/AppContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useEffect } from 'react'

SplashScreen.preventAutoHideAsync().catch(() => { })


export default function RootLayout() {
  const [loaded] = useFonts({
    DMSerifDisplay_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => { })
    }
  }, [loaded])

  return (
    <AppProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Slot />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AppProvider>
  )
}