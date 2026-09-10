// Domain types khusus splitbill
export type MemberId = string

export interface BillMember {
  id: MemberId
  name: string
}

export interface BillItem {
  id: string
  name: string
  price: number
  /** ID anggota yang patungan item ini. Kosong = dibagi ke semua anggota. */
  sharedBy: MemberId[]
}

export interface BillSettings {
  taxPercent: number
  servicePercent: number
  /** Diskon nominal (Rp), dibagi proporsional ke tiap anggota. */
  discount: number
}

export interface MemberShare {
  member: BillMember
  /** Porsi subtotal sebelum pajak/service/diskon. */
  subtotal: number
  /** Total bayar setelah pajak/service/diskon. */
  total: number
}

export interface SplitSummary {
  subtotal: number
  taxAmount: number
  serviceAmount: number
  discount: number
  grandTotal: number
  shares: MemberShare[]
}

/** State bill yang siap disimpan ke Supabase. */
export interface BillDraft {
  title: string
  members: BillMember[]
  items: BillItem[]
  settings: BillSettings
}

/** Satu bill penuh yang dimuat dari Supabase. */
export interface BillDetail extends BillDraft {
  id: string
  createdAt: string
  updatedAt: string
}

/** Ringkasan bill untuk daftar riwayat (tanpa members/items). */
export interface SavedBillSummary {
  id: string
  title: string
  taxPercent: number
  servicePercent: number
  discount: number
  memberCount: number
  itemCount: number
  createdAt: string
  updatedAt: string
}
