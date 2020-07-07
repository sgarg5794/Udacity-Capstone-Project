import { decode } from 'jsonwebtoken'
import { JwtPayload } from './JwtPayload'
import { createLogger } from '../utils/logger'

const logger = createLogger('utils')

export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  if (!process.env.IS_OFFLINE) {
    return decodedJwt.sub
  } else {
    logger.info('Mode : offline')
    return 'offline'
  }
}

export const getToken = (authHeader: string): string => {
  if (!authHeader) throw new Error('authentication header required')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
