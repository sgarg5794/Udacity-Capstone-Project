export interface NotesItem {
  userId: string
  notesId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
