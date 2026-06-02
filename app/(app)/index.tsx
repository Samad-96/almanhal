import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { colors, fontSizes } from '../../lib/theme'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiaryRow {
  apiary_id:    string
  name:         string
  region:       string | null
  target_flora: string | null
  hive_count:   number
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApiariesList() {
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const [apiaries, setApiaries] = useState<ApiaryRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => { fetchApiaries() }, [])

  async function fetchApiaries() {
    setLoading(true)
    const { data, error } = await supabase
      .from('apiaries')
      .select('apiary_id, name, region, target_flora, hives(count)')
      .order('name')

    if (error) { setError(error.message); setLoading(false); return }

    const rows: ApiaryRow[] = (data ?? []).map((a: any) => ({
      apiary_id:    a.apiary_id,
      name:         a.name,
      region:       a.region,
      target_flora: a.target_flora,
      hive_count:   a.hives?.[0]?.count ?? 0,
    }))
    setApiaries(rows)
    setLoading(false)
  }

  return (
    <View style={s.root}>

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerContent}>
          <View style={s.headerLeft}>
            <Pressable onPress={signOut} style={s.iconBtn}>
              <Text style={s.iconBtnText}>خروج</Text>
            </Pressable>
            {profile?.name && <Text style={s.userName}>{profile.name}</Text>}
          </View>
          <Text style={s.headerTitle}>المنحل 🐝</Text>
          <Pressable
            style={s.addBtn}
            onPress={() => router.push('/(app)/apiary/add')}
          >
            <Text style={s.addBtnText}>＋</Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {loading && (
        <View style={s.center}>
          <ActivityIndicator color={colors.amber[500]} size="large" />
        </View>
      )}

      {error && (
        <View style={s.errorBox}>
          <Text style={s.errorText}>خطأ: {error}</Text>
        </View>
      )}

      {!loading && !error && apiaries.length === 0 && (
        <View style={s.center}>
          <Text style={s.emptyEmoji}>🌿</Text>
          <Text style={s.emptyTitle}>لا توجد مناحل بعد</Text>
          <Text style={s.emptyHint}>اضغط + لإضافة أول منحل</Text>
        </View>
      )}

      <FlatList
        data={apiaries}
        keyExtractor={item => item.apiary_id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => router.push(`/(app)/apiary/${item.apiary_id}`)}
            activeOpacity={0.75}
          >
            {/* Right side: name + meta */}
            <View style={s.cardBody}>
              <Text style={s.cardName}>{item.name}</Text>
              <View style={s.cardMeta}>
                {item.region && (
                  <Text style={s.cardMetaText}>📍 {item.region}</Text>
                )}
                {item.target_flora && (
                  <Text style={s.cardMetaText}>🌸 {item.target_flora}</Text>
                )}
              </View>
            </View>

            {/* Left side: hive count badge */}
            <View style={s.hiveBadge}>
              <Text style={s.hiveBadgeNumber}>{item.hive_count}</Text>
              <Text style={s.hiveBadgeLabel}>خلية</Text>
            </View>
          </TouchableOpacity>
        )}
      />

    </View>
  )
}

const s = StyleSheet.create({
  root:             { flex: 1, backgroundColor: colors.gray[50] },

  // Header
  header:           { backgroundColor: colors.gray[900], paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  headerContent:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle:      { fontSize: fontSizes.xl, fontWeight: '800', color: colors.white },
  iconBtn:          { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
  iconBtnText:      { color: colors.gray[400], fontSize: fontSizes.xs },
  userName:         { color: colors.gray[400], fontSize: fontSizes.xs },
  addBtn:           { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.amber[500], alignItems: 'center', justifyContent: 'center' },
  addBtnText:       { color: colors.white, fontSize: 22, lineHeight: 28, fontWeight: '300' },

  // States
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyEmoji:       { fontSize: 52, marginBottom: 12 },
  emptyTitle:       { fontSize: fontSizes.base, color: colors.gray[500], marginBottom: 4 },
  emptyHint:        { fontSize: fontSizes.sm, color: colors.gray[400] },
  errorBox:         { margin: 16, backgroundColor: colors.red[50], borderRadius: 12, padding: 14 },
  errorText:        { color: colors.red[600], fontSize: fontSizes.sm, textAlign: 'center' },

  // List
  list:             { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody:         { flex: 1 },
  cardName:         { fontSize: fontSizes.base, fontWeight: '700', color: colors.gray[900], textAlign: 'right', marginBottom: 4 },
  cardMeta:         { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  cardMetaText:     { fontSize: fontSizes.xs, color: colors.gray[500] },
  hiveBadge:        { alignItems: 'center', backgroundColor: colors.amber[100], borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 12 },
  hiveBadgeNumber:  { fontSize: fontSizes.xl, fontWeight: '800', color: colors.amber[600] },
  hiveBadgeLabel:   { fontSize: fontSizes.xs, color: colors.amber[600] },
})
