import { apiEndpoint, subDirectory, devapiEndpoint } from '../config'
import { Notes } from '../types/Notes'
import { CreateNotesRequest } from '../types/CreateNotesRequest'
import Axios from 'axios'
import { UpdateNotesRequest } from '../types/UpdateNotesRequest'

console.log('is offline:', process.env.IS_APP_OFFLINE)

let Endpoint: string
let JWTtoken: string

if (
  process.env.IS_APP_OFFLINE == 'false' ||
  process.env.IS_APP_OFFLINE == undefined
) {
  Endpoint = apiEndpoint
} else {
  console.log('offline')
  Endpoint = devapiEndpoint
}
console.log(Endpoint)

export async function getNotes(tokenId: string): Promise<Notes[]> {
  console.log('Fetching notes')
  if (
    process.env.IS_APP_OFFLINE == 'false' ||
    process.env.IS_APP_OFFLINE == undefined
  ) {
    JWTtoken = tokenId
  } else {
    JWTtoken = '123'
  }
  const response = await Axios.get(`${Endpoint}/${subDirectory}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JWTtoken}`
    }
  })
  console.log('Notes:', response.data)
  return response.data.items
}

export async function createNotes(
  tokenId: string,
  newNotes: CreateNotesRequest
): Promise<Notes> {
  if (
    process.env.IS_APP_OFFLINE == 'false' ||
    process.env.IS_APP_OFFLINE == undefined
  ) {
    JWTtoken = tokenId
  } else {
    JWTtoken = '123'
  }
  const response = await Axios.post(
    `${Endpoint}/${subDirectory}`,
    JSON.stringify(newNotes),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWTtoken}`
      }
    }
  )
  console.log(response.data)

  return response.data.newItem
}

export async function updateNotes(
  tokenId: string,
  notesId: string,
  updatedNotes: UpdateNotesRequest
): Promise<void> {
  if (
    process.env.IS_APP_OFFLINE == 'false' ||
    process.env.IS_APP_OFFLINE == undefined
  ) {
    JWTtoken = tokenId
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  await Axios.patch(
    `${Endpoint}/${subDirectory}/${notesId}`,
    JSON.stringify(updatedNotes),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWTtoken}`
      }
    }
  )
}

export async function deleteNotes(
  tokenId: string,
  notesId: string
): Promise<void> {
  if (
    process.env.IS_APP_OFFLINE == 'false' ||
    process.env.IS_APP_OFFLINE == undefined
  ) {
    JWTtoken = tokenId
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  await Axios.delete(`${Endpoint}/${subDirectory}/${notesId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JWTtoken}`
    }
  })
}

export async function getUploadUrl(
  tokenId: string,
  notesId: string
): Promise<string> {
  if (
    process.env.IS_APP_OFFLINE == 'false' ||
    process.env.IS_APP_OFFLINE == undefined
  ) {
    JWTtoken = tokenId
  } else {
    JWTtoken = '123'
  }
  const response = await Axios.post(
    `${Endpoint}/${subDirectory}/${notesId}/attachment`,
    '',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWTtoken}`
      }
    }
  )
  console.log(response.data)

  return response.data.uploadUrl
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  await Axios.put(uploadUrl, file)
}
export const checkAttachmentURL = async (
  attachmentUrl: string
): Promise<boolean> => {
  await Axios.get(attachmentUrl)

  return true
}
