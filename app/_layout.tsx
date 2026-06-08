import { useEffect } from 'react'
import { I18nManager } from 'react-native'
import { Stack, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { Session } from '@supabase/supabase-js'

SplashScreen.preventAutoHideAsync()

// Force RTL for Arabic throughout the app
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true)
  I18nManager.forceRTL(true)
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
// SDK 52 uses useSegments + useRouter instead of Stack.Protected

function useProtectedRoute(session: Session | null, loading: boolean) {
  const segments  = useSegments()
  const router    = useRouter()

  useEffect(() => {
    if (loading) return
    const inApp = segments[0] === '(app)'
    if (!session && inApp)  router.replace('/sign-in')
    if (session  && !inApp) router.replace('/(app)')
  }, [session, loading, segments])
}

function RootNavigator() {
  const { session, loading } = useAuth()

  useProtectedRoute(session, loading)

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync()
  }, [loading])

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  )
}
