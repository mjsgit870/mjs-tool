// Pure function khusus splitbill (pembagi rata, pajak, diskon, dll)
import { formatIDR } from '#/utils'
import type {
  BillItem,
  BillMember,
  BillSettings,
  SplitSummary,
} from '#/features/splitbill/types'

/**
 * Bagi tagihan ke tiap anggota.
 * - Tiap item dibagi rata ke `sharedBy`-nya (kosong = semua anggota).
 * - Pajak & service dibebankan proporsional terhadap porsi subtotal.
 * - Diskon nominal dikurangkan proporsional terhadap porsi subtotal.
 */
export function calculateSplit(
  items: BillItem[],
  members: BillMember[],
  settings: BillSettings,
): SplitSummary {
  const memberIds = new Set(members.map((m) => m.id))
  const subtotals = new Map<string, number>(members.map((m) => [m.id, 0]))

  let subtotal = 0
  for (const item of items) {
    if (item.price <= 0) continue
    const sharers = item.sharedBy.filter((id) => memberIds.has(id))
    const effective = sharers.length > 0 ? sharers : [...memberIds]
    if (effective.length === 0) continue
    const portion = item.price / effective.length
    subtotal += item.price
    for (const id of effective) {
      subtotals.set(id, (subtotals.get(id) ?? 0) + portion)
    }
  }

  const taxAmount = (subtotal * Math.max(0, settings.taxPercent)) / 100
  const serviceAmount = (subtotal * Math.max(0, settings.servicePercent)) / 100
  const discount = Math.min(Math.max(0, settings.discount), subtotal)
  const grandTotal = Math.max(
    0,
    subtotal + taxAmount + serviceAmount - discount,
  )

  const factor = subtotal > 0 ? grandTotal / subtotal : 0
  const shares = members.map((member) => {
    const memberSubtotal = subtotals.get(member.id) ?? 0
    return { member, subtotal: memberSubtotal, total: memberSubtotal * factor }
  })

  return { subtotal, taxAmount, serviceAmount, discount, grandTotal, shares }
}

/**
 * Susun ringkasan jadi teks siap salin/bagikan (ramah WhatsApp).
 */
export function formatSplitMessage(
  summary: SplitSummary,
  settings: BillSettings,
  title = 'Split Bill',
): string {
  const line = '--------------------------'
  const rows = [
    `*${title.trim() || 'Split Bill'}*`,
    line,
    ...summary.shares.map(
      ({ member, total }) => `${member.name}: ${formatIDR(total)}`,
    ),
    line,
    `Subtotal: ${formatIDR(summary.subtotal)}`,
  ]
  if (summary.taxAmount > 0) {
    rows.push(
      `Pajak (${settings.taxPercent}%): ${formatIDR(summary.taxAmount)}`,
    )
  }
  if (summary.serviceAmount > 0) {
    rows.push(
      `Service (${settings.servicePercent}%): ${formatIDR(summary.serviceAmount)}`,
    )
  }
  if (summary.discount > 0) {
    rows.push(`Diskon: -${formatIDR(summary.discount)}`)
  }
  rows.push(`*Total: ${formatIDR(summary.grandTotal)}*`)
  return rows.join('\n')
}

const billDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** Format timestamp ISO dari Supabase ke tampilan id-ID. */
export function formatBillDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return billDateFormatter.format(date)
}

/** Waktu relatif id-ID: "baru saja", "5 mnt lalu", "3 jam lalu", dst. */
export function formatRelativeTime(value: string): string {
  const date = new Date(value).getTime()
  if (Number.isNaN(date)) return value
  const diffMs = Date.now() - date
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diffMs < minute) return 'baru saja'
  if (diffMs < hour) {
    const m = Math.floor(diffMs / minute)
    return `${m} mnt lalu`
  }
  if (diffMs < day) {
    const h = Math.floor(diffMs / hour)
    return `${h} jam lalu`
  }
  if (diffMs < 7 * day) {
    const d = Math.floor(diffMs / day)
    return `${d} hari lalu`
  }
  return formatBillDate(value)
}

const AVATAR_COLORS = [
  'teal',
  'indigo',
  'orange',
  'grape',
  'blue',
  'pink',
  'cyan',
  'lime',
] as const

/** Warna avatar deterministik dari nama (stabil antar render). */
export function memberColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

/** Inisial 1-2 huruf untuk avatar. */
export function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '?').toUpperCase()
  return (
    (parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')
  ).toUpperCase()
}

/** Pecah input bulk "Budi, Sari dan Andi" jadi daftar nama bersih. */
export function parseBulkNames(raw: string): string[] {
  return raw
    .split(/[,;\n]+|\s+dan\s+/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50)
}
