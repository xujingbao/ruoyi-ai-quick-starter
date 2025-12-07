import { Stack } from 'expo-router'
import { Provider } from 'react-redux'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { store } from '../store'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="home" />
        </Stack>
      </Provider>
    </SafeAreaProvider>
  )
}
