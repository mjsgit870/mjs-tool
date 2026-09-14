import { useEffect, useState } from 'react'
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Collapse,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core'
import { Copy, Plus, Trash } from '@phosphor-icons/react'
import { CurrencyInput } from '#/components/CurrencyInput'
import { formatIDR } from '#/utils'
import {
  memberColor,
  memberInitials,
} from '#/features/splitbill/utils'
import type { BillItem, BillMember, MemberId } from '#/features/splitbill/types'

interface ItemManagerProps {
  members: BillMember[]
  items: BillItem[]
  onAdd: (input: { name: string; price: number; sharedBy: MemberId[] }) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
}

export function ItemManager({
  members,
  items,
  onAdd,
  onRemove,
  onDuplicate,
}: ItemManagerProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [sharedBy, setSharedBy] = useState<string[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Default ke semua anggota hanya saat pertama ada anggota.
  // Setelah itu pertahankan pilihan custom (jangan reset tiap members berubah),
  // tapi sinkronkan: tambah id baru, buang id yang sudah dihapus.
  useEffect(() => {
    const ids = members.map((m) => m.id)
    if (!initialized && ids.length > 0) {
      setSharedBy(ids)
      setInitialized(true)
      return
    }
    if (initialized) {
      setSharedBy((prev) => {
        const kept = prev.filter((id) => ids.includes(id))
        const added = ids.filter((id) => !prev.includes(id))
        // Anggota baru otomatis ikut item berikutnya (perilaku lama yang enak).
        return [...kept, ...added]
      })
    }
  }, [members, initialized])

  const allSelected =
    members.length > 0 && sharedBy.length === members.length
  const canAdd =
    members.length > 0 && name.trim() !== '' && price > 0 && sharedBy.length > 0

  function submit(): void {
    if (!canAdd) return
    onAdd({ name, price, sharedBy })
    setName('')
    setPrice(0)
    // sharedBy dipertahankan agar tambah item beruntun cepat.
  }

  function sharerLabel(item: BillItem): string {
    if (item.sharedBy.length === 0 || item.sharedBy.length === members.length) {
      return `Semua · ${members.length} orang`
    }
    const names = item.sharedBy
      .map((id) => members.find((m) => m.id === id)?.name)
      .filter(Boolean) as string[]
    if (names.length === 0) return 'Semua'
    if (names.length <= 2) return names.join(', ')
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`
  }

  function sharerAvatars(item: BillItem) {
    const list =
      item.sharedBy.length === 0
        ? members
        : members.filter((m) => item.sharedBy.includes(m.id))
    return list.slice(0, 4)
  }

  return (
    <Stack gap="sm">
      {members.length === 0 ? (
        <Paper withBorder radius="md" p="sm">
          <Text size="sm" c="dimmed">
            Tambahkan anggota dulu untuk mengisi item.
          </Text>
        </Paper>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
            <TextInput
              label="Nama item"
              placeholder="cth. Nasi goreng"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submit()
              }}
            />
            <CurrencyInput
              label="Harga (Rp)"
              placeholder="cth. 25.000"
              value={price}
              onChange={setPrice}
              onKeyDown={(event: React.KeyboardEvent) => {
                if (event.key === 'Enter') submit()
              }}
            />
          </SimpleGrid>

          <Group justify="space-between" gap="xs">
            <Group gap="xs">
              <Text size="sm" fw={500}>
                Ditanggung:
              </Text>
              <Badge
                size="sm"
                variant="light"
                color={allSelected ? 'teal' : 'indigo'}
              >
                {allSelected
                  ? `Semua (${members.length})`
                  : `${sharedBy.length} dari ${members.length}`}
              </Badge>
            </Group>
            <Anchor
              size="xs"
              component="button"
              onClick={() => setPickerOpen((v) => !v)}
            >
              {pickerOpen ? 'Tutup pilihan' : 'Ubah'}
            </Anchor>
          </Group>

          <Collapse expanded={pickerOpen || sharedBy.length === 0}>
            <Stack gap="xs">
              <Group justify="flex-end">
                {sharedBy.length !== members.length ? (
                  <Anchor
                    size="xs"
                    component="button"
                    onClick={() => setSharedBy(members.map((m) => m.id))}
                  >
                    Pilih semua
                  </Anchor>
                ) : (
                  <Anchor
                    size="xs"
                    component="button"
                    onClick={() => setSharedBy([])}
                  >
                    Bersihkan
                  </Anchor>
                )}
              </Group>
              <Checkbox.Group value={sharedBy} onChange={setSharedBy}>
                <SimpleGrid cols={{ base: 2, xs: 3 }} spacing="xs">
                  {members.map((member) => (
                    <Checkbox.Card key={member.id} value={member.id} p="xs">
                      <Group gap="xs" wrap="nowrap">
                        <Avatar
                          size="sm"
                          radius="xl"
                          color={memberColor(member.name)}
                        >
                          {memberInitials(member.name)}
                        </Avatar>
                        <Text size="sm" fw={500} truncate style={{ flex: 1 }}>
                          {member.name}
                        </Text>
                        <Checkbox.Indicator />
                      </Group>
                    </Checkbox.Card>
                  ))}
                </SimpleGrid>
              </Checkbox.Group>
              {sharedBy.length === 0 && (
                <Text size="xs" c="red">
                  Pilih minimal satu orang.
                </Text>
              )}
            </Stack>
          </Collapse>

          <Button
            onClick={submit}
            disabled={!canAdd}
            leftSection={<Plus size={16} />}
            fullWidth
          >
            Tambah item
          </Button>
        </>
      )}

      {items.length > 0 && (
        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            {items.length} item · total {formatIDR(items.reduce((a, i) => a + i.price, 0))}
          </Text>
          {items.map((item) => (
            <Paper key={item.id} withBorder radius="md" p="xs">
              <Group justify="space-between" wrap="nowrap" gap="xs">
                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={500} truncate>
                    {item.name}
                  </Text>
                  <Group gap="xs">
                    <Avatar.Group spacing="xs">
                      {sharerAvatars(item).map((m) => (
                        <Avatar
                          key={m.id}
                          size="xs"
                          radius="xl"
                          color={memberColor(m.name)}
                          title={m.name}
                        >
                          {memberInitials(m.name)}
                        </Avatar>
                      ))}
                    </Avatar.Group>
                    <Text size="xs" c="dimmed" truncate>
                      {sharerLabel(item)}
                    </Text>
                  </Group>
                </Stack>
                <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>
                  {formatIDR(item.price)}
                </Text>
                <Group gap={2} wrap="nowrap">
                  <Tooltip label="Duplikat">
                    <ActionIcon
                      variant="subtle"
                      aria-label={`Duplikat ${item.name}`}
                      onClick={() => onDuplicate(item.id)}
                    >
                      <Copy size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Hapus">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      aria-label={`Hapus ${item.name}`}
                      onClick={() => onRemove(item.id)}
                    >
                      <Trash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
