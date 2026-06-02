// Shared colour palette — mirrors the family-business web app
export const colors = {
  amber:  { 100: '#fef3c7', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
  gray:   { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 400: '#9ca3af', 500: '#6b7280', 700: '#374151', 800: '#1f2937', 900: '#111827' },
  green:  { 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
  blue:   { 100: '#dbeafe', 600: '#2563eb', 700: '#1d4ed8' },
  purple: { 100: '#f3e8ff', 700: '#7e22ce' },
  red:    { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626' },
  white:  '#ffffff',
  black:  '#000000',
}

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
}

// Status badge colours for hive status
export const hiveStatusCls: Record<string, { bg: string; text: string; label: string }> = {
  active:  { bg: colors.green[100],  text: colors.green[700],  label: 'نشط'   },
  dead:    { bg: colors.red[100],    text: colors.red[600],    label: 'ميت'   },
  sold:    { bg: colors.gray[100],   text: colors.gray[700],   label: 'مباع'  },
  merged:  { bg: colors.blue[100],   text: colors.blue[700],   label: 'مدمج'  },
}

// Origin badge colours
export const hiveOriginCls: Record<string, { bg: string; text: string; label: string }> = {
  swarm:   { bg: colors.amber[100],  text: colors.amber[600],  label: 'طرد'   },
  bought:  { bg: colors.blue[100],   text: colors.blue[700],   label: 'مشترى' },
  split:   { bg: colors.purple[100], text: colors.purple[700], label: 'تقسيم' },
  unknown: { bg: colors.gray[100],   text: colors.gray[500],   label: '—'     },
}
