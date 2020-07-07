import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'

import { generateUploadUrl } from '../../businessLogic/notes'
import { createLogger } from '../../utils/logger'

const logger = createLogger('update-notes')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const notesId = event.pathParameters.notesId
      const uploadUrl = await generateUploadUrl(notesId)

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          uploadUrl
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
