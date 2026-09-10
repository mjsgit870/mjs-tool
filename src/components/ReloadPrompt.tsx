import { Affix, Button, Group, Paper, Text } from '@mantine/core'
import { useRegisterSW } from 'virtual:pwa-register/react'

// Banner PWA: tampil saat ada update SW atau saat app siap offline.
// registerType 'autoUpdate' membuat update diterapkan otomatis,
// komponen ini hanya memberi tahu user + tombol reload.
export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Cek update tiap jam saat app terbuka.
      if (registration) {
        setInterval(
          () => {
            void registration.update()
          },
          60 * 60 * 1000,
        )
      }
    },
  })

  if (!offlineReady && !needRefresh) return null

  return (
    <Affix position={{ bottom: 16, right: 16 }} zIndex={1000}>
      <Paper withBorder shadow="md" radius="md" p="sm" maw={360}>
        <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
          <Text size="sm" fw={500}>
            {needRefresh
              ? 'Versi baru tersedia.'
              : 'Aplikasi siap digunakan offline.'}
          </Text>
          <Group gap="xs" wrap="nowrap">
            {needRefresh && (
              <Button
                size="xs"
                onClick={() => void updateServiceWorker(true)}
              >
                Muat ulang
              </Button>
            )}
            <Button
              size="xs"
              variant="subtle"
              onClick={() => {
                setOfflineReady(false)
                setNeedRefresh(false)
              }}
            >
              Tutup
            </Button>
          </Group>
        </Group>
      </Paper>
    </Affix>
  )
}
