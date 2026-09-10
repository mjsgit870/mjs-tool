import { Anchor, Container, Stack, Text, Title } from '@mantine/core'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  BillResult,
  BillSettingsForm,
  ItemManager,
  MemberManager,
  useSplitBill,
} from '#/features/splitbill'

export const Route = createFileRoute('/splitbill')({ component: SplitBillPage })

function SplitBillPage() {
  const {
    members,
    items,
    settings,
    summary,
    addMember,
    removeMember,
    addItem,
    removeItem,
    updateSettings,
  } = useSplitBill()

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Stack gap="xs">
          <Anchor component={Link} to="/" size="sm">
            ← Kembali
          </Anchor>
          <Title order={1} size="h2">
            Split Bill
          </Title>
          <Text c="dimmed" size="sm">
            Tambahkan anggota dan item, lalu lihat porsi bayar tiap orang.
          </Text>
        </Stack>

        <Stack gap="xs">
          <Title order={2} size="h4">
            1. Anggota
          </Title>
          <MemberManager
            members={members}
            onAdd={addMember}
            onRemove={removeMember}
          />
        </Stack>

        <Stack gap="xs">
          <Title order={2} size="h4">
            2. Item tagihan
          </Title>
          <ItemManager
            members={members}
            items={items}
            onAdd={addItem}
            onRemove={removeItem}
          />
        </Stack>

        <Stack gap="xs">
          <Title order={2} size="h4">
            3. Pajak & diskon
          </Title>
          <BillSettingsForm settings={settings} onChange={updateSettings} />
        </Stack>

        <Stack gap="xs">
          <Title order={2} size="h4">
            4. Hasil
          </Title>
          <BillResult summary={summary} settings={settings} />
        </Stack>
      </Stack>
    </Container>
  )
}
