// Domain types khusus gitlab-activity
export interface GitlabEvent {
  id: string
  action: string
  targetTitle?: string
  createdAt: string
}

export interface TimesheetEntry {
  date: string
  summary: string
}
