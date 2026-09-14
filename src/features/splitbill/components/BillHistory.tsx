import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core'
import {
  ArrowClockwise,
  Copy,
  MagnifyingGlass,
  Trash,
} from '@phosphor-icons/react'
import {
  formatBillDate,
  formatRelativeTime,
} from '#/features/splitbill/utils'
import type { SavedBillSummary } from '#/features/splitbill/types'

/** Re-export agar route tidak deep-import tipe hook. */
export type BillSortKey = 'newest' | 'oldest' | 'title'

interface BillHistoryProps {
  bills: SavedBillSummary[]
  totalCount: number
  query: string
  onQueryChange: (v: string) => void
  sort: BillSortKey
  onSortChange: (v: BillSortKey) => void
  page: number
  totalPages: number
  onPageChange: (v: number) => void
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  activeId: string | null
  busyId: string | null
  onPreview: (id: string) => void
  onOpen: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function BillHistory({
  bills,
  totalCount,
  query,
  onQueryChange,
  sort,
  onSortChange,
  page,
  totalPages,
  onPageChange,
  isLoading,
  error,
  onRefresh,
  activeId,
  busyId,
  onPreview,
  onOpen,
  onDuplicate,
  onDelete,
}: BillHistoryProps) {
  return (
    <Stack gap="sm">
      <Group gap="xs" grow>
        <TextInput
          placeholder="Cari judul bill…"
          aria-label="Cari riwayat bill"
          value={query}
          onChange={(e) => onQueryChange(e.currentTarget.value)}
          leftSection={<MagnifyingGlass size={16} />}
        />
        <Group gap="xs" wrap="nowrap">
          <Select
            aria-label="Urutkan riwayat"
            value={sort}
            onChange={(v) => v && onSortChange(v)}
            data={[
              { value: 'newest', label: 'Terbaru' },
              { value: 'oldest', label: 'Terlama' },
              { value: 'title', label: 'Judul A–Z' },
            ]}
            w={130}
          />
          <Tooltip label="Muat ulang">
            <ActionIcon
              variant="default"
              aria-label="Muat ulang riwayat"
              onClick={onRefresh}
              loading={isLoading}
            >
              <ArrowClockwise size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {isLoading && (
        <Stack gap="xs">
          <Skeleton height={72} radius="md" />
          <Skeleton height={72} radius="md" />
          <Skeleton height={72} radius="md" />
        </Stack>
      )}

      {!isLoading && error && (
        <Paper withBorder radius="md" p="sm">
          <Stack gap="xs" align="flex-start">
            <Text size="sm" c="red">
              {error}
            </Text>
            <Button size="xs" variant="light" onClick={onRefresh}>
              Coba lagi
            </Button>
          </Stack>
        </Paper>
      )}

      {!isLoading && !error && totalCount === 0 && (
        <Paper withBorder radius="md" p="md">
          <Text size="sm" c="dimmed">
            {query.trim()
              ? `Tidak ada hasil untuk “${query.trim()}”.`
              : 'Belum ada bill tersimpan. Isi kalkulator lalu tekan “Simpan ke cloud”.'}
          </Text>
        </Paper>
      )}

      {!isLoading &&
        !error &&
        bills.map((bill) => (
          <Paper key={bill.id} withBorder radius="md" p="sm">
            <Group justify="space-between" wrap="nowrap" gap="xs">
              <Stack
                gap={2}
                style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                onClick={() => onPreview(bill.id)}
              >
                <Group gap="xs" wrap="nowrap">
                  <Text size="sm" fw={500} truncate>
                    {bill.title}
                  </Text>
                  {activeId === bill.id && (
                    <Badge size="xs" color="teal">
                      dibuka
                    </Badge>
                  )}
                </Group>
                <Tooltip label={formatBillDate(bill.updatedAt)}>
                  <Text size="xs" c="dimmed" truncate>
                    {bill.memberCount} anggota · {bill.itemCount} item ·{' '}
                    {formatRelativeTime(bill.updatedAt)}
                  </Text>
                </Tooltip>
              </Stack>
              <Group gap={4} wrap="nowrap">
                <Button
                  size="xs"
                  variant="light"
                  loading={busyId === bill.id}
                  onClick={() => onOpen(bill.id)}
                >
                  Buka
                </Button>
                <Tooltip label="Duplikat sebagai baru">
                  <ActionIcon
                    variant="subtle"
                    aria-label={`Duplikat ${bill.title}`}
                    onClick={() => onDuplicate(bill.id)}
                  >
                    <Copy size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Hapus">
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    aria-label={`Hapus ${bill.title}`}
                    onClick={() => onDelete(bill.id)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Paper>
        ))}

      {!isLoading && !error && totalPages > 1 && (
        <Group justify="center">
          <Pagination
            size="sm"
            value={page}
            total={totalPages}
            onChange={onPageChange}
          />
        </Group>
      )}

      {!isLoading && !error && totalCount > 0 && (
        <Text size="xs" c="dimmed" ta="center">
          Menampilkan {bills.length} dari {totalCount} bill
        </Text>
      )}
    </Stack>
  )
}
