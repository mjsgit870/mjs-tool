// Hooks khusus splitbill (useSplitBill, dll)
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured } from '#/lib'
import { listBills } from '#/features/splitbill/services'
import type {
  BillDetail,
  BillItem,
  BillMember,
  BillSettings,
  MemberId,
  SavedBillSummary,
} from '#/features/splitbill/types'
import { calculateSplit, parseBulkNames } from '#/features/splitbill/utils'
import { newId } from '#/utils'

const initialSettings: BillSettings = {
  taxPercent: 0,
  servicePercent: 0,
  discount: 0,
}

const DRAFT_KEY = 'splitbill:draft:v1'

interface DraftState {
  title: string
  members: BillMember[]
  items: BillItem[]
  settings: BillSettings
}

function loadDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<DraftState>
    if (!Array.isArray(parsed.members) || !Array.isArray(parsed.items)) {
      return null
    }
    return {
      title: parsed.title ?? '',
      members: parsed.members,
      items: parsed.items,
      settings: parsed.settings ?? initialSettings,
    }
  } catch {
    return null
  }
}

export function useSplitBill() {
  const [title, setTitle] = useState('')
  const [members, setMembers] = useState<BillMember[]>([])
  const [items, setItems] = useState<BillItem[]>([])
  const [settings, setSettings] = useState<BillSettings>(initialSettings)
  const [draftRestored, setDraftRestored] = useState(false)

  // Pulihkan draft lokal sekali saat mount (aman dari data hilang saat refresh).
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setTitle(draft.title)
      setMembers(draft.members)
      setItems(draft.items)
      setSettings(draft.settings)
    }
    setDraftRestored(true)
  }, [])

  // Autosave draft lokal (debounce ringan via efek biasa).
  useEffect(() => {
    if (!draftRestored) return
    const draft: DraftState = { title, members, items, settings }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // storage penuh / private mode — abaikan, kalkulator tetap jalan.
    }
  }, [title, members, items, settings, draftRestored])

  function addMember(name: string): void {
    const trimmed = name.trim()
    if (!trimmed) return
    setMembers((prev) => {
      if (
        prev.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())
      ) {
        return prev
      }
      return [...prev, { id: newId(), name: trimmed }]
    })
  }

  /** Tambah banyak anggota sekaligus ("Budi, Sari dan Andi"). */
  function addMembersBulk(raw: string): number {
    const names = parseBulkNames(raw)
    if (names.length === 0) return 0
    let added = 0
    setMembers((prev) => {
      const existing = new Set(prev.map((m) => m.name.toLowerCase()))
      const next = [...prev]
      for (const name of names) {
        if (existing.has(name.toLowerCase())) continue
        existing.add(name.toLowerCase())
        next.push({ id: newId(), name })
        added += 1
      }
      return next
    })
    return names.length
  }

  function removeMember(id: MemberId): void {
    setMembers((prev) => prev.filter((m) => m.id !== id))
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        sharedBy: item.sharedBy.filter((memberId) => memberId !== id),
      })),
    )
  }

  function addItem(input: {
    name: string
    price: number
    sharedBy: MemberId[]
  }): void {
    const trimmed = input.name.trim()
    if (!trimmed || input.price <= 0) return
    setItems((prev) => [
      ...prev,
      {
        id: newId(),
        name: trimmed,
        price: input.price,
        sharedBy: input.sharedBy,
      },
    ])
  }

  function removeItem(id: string): void {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function duplicateItem(id: string): void {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id)
      if (!found) return prev
      return [
        ...prev,
        { ...found, id: newId(), name: `${found.name} (2)` },
      ]
    })
  }

  function updateSettings(patch: Partial<BillSettings>): void {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  /** Muat bill dari Supabase ke state editor. */
  function loadBill(detail: BillDetail): void {
    setTitle(detail.title)
    setMembers(detail.members)
    setItems(detail.items)
    setSettings(detail.settings)
  }

  /** Kosongkan editor untuk bill baru. */
  function resetBill(): void {
    setTitle('')
    setMembers([])
    setItems([])
    setSettings(initialSettings)
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // abaikan
    }
  }

  const summary = useMemo(
    () => calculateSplit(items, members, settings),
    [items, members, settings],
  )

  const isDirty =
    title.trim() !== '' || members.length > 0 || items.length > 0

  return {
    title,
    setTitle,
    members,
    items,
    settings,
    summary,
    isDirty,
    addMember,
    addMembersBulk,
    removeMember,
    addItem,
    removeItem,
    duplicateItem,
    updateSettings,
    loadBill,
    resetBill,
  }
}

export type UseSplitBill = ReturnType<typeof useSplitBill>

export type BillSortKey = 'newest' | 'oldest' | 'title'

/** Daftar bill tersimpan di Supabase + search/sort/pagination sisi klien. */
export function useSavedBills(pageSize = 8) {
  const [bills, setBills] = useState<SavedBillSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<BillSortKey>('newest')
  const [page, setPage] = useState(1)

  const refresh = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured) return
    setIsLoading(true)
    setError(null)
    try {
      setBills(await listBills())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat riwayat bill.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Reset ke halaman 1 tiap query/sort berubah.
  useEffect(() => {
    setPage(1)
  }, [query, sort])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? bills.filter((b) => b.title.toLowerCase().includes(q))
      : bills
    const sorted = [...base]
    if (sort === 'newest') {
      sorted.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    } else if (sort === 'oldest') {
      sorted.sort((a, b) => +new Date(a.updatedAt) - +new Date(b.updatedAt))
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'id'))
    }
    return sorted
  }, [bills, query, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  )

  return {
    bills: filtered,
    paged,
    totalCount: filtered.length,
    page: safePage,
    totalPages,
    setPage,
    query,
    setQuery,
    sort,
    setSort,
    isLoading,
    error,
    refresh,
    isConfigured: isSupabaseConfigured,
  }
}
