import { useContext, useEffect, useState } from 'react'
import {
  ActionIcon,
  Anchor,
  Button,
  Checkbox,
  CheckboxCardContext,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core'
import { Plus, Trash, User } from '@phosphor-icons/react'
import { CurrencyInput } from '#/components/CurrencyInput'
import { formatIDR } from '#/utils'
import type { BillItem, BillMember, MemberId } from '#/features/splitbill/types'

interface ItemManagerProps {
  members: BillMember[]
  items: BillItem[]
  onAdd: (input: { name: string; price: number; sharedBy: MemberId[] }) => void
  onRemove: (id: string) => void
}

function MemberOption({ name }: { name: string }) {
  const ctx = useContext(CheckboxCardContext)
  const checked = ctx?.checked ?? false
  return (
    <Group gap="sm" wrap="nowrap">
      <ThemeIcon
        size="lg"
        radius="md"
        variant={checked ? 'filled' : 'light'}
        color="indigo"
      >
        <User size={18} />
      </ThemeIcon>
      <Text size="sm" fw={500} truncate style={{ flex: 1 }}>
        {name}
      </Text>
      <Checkbox.Indicator />
    </Group>
  )
}

export function ItemManager({
  members,
  items,
  onAdd,
  onRemove,
}: ItemManagerProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [sharedBy, setSharedBy] = useState<string[]>([])

  // Default: tiap item ditanggung semua anggota.
  useEffect(() => {
    setSharedBy(members.map((m) => m.id))
  }, [members])

  const canAdd =
    members.length > 0 && name.trim() !== '' && price > 0 && sharedBy.length > 0

  function submit(): void {
    if (!canAdd) return
    onAdd({ name, price, sharedBy })
    setName('')
    setPrice(0)
  }

  function sharerLabel(item: BillItem): string {
    if (item.sharedBy.length === 0 || item.sharedBy.length === members.length) {
      return 'Semua'
    }
    return item.sharedBy
      .map((id) => members.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  return (
    <Stack gap="sm">
      <TextInput
        label="Nama item"
        placeholder="cth. Nasi goreng"
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
        disabled={members.length === 0}
      />
      <CurrencyInput
        label="Harga (Rp)"
        placeholder="cth. 25000"
        value={price}
        onChange={setPrice}
        disabled={members.length === 0}
      />
      {members.length > 0 && (
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Ditanggung oleh
            </Text>
            {sharedBy.length !== members.length && (
              <Anchor
                size="xs"
                component="button"
                onClick={() => setSharedBy(members.map((m) => m.id))}
              >
                Pilih semua
              </Anchor>
            )}
          </Group>
          <Checkbox.Group value={sharedBy} onChange={setSharedBy}>
            <SimpleGrid cols={{ base: 2, xs: 3 }} spacing="xs">
              {members.map((member) => (
                <Checkbox.Card key={member.id} value={member.id} p="xs">
                  <MemberOption name={member.name} />
                </Checkbox.Card>
              ))}
            </SimpleGrid>
          </Checkbox.Group>
          {sharedBy.length === 0 && (
            <Text size="xs" c="dimmed">
              Pilih minimal satu orang.
            </Text>
          )}
        </Stack>
      )}
      <Button
        onClick={submit}
        disabled={!canAdd}
        leftSection={<Plus size={16} />}
      >
        Tambah item
      </Button>

      {items.length > 0 && (
        <Stack gap="xs">
          {items.map((item) => (
            <Group key={item.id} justify="space-between" wrap="nowrap">
              <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={500} truncate>
                  {item.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {sharerLabel(item)}
                </Text>
              </Stack>
              <Text fw={500}>{formatIDR(item.price)}</Text>
              <ActionIcon
                color="red"
                variant="subtle"
                aria-label={`Hapus ${item.name}`}
                onClick={() => onRemove(item.id)}
              >
                <Trash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
