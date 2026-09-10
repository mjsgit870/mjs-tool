// Hooks khusus splitbill (useSplitBill, dll)
import { useMemo, useState } from 'react'
import type {
  BillItem,
  BillMember,
  BillSettings,
  MemberId,
} from '#/features/splitbill/types'
import { calculateSplit } from '#/features/splitbill/utils'
import { newId } from '#/utils'

export function useSplitBill() {
  const [members, setMembers] = useState<BillMember[]>([])
  const [items, setItems] = useState<BillItem[]>([])
  const [settings, setSettings] = useState<BillSettings>({
    taxPercent: 0,
    servicePercent: 0,
    discount: 0,
  })

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

  const summary = useMemo(
    () => calculateSplit(items, members, settings),
    [items, members, settings],
  )

  return {
    members,
    items,
    settings,
    summary,
    addMember,
    removeMember,
    addItem,
    removeItem,
    updateSettings,
  }
}

export type UseSplitBill = ReturnType<typeof useSplitBill>
