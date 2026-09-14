import { useState } from 'react'
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Modal,
  Paper,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import {
  Calculator,
  ClockCounterClockwise,
  FloppyDisk,
  Plus,
  Receipt,
  Percent,
  Users,
} from '@phosphor-icons/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { isSupabaseConfigured } from '#/lib'
import { formatIDR } from '#/utils'
import {
  BillDetailDrawer,
  BillHistory,
  BillResult,
  BillSettingsForm,
  ItemManager,
  MemberManager,
  createBill,
  deleteBill,
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

function SectionTitle({
  icon,
  title,
  hint,
  right,
}: {
  icon: React.ReactNode
  title: string
  hint?: string
  right?: React.ReactNode
}) {
  return (
    <Group justify="space-between" gap="xs">
      <Group gap="xs" wrap="nowrap">
        <Text c="teal" style={{ display: 'flex' }}>
          {icon}
        </Text>
        <Stack gap={0}>
          <Text fw={600} size="sm">
            {title}
          </Text>
          {hint && (
            <Text size="xs" c="dimmed">
              {hint}
            </Text>
          )}
        </Stack>
      </Group>
      {right}
    </Group>
  )
}

function SplitBillPage() {
  const {
    title,
    setTitle,
    members,
    items,
    settings,
    summary,
    isDirty,
    addMember,
    addMembersBulk,
    removeMember,
    addItem,
    removeItem,
    duplicateItem,
    updateSettings,
    loadBill,
    resetBill,
  } = useSplitBill()
  const {
    paged,
    totalCount,
    query,
    setQuery,
    sort,
    setSort,
    page,
    totalPages,
    setPage,
    isLoading,
    error,
    refresh,
  } = useSavedBills(8)

  const [tab, setTab] = useState<string | null>('kalkulator')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  function toErrorText(e: unknown, fallback: string): string {
    return e instanceof Error ? e.message : fallback
  }

  async function handleSave(): Promise<void> {
    if (members.length === 0 || items.length === 0) {
      setNotice({
        kind: 'err',
        text: 'Tambahkan minimal 1 anggota dan 1 item sebelum menyimpan.',
      })
      return
    }
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
      setPreviewId(null)
      setTab('kalkulator')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setNotice({ kind: 'err', text: toErrorText(e, 'Gagal memuat bill.') })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDuplicate(id: string): Promise<void> {
    setBusyId(id)
    try {
      const detail = await getBillDetail(id)
      if (!detail) {
        setNotice({ kind: 'err', text: 'Bill tidak ditemukan.' })
        await refresh()
        return
      }
      const newId = await createBill({
        ...detail,
        title: `${detail.title} (salinan)`,
      })
      await refresh()
      setPreviewId(null)
      setNotice({ kind: 'ok', text: 'Bill diduplikat sebagai baru.' })
      // Langsung buka hasil duplikat di editor agar bisa lanjut edit.
      await handleLoad(newId)
    } catch (e) {
      setNotice({
        kind: 'err',
        text: toErrorText(e, 'Gagal menduplikat bill.'),
      })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setBusyId(id)
    try {
      await deleteBill(id)
      if (activeId === id) {
        resetBill()
        setActiveId(null)
      }
      if (previewId === id) setPreviewId(null)
      setPendingDeleteId(null)
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

  const stepsDone = [
    members.length > 0,
    items.length > 0,
    summary.grandTotal > 0,
  ].filter(Boolean).length

  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Stack gap="xs">
          <Anchor component={Link} to="/" size="sm">
            ← Kembali
          </Anchor>
          <Group justify="space-between" align="flex-start" gap="xs">
            <Stack gap={2}>
              <Title order={1} size="h2">
                Split Bill
              </Title>
              <Text c="dimmed" size="sm">
                Bagi tagihan patungan secara adil — termasuk pajak & diskon.
              </Text>
            </Stack>
            <Group gap="xs">
              <Button
                variant="default"
                leftSection={<Plus size={16} />}
                onClick={handleNew}
              >
                Baru
              </Button>
              <Button
                leftSection={<FloppyDisk size={16} />}
                loading={saving}
                disabled={!isSupabaseConfigured}
                onClick={handleSave}
              >
                {activeId ? 'Simpan perubahan' : 'Simpan'}
              </Button>
            </Group>
          </Group>

          <Paper withBorder radius="md" p="xs">
            <Group justify="space-between" gap="xs">
              <Group gap="xs">
                <Badge
                  variant={members.length > 0 ? 'filled' : 'light'}
                  color="indigo"
                >
                  {members.length} anggota
                </Badge>
                <Badge
                  variant={items.length > 0 ? 'filled' : 'light'}
                  color="orange"
                >
                  {items.length} item
                </Badge>
                <Badge
                  variant={summary.grandTotal > 0 ? 'filled' : 'light'}
                  color="teal"
                >
                  {summary.grandTotal > 0
                    ? formatIDR(summary.grandTotal)
                    : 'Rp 0'}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                {stepsDone}/3 langkah
                {isDirty ? ' · draft tersimpan otomatis' : ''}
                {activeId ? ' · terhubung ke cloud' : ''}
              </Text>
            </Group>
          </Paper>

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

        {!isSupabaseConfigured && (
          <Alert color="yellow" title="Supabase belum terhubung">
            Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` di file
            `.env` untuk menyimpan bill ke cloud (lihat
            `supabase/README.md`). Kalkulator tetap bisa dipakai offline dan
            draft tersimpan otomatis di perangkat.
          </Alert>
        )}

        <Tabs value={tab} onChange={setTab}>
          <Tabs.List grow>
            <Tabs.Tab
              value="kalkulator"
              leftSection={<Calculator size={16} />}
            >
              Kalkulator
            </Tabs.Tab>
            <Tabs.Tab
              value="riwayat"
              leftSection={<ClockCounterClockwise size={16} />}
              rightSection={
                totalCount > 0 ? (
                  <Badge size="xs" variant="light">
                    {totalCount}
                  </Badge>
                ) : undefined
              }
            >
              Riwayat
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="kalkulator" pt="md">
            <Grid gap="md" align="flex-start">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap="md">
                  <Paper withBorder radius="lg" p="md" shadow="sm">
                    <Stack gap="sm">
                      <SectionTitle
                        icon={<Receipt size={18} />}
                        title="Nama bill"
                        hint="Bebas — dipakai juga untuk pesan share"
                      />
                      <TextInput
                        placeholder="Mis. Makan malam Dufan"
                        aria-label="Nama bill"
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                      />
                    </Stack>
                  </Paper>

                  <Paper withBorder radius="lg" p="md" shadow="sm">
                    <Stack gap="sm">
                      <SectionTitle
                        icon={<Users size={18} />}
                        title="Anggota"
                        hint="Koma = tambah banyak sekaligus"
                        right={
                          <Badge size="sm" variant="light">
                            {members.length}
                          </Badge>
                        }
                      />
                      <MemberManager
                        members={members}
                        onAdd={addMember}
                        onAddBulk={addMembersBulk}
                        onRemove={removeMember}
                      />
                    </Stack>
                  </Paper>

                  <Paper withBorder radius="lg" p="md" shadow="sm">
                    <Stack gap="sm">
                      <SectionTitle
                        icon={<Receipt size={18} />}
                        title="Item tagihan"
                        hint="Pilih siapa saja yang ikut tiap item"
                        right={
                          <Badge size="sm" variant="light">
                            {items.length}
                          </Badge>
                        }
                      />
                      <ItemManager
                        members={members}
                        items={items}
                        onAdd={addItem}
                        onRemove={removeItem}
                        onDuplicate={duplicateItem}
                      />
                    </Stack>
                  </Paper>

                  <Paper withBorder radius="lg" p="md" shadow="sm">
                    <Stack gap="sm">
                      <SectionTitle
                        icon={<Percent size={18} />}
                        title="Pajak & diskon"
                        hint="Preset cepat, bisa custom"
                      />
                      <BillSettingsForm
                        settings={settings}
                        subtotal={summary.subtotal}
                        onChange={updateSettings}
                      />
                    </Stack>
                  </Paper>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack gap="xs" style={{ position: 'sticky', top: 16 }}>
                  <Group gap="xs">
                    <Calculator size={16} />
                    <Text fw={600} size="sm">
                      Hasil — live
                    </Text>
                  </Group>
                  <BillResult
                    summary={summary}
                    settings={settings}
                    title={title.trim() || 'Split Bill'}
                  />
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="riwayat" pt="md">
            {!isSupabaseConfigured ? (
              <Paper withBorder radius="md" p="md">
                <Text size="sm" c="dimmed">
                  Hubungkan Supabase dulu untuk melihat riwayat tersimpan.
                </Text>
              </Paper>
            ) : (
              <BillHistory
                bills={paged}
                totalCount={totalCount}
                query={query}
                onQueryChange={setQuery}
                sort={sort}
                onSortChange={setSort}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={isLoading}
                error={error}
                onRefresh={refresh}
                activeId={activeId}
                busyId={busyId}
                onPreview={setPreviewId}
                onOpen={handleLoad}
                onDuplicate={handleDuplicate}
                onDelete={setPendingDeleteId}
              />
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <BillDetailDrawer
        billId={previewId}
        activeId={activeId}
        busy={busyId !== null}
        onClose={() => setPreviewId(null)}
        onOpen={handleLoad}
        onDuplicate={handleDuplicate}
        onDelete={setPendingDeleteId}
      />

      <Modal
        opened={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        title="Hapus bill?"
        centered
      >
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Bill yang dihapus tidak bisa dikembalikan. Anggota dan item di
            dalamnya ikut terhapus.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={() => setPendingDeleteId(null)}>
              Batal
            </Button>
            <Button
              color="red"
              loading={busyId !== null}
              onClick={() => pendingDeleteId && handleDelete(pendingDeleteId)}
            >
              Ya, hapus
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
