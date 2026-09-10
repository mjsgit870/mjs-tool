// Public API feature splitbill
// Route hanya boleh import dari sini, jangan deep-import ke dalam folder.
export { useSplitBill } from '#/features/splitbill/hooks'
export type { UseSplitBill } from '#/features/splitbill/hooks'
export { calculateSplit, formatSplitMessage } from '#/features/splitbill/utils'
export type {
  BillItem,
  BillMember,
  BillSettings,
  MemberId,
  MemberShare,
  SplitSummary,
} from '#/features/splitbill/types'
export {
  BillResult,
  BillSettingsForm,
  ItemManager,
  MemberManager,
  ShareBill,
} from '#/features/splitbill/components'
