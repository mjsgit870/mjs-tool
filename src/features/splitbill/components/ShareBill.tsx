import { Button, CopyButton, Group } from '@mantine/core'
import { Check, Copy, ShareNetwork } from '@phosphor-icons/react'
import { formatSplitMessage } from '#/features/splitbill/utils'
import type { BillSettings, SplitSummary } from '#/features/splitbill/types'

interface ShareBillProps {
  summary: SplitSummary
  settings: BillSettings
  title: string
}

export function ShareBill({ summary, settings, title }: ShareBillProps) {
  const message = formatSplitMessage(summary, settings, title)
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`

  async function handleShare(): Promise<void> {
    try {
      await navigator.share({ title: 'Split Bill', text: message })
    } catch {
      // Pengguna membatalkan / share gagal — biarkan diam.
    }
  }

  return (
    <Group gap="xs" grow>
      <CopyButton value={message} timeout={1500}>
        {({ copied, copy }) => (
          <Button
            variant="light"
            onClick={copy}
            leftSection={copied ? <Check size={16} /> : <Copy size={16} />}
          >
            {copied ? 'Tersalin!' : 'Salin hasil'}
          </Button>
        )}
      </CopyButton>
      <Button
        variant="default"
        component="a"
        href={waUrl}
        target="_blank"
        rel="noreferrer"
      >
        WA
      </Button>
      {canShare && (
        <Button
          variant="default"
          onClick={handleShare}
          leftSection={<ShareNetwork size={16} />}
        >
          Bagikan
        </Button>
      )}
    </Group>
  )
}
