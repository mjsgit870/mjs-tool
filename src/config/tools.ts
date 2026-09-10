// Registry semua tool di homepage.
// Tambah tool baru cukup tambah entry di sini + buat route-nya.
import type { Icon } from '@phosphor-icons/react'
import { GitlabLogo, Receipt } from '@phosphor-icons/react'

export interface ToolMeta {
  slug: string
  title: string
  description: string
  href: string
  status: 'ready' | 'soon'
  icon: Icon
  color: string
}

export const tools: ToolMeta[] = [
  {
    slug: 'gitlab-activity',
    title: 'GitLab Activity untuk Timesheet',
    description:
      'Tarik aktivitas GitLab harian dan susun jadi timesheet siap copy.',
    href: '/gitlab-activity',
    status: 'ready',
    icon: GitlabLogo,
    color: 'orange',
  },
  {
    slug: 'splitbill',
    title: 'Split Bill',
    description:
      'Bagi tagihan patungan secara adil, termasuk pajak dan diskon.',
    href: '/splitbill',
    status: 'ready',
    icon: Receipt,
    color: 'teal',
  },
]
