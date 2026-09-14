import { useEffect, useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core'
import { formatIDR } from '#/utils'
import {
  calculateSplit,
  formatBillDate,
  formatRelativeTime,
  memberColor,
  memberInitials,
} from '#/features/splitbill/utils'
import { getBillDetail } from '#/features/splitbill/services'
import type { BillDetail } from '#/features/splitbill/types'

interface BillDetailDrawerProps {
  billId: string | null
  activeId: string | null
  busy: boolean
  onClose: () => void
  onOpen: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function BillDetailDrawer({
  billId,
  activeId,
  busy,
  onClose,
  onOpen,
  onDuplicate,
  onDelete,
}: BillDetailDrawerProps) {
  const [detail, setDetail] = useState<BillDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!billId) {
      setDetail(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getBillDetail(billId)
      .then((d) => {
        if (cancelled) return
        if (!d) {
          setError('Bill tidak ditemukan (mungkin sudah dihapus).')
          setDetail(null)
        } else {
          setDetail(d)
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Gagal memuat detail.')
        setDetail(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [billId])

  const summary = detail
    ? calculateSplit(detail.items, detail.members, detail.settings)
    : null

  return (
    <Drawer
      opened={billId !== null}
      onClose={onClose}
      title="Detail bill"
      position="right"
      size="sm"
    >
      {loading && (
        <Stack gap="xs">
          <Skeleton height={24} radius="sm" />
          <Skeleton height={64} radius="md" />
          <Skeleton height={64} radius="md" />
        </Stack>
      )}
      {!loading && error && (
        <Stack gap="xs">
          <Text size="sm" c="red">
            {error}
          </Text>
        </Stack>
      )}
      {!loading && !error && detail && summary && (
        <Stack gap="sm">
          <Group gap="xs">
            <Text fw={600} size="lg" style={{ flex: 1 }}>
              {detail.title}
            </Text>
            {activeId === detail.id && (
              <Badge size="xs" color="teal">
                dibuka
              </Badge>
            )}
          </Group>
          <Text size="xs" c="dimmed">
            {formatRelativeTime(detail.updatedAt)} ·{' '}
            {formatBillDate(detail.updatedAt)}
          </Text>

          <Group gap="xs" grow>
            <Button
              size="xs"
              loading={busy}
              onClick={() => onOpen(detail.id)}
            >
              Buka di editor
            </Button>
            <Button
              size="xs"
              variant="default"
              onClick={() => onDuplicate(detail.id)}
            >
              Duplikat
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => onDelete(detail.id)}
            >
              Hapus
            </Button>
          </Group>

          <Divider label="Total" labelPosition="left" />
          <Text fw={800} size="xl">
            {formatIDR(summary.grandTotal)}
          </Text>
          <Text size="xs" c="dimmed">
            {detail.members.length} anggota · {detail.items.length} item ·
            subtotal {formatIDR(summary.subtotal)}
          </Text>

          <Divider label="Per orang" labelPosition="left" />
          {summary.shares.map(({ member, total }) => (
            <Group key={member.id} justify="space-between">
              <Group gap="xs" wrap="nowrap">
                <Avatar
                  size="sm"
                  radius="xl"
                  color={memberColor(member.name)}
                >
                  {memberInitials(member.name)}
                </Avatar>
                <Text size="sm">{member.name}</Text>
              </Group>
              <Text size="sm" fw={600}>
                {formatIDR(total)}
              </Text>
            </Group>
          ))}

          <Divider label="Item" labelPosition="left" />
          {detail.items.length === 0 && (
            <Text size="sm" c="dimmed">
              Tidak ada item.
            </Text>
          )}
          {detail.items.map((item) => (
            <Group key={item.id} justify="space-between" wrap="nowrap">
              <Text size="sm" truncate style={{ flex: 1 }}>
                {item.name}
              </Text>
              <Text size="sm" c="dimmed">
                {formatIDR(item.price)}
              </Text>
            </Group>
          ))}
        </Stack>
      )}
    </Drawer>
  )
}
