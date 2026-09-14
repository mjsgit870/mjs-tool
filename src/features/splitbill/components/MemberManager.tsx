import { useState } from 'react'
import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core'
import { Plus, Trash, Users } from '@phosphor-icons/react'
import { memberColor, memberInitials } from '#/features/splitbill/utils'
import type { BillMember, MemberId } from '#/features/splitbill/types'

interface MemberManagerProps {
  members: BillMember[]
  onAdd: (name: string) => void
  onAddBulk: (raw: string) => void
  onRemove: (id: MemberId) => void
}

export function MemberManager({
  members,
  onAdd,
  onAddBulk,
  onRemove,
}: MemberManagerProps) {
  const [name, setName] = useState('')

  function submit(): void {
    const trimmed = name.trim()
    if (!trimmed) return
    // Dukung bulk: "Budi, Sari dan Andi" sekaligus.
    if (/[,;\n]| dan /i.test(trimmed)) {
      onAddBulk(trimmed)
    } else {
      onAdd(trimmed)
    }
    setName('')
  }

  return (
    <Stack gap="sm">
      <Group gap="xs" align="flex-end">
        <TextInput
          label="Nama anggota"
          placeholder="cth. Budi — bisa juga: Budi, Sari, Andi"
          description="Pisahkan dengan koma untuk tambah banyak sekaligus"
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
        <Paper withBorder radius="md" p="sm">
          <Group gap="sm" wrap="nowrap">
            <Avatar color="gray" radius="xl">
              <Users size={18} />
            </Avatar>
            <Text size="sm" c="dimmed">
              Belum ada anggota. Tambahkan dulu — tiap item nanti bisa dibagi
              rata atau dipilih siapa saja yang ikut.
            </Text>
          </Group>
        </Paper>
      ) : (
        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            {members.length} anggota
          </Text>
          {members.map((member) => (
            <Paper key={member.id} withBorder radius="md" p="xs">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Avatar
                    color={memberColor(member.name)}
                    radius="xl"
                    size="sm"
                  >
                    {memberInitials(member.name)}
                  </Avatar>
                  <Text size="sm" fw={500} truncate>
                    {member.name}
                  </Text>
                </Group>
                <Tooltip label={`Hapus ${member.name}`}>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    aria-label={`Hapus ${member.name}`}
                    onClick={() => onRemove(member.id)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
