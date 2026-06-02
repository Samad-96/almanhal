import { Stack } from 'expo-router'
import { colors } from '../../lib/theme'

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.gray[50] },
        animation: 'slide_from_left', // RTL-friendly: slides from left (forward)
      }}
    />
  )
}
