import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { colors, fontSizes } from '../lib/theme'

export default function SignIn() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSignIn() {
    if (!email || !password) { setError('يرجى إدخال البريد وكلمة المرور'); return }
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
    // Navigation happens automatically via Stack.Protected in _layout.tsx
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.inner}>

        {/* Logo / title */}
        <Text style={s.emoji}>🐝</Text>
        <Text style={s.title}>المنحل</Text>
        <Text style={s.subtitle}>إدارة المناحل</Text>

        {/* Error */}
        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Inputs */}
        <TextInput
          style={s.input}
          placeholder="البريد الإلكتروني"
          placeholderTextColor={colors.gray[400]}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textAlign="right"
        />
        <TextInput
          style={s.input}
          placeholder="كلمة المرور"
          placeholderTextColor={colors.gray[400]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textAlign="right"
        />

        {/* Sign in button */}
        <TouchableOpacity
          style={[s.btn, loading && s.btnDisabled]}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={s.btnText}>دخول</Text>
          }
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.gray[900] },
  inner:      { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emoji:      { fontSize: 56, marginBottom: 8 },
  title:      { fontSize: fontSizes['3xl'], fontWeight: '800', color: colors.white, marginBottom: 4 },
  subtitle:   { fontSize: fontSizes.base, color: colors.gray[400], marginBottom: 36 },
  errorBox:   { width: '100%', backgroundColor: colors.red[50], borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText:  { color: colors.red[600], fontSize: fontSizes.sm, textAlign: 'center' },
  input: {
    width: '100%', backgroundColor: colors.gray[800], borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, color: colors.white,
    fontSize: fontSizes.base, marginBottom: 12, borderWidth: 1, borderColor: colors.gray[700],
  },
  btn:        { width: '100%', backgroundColor: colors.amber[500], borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnDisabled:{ opacity: 0.6 },
  btnText:    { color: colors.white, fontSize: fontSizes.lg, fontWeight: '700' },
})
