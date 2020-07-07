import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'

import { CreateNotesRequest } from '../../requests/CreateNotesRequest'
import { createNotes } from '../../businessLogic/notes'
import { getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('update-notes')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const newNotes: CreateNotesRequest = JSON.parse(event.body)
      const jwtToken: string = getToken(event.headers.Authorization)
      const newItem = await createNotes(newNotes, jwtToken)

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          newItem
        })
      }
    } catch (e) {
      logger.error('Error: ' + e.message)

      return {
        statusCode: 500,
        body: e.message
      }
    }
  }
)
