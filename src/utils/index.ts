// Pure shared utilities (formatter, dll)
// Contoh: import { formatIDR } from '#/utils'

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatIDR(value: number): string {
  if (!Number.isFinite(value)) return 'Rp 0'
  return idrFormatter.format(Math.round(value))
}

/**
 * ID unik untuk key/state sisi klien.
 * `crypto.randomUUID()` hanya ada di secure context (localhost/HTTPS),
 * jadi sediakan fallback agar tetap jalan saat dibuka via IP LAN (http).
 */
export function newId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
