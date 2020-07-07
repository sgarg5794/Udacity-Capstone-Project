import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'

import { UpdateNotesRequest } from '../../requests/UpdateNotesRequest'
import { updateNotes } from '../../businessLogic/notes'
import { getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('update-notes')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const notesId: string = event.pathParameters.notesId
      const updatedNotes: UpdateNotesRequest = JSON.parse(event.body)

      const jwtToken: string = getToken(event.headers.Authorization)

      await updateNotes(notesId, updatedNotes, jwtToken)

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: ''
      }
    } catch (e) {
      logger.error('Error', { error: e.message })

      return {
        statusCode: 500,
        body: e.message
      }
    }
  }
)
