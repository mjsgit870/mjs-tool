import { createClient } from '@supabase/supabase-js'
import type { Database } from '#/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Penamaan baru Supabase: publishable key (`sb_publishable_...`).
// `VITE_SUPABASE_ANON_KEY` tetap didukung sebagai fallback lawas.
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY

/** True bila kredensial Supabase terisi — guard sebelum memanggil API. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY belum diisi. ' +
      'Salin .env.example menjadi .env lalu isi dari dashboard Supabase. ' +
      'Lihat supabase/README.md.',
  )
}

// Singleton client. Placeholder localhost dipakai agar import tidak crash
// saat env belum diisi; semua pemakaian wajib cek `isSupabaseConfigured`.
export const supabase = createClient<Database>(
  supabaseUrl ?? 'http://localhost:54321',
  supabaseKey ?? 'supabase-not-configured',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

/** Ping cepat untuk verifikasi koneksi + RLS (lihat supabase/README.md). */
export async function pingSupabase(): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase belum dikonfigurasi (.env).' }
  }
  const { error } = await supabase
    .from('bills')
    .select('id', { count: 'exact', head: true })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
