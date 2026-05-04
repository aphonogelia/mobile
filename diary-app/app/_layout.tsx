import { Slot } from 'expo-router'
import { AppProvider } from '@/context/AppContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'


export default function RootLayout() {

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