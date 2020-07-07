import * as uuid from 'uuid'

import { NotesItem } from '../models/NotesItem'
import { NotesAccess } from '../dataLayer/NotesAccess'
import { CreateNotesRequest } from '../requests/CreateNotesRequest'
import { UpdateNotesRequest } from '../requests/UpdateNotesRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'

const logger = createLogger('notes')

const notesAccess = new NotesAccess()

export const getAllNotes = async (jwtToken: string): Promise<NotesItem[]> => {
  const userId = parseUserId(jwtToken)

  return await notesAccess.getAllNotes(userId)
}

export const createNotes = async (
  createNotesRequest: CreateNotesRequest,
  jwtToken: string
): Promise<NotesItem> => {
  logger.info('In createNotes() function')

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await notesAccess.createNotes({
    notesId: itemId,
    userId,
    name: createNotesRequest.name,
    dueDate: createNotesRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  })
}

export const updateNotes = async (
  notesId: string,
  updateNotesRequest: UpdateNotesRequest,
  jwtToken: string
): Promise<NotesItem> => {

  const userId = parseUserId(jwtToken)

  return await notesAccess.updateNotes({
    notesId,
    userId,
    name: updateNotesRequest.name,
    dueDate: updateNotesRequest.dueDate,
    done: updateNotesRequest.done,
    createdAt: new Date().toISOString()
  })
}

export const deleteNotes = async (
  notesId: string,
  jwtToken: string
): Promise<string> => {
  const userId = parseUserId(jwtToken)
  return await notesAccess.deleteNotes(notesId, userId)
}

export const generateUploadUrl = async (notesId: string): Promise<string> => {
  return await notesAccess.generateUploadUrl(notesId)
}
