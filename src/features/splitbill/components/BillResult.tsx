import { Divider, Group, Paper, Stack, Text } from '@mantine/core'
import { formatIDR } from '#/utils'
import { ShareBill } from '#/features/splitbill/components/ShareBill'
import type { BillSettings, SplitSummary } from '#/features/splitbill/types'

interface BillResultProps {
  summary: SplitSummary
  settings: BillSettings
}

export function BillResult({ summary, settings }: BillResultProps) {
  if (summary.subtotal <= 0) {
    return (
      <Text size="sm" c="dimmed">
        Hasil akan muncul setelah ada anggota dan item.
      </Text>
    )
  }

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="xs">
        {summary.shares.map(({ member, total }) => (
          <Group key={member.id} justify="space-between">
            <Text fw={500}>{member.name}</Text>
            <Text fw={600}>{formatIDR(total)}</Text>
          </Group>
        ))}
        <Divider />
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Subtotal
          </Text>
          <Text size="sm">{formatIDR(summary.subtotal)}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Pajak ({settings.taxPercent}%)
          </Text>
          <Text size="sm">{formatIDR(summary.taxAmount)}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Service ({settings.servicePercent}%)
          </Text>
          <Text size="sm">{formatIDR(summary.serviceAmount)}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Diskon
          </Text>
          <Text size="sm">−{formatIDR(summary.discount)}</Text>
        </Group>
        <Divider />
        <Group justify="space-between">
          <Text fw={600}>Total</Text>
          <Text fw={700} size="lg">
            {formatIDR(summary.grandTotal)}
          </Text>
        </Group>
        <Divider />
        <ShareBill summary={summary} settings={settings} />
      </Stack>
    </Paper>
  )
}
