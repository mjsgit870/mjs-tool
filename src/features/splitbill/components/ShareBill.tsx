import { Button, CopyButton, Group } from '@mantine/core'
import { Check, Copy, ShareNetwork } from '@phosphor-icons/react'
import { formatSplitMessage } from '#/features/splitbill/utils'
import type { BillSettings, SplitSummary } from '#/features/splitbill/types'

interface ShareBillProps {
  summary: SplitSummary
  settings: BillSettings
}

export function ShareBill({ summary, settings }: ShareBillProps) {
  const message = formatSplitMessage(summary, settings)
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator

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
