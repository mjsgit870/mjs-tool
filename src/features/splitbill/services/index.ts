import { isSupabaseConfigured, supabase } from '#/lib'
import type {
  BillDetail,
  BillDraft,
  BillItem,
  BillMember,
  MemberId,
  SavedBillSummary,
} from '#/features/splitbill/types'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function randomUuid(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }
  // Fallback untuk non-secure context (mis. dibuka via IP LAN http).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * ID klien (dari `newId()`) belum tentu UUID valid bila dibuat di
 * non-secure context, sementara kolom DB bertipe uuid. Normalisasi di sini
 * agar insert tidak pernah gagal karena format ID.
 */
function ensureUuid(id: string): string {
  return UUID_RE.test(id) ? id : randomUuid()
}

function requireSupabase(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase belum dikonfigurasi. Isi file .env dulu (lihat supabase/README.md).',
    )
  }
}

/** Daftar bill tersimpan, terbaru dulu. Sekali round-trip (counts inline). */
export async function listBills(): Promise<SavedBillSummary[]> {
  requireSupabase()
  const { data, error } = await supabase
    .from('bills')
    .select(
      'id,title,tax_percent,service_percent,discount,created_at,updated_at,bill_members(id),bill_items(id)',
    )
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    taxPercent: Number(row.tax_percent),
    servicePercent: Number(row.service_percent),
    discount: Number(row.discount),
    memberCount: row.bill_members.length,
    itemCount: row.bill_items.length,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

/** Muat satu bill lengkap (bill + members + items). Null bila tidak ada. */
export async function getBillDetail(id: string): Promise<BillDetail | null> {
  requireSupabase()
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (billError) throw new Error(billError.message)
  if (!bill) return null

  const [membersRes, itemsRes] = await Promise.all([
    supabase
      .from('bill_members')
      .select('*')
      .eq('bill_id', id)
      .order('position', { ascending: true }),
    supabase
      .from('bill_items')
      .select('*')
      .eq('bill_id', id)
      .order('position', { ascending: true }),
  ])
  if (membersRes.error) throw new Error(membersRes.error.message)
  if (itemsRes.error) throw new Error(itemsRes.error.message)

  const members: BillMember[] = membersRes.data.map((m) => ({
    id: m.id,
    name: m.name,
  }))
  const items: BillItem[] = itemsRes.data.map((i) => ({
    id: i.id,
    name: i.name,
    price: Number(i.price),
    sharedBy: i.shared_member_ids,
  }))

  return {
    id: bill.id,
    title: bill.title,
    members,
    items,
    settings: {
      taxPercent: Number(bill.tax_percent),
      servicePercent: Number(bill.service_percent),
      discount: Number(bill.discount),
    },
    createdAt: bill.created_at,
    updatedAt: bill.updated_at,
  }
}

/** Simpan bill baru. Mengembalikan ID bill. */
export async function createBill(draft: BillDraft): Promise<string> {
  requireSupabase()
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .insert({
      title: draft.title.trim() || 'Split Bill',
      tax_percent: draft.settings.taxPercent,
      service_percent: draft.settings.servicePercent,
      discount: draft.settings.discount,
    })
    .select('id')
    .single()
  if (billError) {
    throw new Error(billError.message)
  }

  await insertChildren(bill.id, draft.members, draft.items)
  return bill.id
}

/**
 * Simpan perubahan bill: update baris bill lalu ganti seluruh
 * members/items (delete + insert). Sederhana dan bebas referensi basi.
 */
export async function updateBill(id: string, draft: BillDraft): Promise<void> {
  requireSupabase()
  const { error: billError } = await supabase
    .from('bills')
    .update({
      title: draft.title.trim() || 'Split Bill',
      tax_percent: draft.settings.taxPercent,
      service_percent: draft.settings.servicePercent,
      discount: draft.settings.discount,
    })
    .eq('id', id)
  if (billError) throw new Error(billError.message)

  const [delMembers, delItems] = await Promise.all([
    supabase.from('bill_members').delete().eq('bill_id', id),
    supabase.from('bill_items').delete().eq('bill_id', id),
  ])
  if (delMembers.error) throw new Error(delMembers.error.message)
  if (delItems.error) throw new Error(delItems.error.message)

  await insertChildren(id, draft.members, draft.items)
}

/** Hapus bill (members & items ikut terhapus via ON DELETE CASCADE). */
export async function deleteBill(id: string): Promise<void> {
  requireSupabase()
  const { error } = await supabase.from('bills').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

async function insertChildren(
  billId: string,
  members: BillMember[],
  items: BillItem[],
): Promise<void> {
  // Petakan ID klien ke UUID valid, lalu tulis ulang referensi sharedBy.
  const idMap = new Map<MemberId, string>()
  for (const m of members) idMap.set(m.id, ensureUuid(m.id))

  if (members.length > 0) {
    const { error } = await supabase.from('bill_members').insert(
      members.map((m, index) => ({
        id: idMap.get(m.id) ?? randomUuid(),
        bill_id: billId,
        name: m.name,
        position: index,
      })),
    )
    if (error) throw new Error(error.message)
  }

  if (items.length > 0) {
    const { error } = await supabase.from('bill_items').insert(
      items.map((item, index) => ({
        id: ensureUuid(item.id),
        bill_id: billId,
        name: item.name,
        price: item.price,
        shared_member_ids: item.sharedBy
          .map((memberId) => idMap.get(memberId) ?? memberId)
          .filter((memberId) => UUID_RE.test(memberId)),
        position: index,
      })),
    )
    if (error) throw new Error(error.message)
  }
}
