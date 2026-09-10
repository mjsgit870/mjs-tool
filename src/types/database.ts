// Tipe baris tabel Supabase. Mirror dari
// `supabase/migrations/0001_init.sql` — update manual jika skema berubah
// (atau generate otomatis via `supabase gen types` bila memakai Supabase CLI).
//
// PENTING: pakai `type`, bukan `interface`. supabase-js/postgrest-js
// mensyaratkan Row/Insert/Update assignable ke `Record<string, unknown>`,
// dan interface tidak mendapat implicit index signature (query me-return
// `never` bila dilanggar).
export type BillRow = {
  id: string
  title: string
  tax_percent: number
  service_percent: number
  discount: number
  created_at: string
  updated_at: string
}

export type BillMemberRow = {
  id: string
  bill_id: string
  name: string
  position: number
  created_at: string
}

export type BillItemRow = {
  id: string
  bill_id: string
  name: string
  price: number
  /** ID anggota yang patungan item ini. Kosong = dibagi ke semua anggota. */
  shared_member_ids: string[]
  position: number
  created_at: string
}

export type GitlabProfileRow = {
  id: string
  label: string
  instance_url: string
  project_id: string
  username: string | null
  created_at: string
  updated_at: string
}

export type TimesheetEntryRow = {
  id: string
  date: string
  summary: string
  source: string
  profile_id: string | null
  created_at: string
  updated_at: string
}

// Generic `Database` untuk `createClient<Database>()` agar query ter-typecheck.
export type Database = {
  public: {
    Tables: {
      bills: {
        Row: BillRow
        Insert: Omit<BillRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<BillRow, 'id' | 'created_at'>> & {
          updated_at?: string
        }
        Relationships: []
      }
      bill_members: {
        Row: BillMemberRow
        Insert: Omit<BillMemberRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<BillMemberRow, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'bill_members_bill_id_fkey'
            columns: ['bill_id']
            referencedRelation: 'bills'
            referencedColumns: ['id']
          },
        ]
      }
      bill_items: {
        Row: BillItemRow
        Insert: Omit<BillItemRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<BillItemRow, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'bill_items_bill_id_fkey'
            columns: ['bill_id']
            referencedRelation: 'bills'
            referencedColumns: ['id']
          },
        ]
      }
      gitlab_profiles: {
        Row: GitlabProfileRow
        Insert: Omit<GitlabProfileRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<GitlabProfileRow, 'id' | 'created_at'>> & {
          updated_at?: string
        }
        Relationships: []
      }
      timesheet_entries: {
        Row: TimesheetEntryRow
        Insert: Omit<TimesheetEntryRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<TimesheetEntryRow, 'id' | 'created_at'>> & {
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'timesheet_entries_profile_id_fkey'
            columns: ['profile_id']
            referencedRelation: 'gitlab_profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
