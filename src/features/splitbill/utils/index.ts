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
): string {
  const line = '--------------------------'
  const rows = [
    '*Split Bill*',
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
