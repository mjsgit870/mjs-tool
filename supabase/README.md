# Supabase — setup database (serverless Postgres)

App memakai Supabase sebagai database Postgres serverless via
`@supabase/supabase-js`. Client ada di `src/lib/supabase.ts`,
tipe tabel di `src/types/database.ts`.

## 1. Buat project

1. Buka https://supabase.com/dashboard → New project.
2. Isi nama, password database, region (mis. Singapore), Create.

## 2. Jalankan skema awal

1. Di dashboard: SQL Editor → New query.
2. Tempel seluruh isi `supabase/migrations/0001_init.sql` → Run.
3. Verifikasi: Table Editor menampilkan `bills`, `bill_members`,
   `bill_items`, `gitlab_profiles`, `timesheet_entries`.

## 3. Ambil kredensial

- Project Settings (ikon ⚙) → Data API → Project URL → isi ke
  `VITE_SUPABASE_URL`.
- API Keys → publishable key (`sb_publishable_...`) → isi ke
  `VITE_SUPABASE_PUBLISHABLE_KEY`.

## 4. Isi `.env` lokal

```bash
cp .env.example .env
```

Lalu isi nilainya. Jangan commit `.env` (sudah di `.gitignore`).

## 5. Verifikasi koneksi

Jalankan dev server, buka console browser:

```ts
import { pingSupabase } from '#/lib'
await pingSupabase() // { ok: true } bila tabel + RLS benar
```

## Catatan

- Policy RLS bawaan skema ini terbuka untuk anon key (setup awal tanpa
  auth). Sebelum production: aktifkan Supabase Auth dan ganti policy
  `setup_full_access` dengan policy berbasis `auth.uid()`.
- Token GitLab milik user disimpan di browser (localStorage), bukan di DB.
- App ini PWA offline-first untuk shell-nya; query Supabase butuh koneksi
  internet dan gagal dengan baik saat offline (tangkap error-nya di UI).
