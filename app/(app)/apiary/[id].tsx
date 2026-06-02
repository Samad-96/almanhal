import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Pressable,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { colors, fontSizes, hiveStatusCls, hiveOriginCls } from '../../../lib/theme'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HiveRow {
  hive_id:         string
  label:           string
  status:          string
  origin:          string
  queen_installed: string | null
  last_inspection: string | null
}

interface ApiaryInfo {
  name:         string
  region:       string | null
  target_flora: string | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApiaryHives() {
  const router   = useRouter()
  const { id }   = useLocalSearchParams<{ id: string }>()

  const [apiary, setApiary] = useState<ApiaryInfo | null>(null)
  const [hives, setHives]   = useState<HiveRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => { if (id) fetchData() }, [id])

  async function fetchData() {
    setLoading(true)

    const [apiaryRes, hivesRes] = await Promise.all([
      supabase
        .from('apiaries')
        .select('name, region, target_flora')
        .eq('apiary_id', id)
        .single(),
      supabase
        .from('hives')
        .select('hive_id, label, status, origin, queen_installed, inspections(check_date)')
        .eq('apiary_id', id)
        .order('label'),
    ])

    if (apiaryRes.error) { setError(apiaryRes.error.message); setLoading(false); return }
    setApiary(apiaryRes.data)

    const rows: HiveRow[] = (hivesRes.data ?? []).map((h: any) => {
      const sortedInspections = (h.inspections ?? [])
        .map((i: any) => i.check_date)
        .sort()
        .reverse()
      return {
        hive_id:         h.hive_id,
        label:           h.label,
        status:          h.status,
        origin:          h.origin,
        queen_installed: h.queen_installed,
        last_inspection: sortedInspections[0] ?? null,
      }
    })

    setHives(rows)
    setLoading(false)
  }

  const activeHives = hives.filter(h => h.status === 'active')

  return (
    <View style={s.root}>

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backBtnText}>→</Text>
          </Pressable>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>{apiary?.name ?? '...'}</Text>
            {(apiary?.region || apiary?.target_flora) && (
              <Text style={s.headerSub}>
                {[apiary.region, apiary.target_flora].filter(Boolean).join(' · ')}
              </Text>
            )}
          </View>
          <Pressable
            style={s.addBtn}
            onPress={() => router.push(`/(app)/apiary/${id}/add-hive`)}
          >
            <Text style={s.addBtnText}>＋</Text>
          </Pressable>
        </View>
        {/* Summary strip */}
        {!loading && (
          <View style={s.strip}>
            <Text style={s.stripText}>
              <Text style={s.stripNum}>{hives.length}</Text> خلية  ·  <Text style={s.stripNum}>{activeHives.length}</Text> نشطة
            </Text>
          </View>
        )}
      </View>

      {/* Loading / error / empty */}
      {loading && <View style={s.center}><ActivityIndicator color={colors.amber[500]} size="large" /></View>}
      {error   && <View style={s.errorBox}><Text style={s.errorText}>خطأ: {error}</Text></View>}
      {!loading && !error && hives.length === 0 && (
        <View style={s.center}>
          <Text style={s.emptyEmoji}>🐝</Text>
          <Text style={s.emptyTitle}>لا توجد خلايا بعد</Text>
          <Text style={s.emptyHint}>اضغط + لإضافة أول خلية</Text>
        </View>
      )}

      <FlatList
        data={hives}
        keyExtractor={item => item.hive_id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const statusStyle = hiveStatusCls[item.status] ?? hiveStatusCls['active']
          const originStyle = hiveOriginCls[item.origin] ?? hiveOriginCls['unknown']

          const lastInspDate = item.last_inspection
            ? new Date(item.last_inspection).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
            : 'لم يفحص'

          return (
            <TouchableOpacity
              style={[s.card, item.status !== 'active' && s.cardInactive]}
              onPress={() => router.push(`/(app)/hive/${item.hive_id}`)}
              activeOpacity={0.75}
            >
              {/* Label badge */}
              <View style={s.labelBadge}>
                <Text style={s.labelText}>{item.label}</Text>
              </View>

              {/* Info */}
              <View style={s.cardBody}>
                <View style={s.badgeRow}>
                  <View style={[s.badge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[s.badgeText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: originStyle.bg }]}>
                    <Text style={[s.badgeText, { color: originStyle.text }]}>{originStyle.label}</Text>
                  </View>
                </View>
                <Text style={s.lastInspection}>آخر فحص: {lastInspDate}</Text>
              </View>

              {/* Chevron */}
              <Text style={s.chevron}>←</Text>
            </TouchableOpacity>
          )
        }}
      />

    </View>
  )
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: colors.gray[50] },

  // Header
  header:         { backgroundColor: colors.gray[900], paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16 },
  headerRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backBtn:        { padding: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
  backBtnText:    { color: colors.white, fontSize: fontSizes.lg },
  headerCenter:   { flex: 1, alignItems: 'center' },
  headerTitle:    { fontSize: fontSizes.lg, fontWeight: '700', color: colors.white },
  headerSub:      { fontSize: fontSizes.xs, color: colors.gray[400], marginTop: 2 },
  addBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.amber[500], alignItems: 'center', justifyContent: 'center' },
  addBtnText:     { color: colors.white, fontSize: 22, lineHeight: 28, fontWeight: '300' },
  strip:          { flexDirection: 'row', justifyContent: 'center' },
  stripText:      { color: colors.gray[400], fontSize: fontSizes.xs },
  stripNum:       { color: colors.white, fontWeight: '700' },

  // States
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji:     { fontSize: 52, marginBottom: 12 },
  emptyTitle:     { fontSize: fontSizes.base, color: colors.gray[500], marginBottom: 4 },
  emptyHint:      { fontSize: fontSizes.sm, color: colors.gray[400] },
  errorBox:       { margin: 16, backgroundColor: colors.red[50], borderRadius: 12, padding: 14 },
  errorText:      { color: colors.red[600], fontSize: fontSizes.sm, textAlign: 'center' },

  // List
  list:           { padding: 16, gap: 10 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardInactive:   { opacity: 0.55 },
  labelBadge:     { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.amber[100], alignItems: 'center', justifyContent: 'center' },
  labelText:      { fontSize: fontSizes.base, fontWeight: '800', color: colors.amber[600] },
  cardBody:       { flex: 1 },
  badgeRow:       { flexDirection: 'row', gap: 6, justifyContent: 'flex-end', marginBottom: 4 },
  badge:          { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText:      { fontSize: fontSizes.xs, fontWeight: '600' },
  lastInspection: { fontSize: fontSizes.xs, color: colors.gray[400], textAlign: 'right' },
  chevron:        { color: colors.gray[400], fontSize: fontSizes.base },
})
