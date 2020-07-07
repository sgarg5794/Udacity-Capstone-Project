import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger'
import { NotesItem } from '../models/NotesItem'

let XAWS
if (process.env.AWS_XRAY_CONTEXT_MISSING) {
  console.log('Serverless Offline detected; skipping AWS X-Ray setup')
  XAWS = AWS
} else {
  XAWS = AWSXRay.captureAWS(AWS)
}
const logger = createLogger('notes-access')

export class NotesAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = createS3Client(),
    private readonly notesTable = process.env.DIARY_TABLE,
    private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly indexName = process.env.DIARY_TABLE_IDX
  ) {
    //
  }

  async getAllNotes(userId: string): Promise<NotesItem[]> {
    logger.info('Getting all notes items')

    const result = await this.docClient
      .query({
        TableName: this.notesTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items

    return items as NotesItem[]
  }

  async createNotes(notes: NotesItem): Promise<NotesItem> {
    logger.info(`Creating a notes with ID ${notes.notesId}`)

    const newItem = {
      ...notes,
      attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${notes.notesId}`
    }

    await this.docClient
      .put({
        TableName: this.notesTable,
        Item: newItem
      })
      .promise()

    return notes
  }

  async updateNotes(notes: NotesItem): Promise<NotesItem> {
    logger.info(`Updating a notes with ID ${notes.notesId}`)

    const updateExpression = 'set #n = :name, dueDate = :dueDate, done = :done'

    await this.docClient
      .update({
        TableName: this.notesTable,
        Key: {
          userId: notes.userId,
          notesId: notes.notesId
        },
        UpdateExpression: updateExpression,
        ConditionExpression: 'notesId = :notesId',
        ExpressionAttributeValues: {
          ':name': notes.name,
          ':dueDate': notes.dueDate,
          ':done': notes.done,
          ':notesId': notes.notesId
        },
        ExpressionAttributeNames: {
          '#n': 'name'
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()

    return notes
  }

  async deleteNotes(notesId: string, userId: string): Promise<string> {
    logger.info(`Deleting a notes with ID ${notesId}`)

    await this.docClient
      .delete({
        TableName: this.notesTable,
        Key: {
          userId,
          notesId
        },
        ConditionExpression: 'notesId = :notesId',
        ExpressionAttributeValues: {
          ':notesId': notesId
        }
      })
      .promise()

    return userId
  }

  async generateUploadUrl(notesId: string): Promise<string> {
    logger.info('Generating upload Url')

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: notesId,
      Expires: this.urlExpiration
    })
  }
}

const createDynamoDBClient = () => {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')

    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  } else {
    return new XAWS.DynamoDB.DocumentClient()
  }
}

const createS3Client = () => {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local S3 instance')

    return new AWS.S3({
      s3ForcePathStyle: true,
      // endpoint: new AWS.Endpoint('http://localhost:8200'),
      endpoint: 'http://localhost:8200',
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER'
    })
  } else {
    return new XAWS.S3({ signatureVersion: 'v4' })
  }
}
