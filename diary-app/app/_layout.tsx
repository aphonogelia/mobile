import { Slot } from 'expo-router'
import { AppProvider } from '@/context/AppContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'


export default function RootLayout() {

  return (
    <AppProvider>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </AppProvider>
  )
}