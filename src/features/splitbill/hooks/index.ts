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
import { calculateSplit } from '#/features/splitbill/utils'
import { newId } from '#/utils'

const initialSettings: BillSettings = {
  taxPercent: 0,
  servicePercent: 0,
  discount: 0,
}

export function useSplitBill() {
  const [title, setTitle] = useState('')
  const [members, setMembers] = useState<BillMember[]>([])
  const [items, setItems] = useState<BillItem[]>([])
  const [settings, setSettings] = useState<BillSettings>(initialSettings)

  function addMember(name: string): void {
    const trimmed = name.trim()
    if (!trimmed) return
    setMembers((prev) => [...prev, { id: newId(), name: trimmed }])
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
  }

  const summary = useMemo(
    () => calculateSplit(items, members, settings),
    [items, members, settings],
  )

  return {
    title,
    setTitle,
    members,
    items,
    settings,
    summary,
    addMember,
    removeMember,
    addItem,
    removeItem,
    updateSettings,
    loadBill,
    resetBill,
  }
}

export type UseSplitBill = ReturnType<typeof useSplitBill>

/** Daftar bill tersimpan di Supabase + refresh manual. */
export function useSavedBills() {
  const [bills, setBills] = useState<SavedBillSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return {
    bills,
    isLoading,
    error,
    refresh,
    isConfigured: isSupabaseConfigured,
  }
}
