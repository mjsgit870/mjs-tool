import {
  Accordion,
  Avatar,
  Divider,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
} from '@mantine/core'
import { Receipt } from '@phosphor-icons/react'
import { formatIDR } from '#/utils'
import { ShareBill } from '#/features/splitbill/components/ShareBill'
import {
  memberColor,
  memberInitials,
} from '#/features/splitbill/utils'
import type { BillSettings, SplitSummary } from '#/features/splitbill/types'

interface BillResultProps {
  summary: SplitSummary
  settings: BillSettings
  title: string
}

export function BillResult({ summary, settings, title }: BillResultProps) {
  if (summary.subtotal <= 0) {
    return (
      <Paper withBorder radius="md" p="md">
        <Group gap="sm" wrap="nowrap">
          <Avatar color="gray" radius="xl">
            <Receipt size={18} />
          </Avatar>
          <Text size="sm" c="dimmed">
            Hasil akan muncul otomatis setelah ada anggota dan item. Coba
            tambahkan 2 anggota + 1 item dulu.
          </Text>
        </Group>
      </Paper>
    )
  }

  const maxTotal = Math.max(...summary.shares.map((s) => s.total), 1)

  return (
    <Paper withBorder radius="md" p="md" shadow="sm">
      <Stack gap="sm">
        <Stack gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Total tagihan
          </Text>
          <Text fw={800} size="xl">
            {formatIDR(summary.grandTotal)}
          </Text>
          <Text size="xs" c="dimmed">
            Subtotal {formatIDR(summary.subtotal)}
            {summary.taxAmount > 0 &&
              ` · Pajak ${formatIDR(summary.taxAmount)}`}
            {summary.serviceAmount > 0 &&
              ` · Service ${formatIDR(summary.serviceAmount)}`}
            {summary.discount > 0 &&
              ` · Diskon −${formatIDR(summary.discount)}`}
          </Text>
        </Stack>

        <Divider />

        <Stack gap="xs">
          {summary.shares.map(({ member, subtotal, total }) => (
            <Stack key={member.id} gap={4}>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Avatar
                    size="sm"
                    radius="xl"
                    color={memberColor(member.name)}
                  >
                    {memberInitials(member.name)}
                  </Avatar>
                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {member.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      porsi {formatIDR(subtotal)}
                    </Text>
                  </Stack>
                </Group>
                <Text fw={700}>{formatIDR(total)}</Text>
              </Group>
              <Progress
                value={(total / maxTotal) * 100}
                size="xs"
                radius="xl"
                color={memberColor(member.name)}
              />
            </Stack>
          ))}
        </Stack>

        <Accordion variant="contained" radius="md">
          <Accordion.Item value="rincian">
            <Accordion.Control>
              <Text size="sm" fw={500}>
                Rincian pajak & diskon
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap={4}>
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
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <ShareBill summary={summary} settings={settings} title={title} />
      </Stack>
    </Paper>
  )
}
