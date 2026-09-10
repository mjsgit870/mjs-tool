import { useState } from 'react'
import { Button, Group, Pill, Stack, Text, TextInput } from '@mantine/core'
import { Plus } from '@phosphor-icons/react'
import type { BillMember, MemberId } from '#/features/splitbill/types'

interface MemberManagerProps {
  members: BillMember[]
  onAdd: (name: string) => void
  onRemove: (id: MemberId) => void
}

export function MemberManager({
  members,
  onAdd,
  onRemove,
}: MemberManagerProps) {
  const [name, setName] = useState('')

  function submit(): void {
    if (!name.trim()) return
    onAdd(name)
    setName('')
  }

  return (
    <Stack gap="sm">
      <Group gap="xs" align="flex-end">
        <TextInput
          label="Nama anggota"
          placeholder="cth. Budi"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit()
          }}
          style={{ flex: 1 }}
        />
        <Button
          onClick={submit}
          disabled={!name.trim()}
          leftSection={<Plus size={16} />}
        >
          Tambah
        </Button>
      </Group>
      {members.length === 0 ? (
        <Text size="sm" c="dimmed">
          Belum ada anggota. Tambahkan dulu sebelum input item.
        </Text>
      ) : (
        <Pill.Group>
          {members.map((member) => (
            <Pill
              key={member.id}
              withRemoveButton
              onRemove={() => onRemove(member.id)}
            >
              {member.name}
            </Pill>
          ))}
        </Pill.Group>
      )}
    </Stack>
  )
}
