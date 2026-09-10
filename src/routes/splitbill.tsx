import { useState } from 'react'
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Container,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { FloppyDisk, Plus, Trash } from '@phosphor-icons/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { isSupabaseConfigured } from '#/lib'
import {
  BillResult,
  BillSettingsForm,
  ItemManager,
  MemberManager,
  createBill,
  deleteBill,
  formatBillDate,
  getBillDetail,
  updateBill,
  useSavedBills,
  useSplitBill,
} from '#/features/splitbill'

export const Route = createFileRoute('/splitbill')({ component: SplitBillPage })

interface Notice {
  kind: 'ok' | 'err'
  text: string
}

function SplitBillPage() {
  const {
    title,
    setTitle,
    members,
    items,
    settings,
    summary,
    addMember,
    removeMember,
    addItem,
    removeItem,
    updateSettings,
    loadBill,
    resetBill,
  } = useSplitBill()
  const { bills, isLoading, error, refresh } = useSavedBills()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  function toErrorText(e: unknown, fallback: string): string {
    return e instanceof Error ? e.message : fallback
  }

  async function handleSave(): Promise<void> {
    setSaving(true)
    setNotice(null)
    try {
      const draft = {
        title: title.trim() || 'Split Bill',
        members,
        items,
        settings,
      }
      if (activeId) {
        await updateBill(activeId, draft)
        setNotice({ kind: 'ok', text: 'Perubahan tersimpan ke cloud.' })
      } else {
        const id = await createBill(draft)
        setActiveId(id)
        if (!title.trim()) setTitle(draft.title)
        setNotice({ kind: 'ok', text: 'Bill tersimpan ke cloud.' })
      }
      await refresh()
    } catch (e) {
      setNotice({ kind: 'err', text: toErrorText(e, 'Gagal menyimpan bill.') })
    } finally {
      setSaving(false)
    }
  }

  async function handleLoad(id: string): Promise<void> {
    setBusyId(id)
    setNotice(null)
    try {
      const detail = await getBillDetail(id)
      if (!detail) {
        setNotice({ kind: 'err', text: 'Bill tidak ditemukan.' })
        await refresh()
        return
      }
      loadBill(detail)
      setActiveId(id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setNotice({ kind: 'err', text: toErrorText(e, 'Gagal memuat bill.') })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm('Hapus bill tersimpan ini?')) return
    setBusyId(id)
    setNotice(null)
    try {
      await deleteBill(id)
      if (activeId === id) {
        resetBill()
        setActiveId(null)
      }
      await refresh()
      setNotice({ kind: 'ok', text: 'Bill dihapus.' })
    } catch (e) {
      setNotice({ kind: 'err', text: toErrorText(e, 'Gagal menghapus bill.') })
    } finally {
      setBusyId(null)
    }
  }

  function handleNew(): void {
    resetBill()
    setActiveId(null)
    setNotice(null)
  }

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

        {!isSupabaseConfigured && (
          <Alert color="yellow" title="Supabase belum terhubung">
            Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` di file
            `.env` untuk menyimpan bill ke cloud (lihat
            `supabase/README.md`). Kalkulator tetap bisa dipakai offline.
          </Alert>
        )}

        <Stack gap="xs">
          <Title order={2} size="h4">
            1. Nama bill & simpan
          </Title>
          <TextInput
            placeholder="Mis. Makan malam Dufan"
            aria-label="Nama bill"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
          <Group gap="xs">
            <Button
              leftSection={<FloppyDisk size={16} />}
              loading={saving}
              disabled={!isSupabaseConfigured}
              onClick={handleSave}
            >
              {activeId ? 'Simpan perubahan' : 'Simpan ke cloud'}
            </Button>
            <Button
              variant="default"
              leftSection={<Plus size={16} />}
              onClick={handleNew}
            >
              Baru
            </Button>
          </Group>
          {notice && (
            <Alert
              color={notice.kind === 'ok' ? 'green' : 'red'}
              onClose={() => setNotice(null)}
              withCloseButton
            >
              {notice.text}
            </Alert>
          )}
        </Stack>

        <Stack gap="xs">
          <Title order={2} size="h4">
            2. Anggota
          </Title>
          <MemberManager
            members={members}
            onAdd={addMember}
            onRemove={removeMember}
          />
        </Stack>

        <Stack gap="xs">
          <Title order={2} size="h4">
            3. Item tagihan
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
            4. Pajak & diskon
          </Title>
          <BillSettingsForm settings={settings} onChange={updateSettings} />
        </Stack>

        <Stack gap="xs">
          <Title order={2} size="h4">
            5. Hasil
          </Title>
          <BillResult summary={summary} settings={settings} />
        </Stack>

        <Stack gap="xs">
          <Title order={2} size="h4">
            6. Riwayat tersimpan
          </Title>
          {isSupabaseConfigured && isLoading && (
            <Stack gap="xs">
              <Skeleton height={64} radius="md" />
              <Skeleton height={64} radius="md" />
            </Stack>
          )}
          {isSupabaseConfigured && !isLoading && error && (
            <Alert
              color="red"
              title="Gagal memuat riwayat"
            >
              <Stack gap="xs" align="flex-start">
                <Text size="sm">{error}</Text>
                <Button size="xs" variant="light" onClick={refresh}>
                  Coba lagi
                </Button>
              </Stack>
            </Alert>
          )}
          {isSupabaseConfigured && !isLoading && !error && bills.length === 0 && (
            <Text size="sm" c="dimmed">
              Belum ada bill tersimpan. Isi kalkulator di atas lalu tekan
              “Simpan ke cloud”.
            </Text>
          )}
          {isSupabaseConfigured &&
            !isLoading &&
            !error &&
            bills.map((bill) => (
              <Paper key={bill.id} withBorder radius="md" p="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Group gap="xs">
                      <Text fw={500} truncate>
                        {bill.title}
                      </Text>
                      {activeId === bill.id && (
                        <Badge size="xs" color="teal">
                          dibuka
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">
                      {bill.memberCount} anggota · {bill.itemCount} item ·{' '}
                      {formatBillDate(bill.updatedAt)}
                    </Text>
                  </Stack>
                  <Group gap="xs" wrap="nowrap">
                    <Button
                      size="xs"
                      variant="light"
                      loading={busyId === bill.id}
                      onClick={() => handleLoad(bill.id)}
                    >
                      Buka
                    </Button>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      aria-label={`Hapus ${bill.title}`}
                      loading={busyId === bill.id}
                      onClick={() => handleDelete(bill.id)}
                    >
                      <Trash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
        </Stack>
      </Stack>
    </Container>
  )
}
