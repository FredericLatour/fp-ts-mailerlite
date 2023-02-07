import { Logger } from 'tslog'
import { DateStr, MlEnv, subscribers } from '../src'
import * as dotenv from 'dotenv'
import * as NEA from 'fp-ts/NonEmptyArray'
import { pipe } from 'fp-ts/function'

export const parsedEnv = dotenv.config()

export const logger = new Logger()
export const deps: MlEnv = {
  config: {
    token: process.env['ML_TOKEN'] ?? '',
    baseUrl: 'https://connect.mailerlite.com/',
  },
}

export const cfg = {
  token: process.env['ML_TOKEN'] ?? '',
  baseUrl: 'https://connect.mailerlite.com/',
}


export type CustomFields = { dob: DateStr }

export const makeSubscriber = (id: string, groups: Array<string>): subscribers.IUpsertParams<CustomFields> => ({
  email: `user${id}@example.com`,
  status: 'active',
  fields: {
    last_name: `Example User ${id}`,
    dob: '2001-01-01 00:00:00',
    city: 'Tampa',
    country: 'USA',
  },
  groups,
  subscribed_at: '2003-01-01 00:00:00',
  ip_address: '97.73.80.67',
  opted_in_at: '2019-06-26 13:34:56',
  optin_ip: '85.94.179.68',
})

export const makeSubscribers = (start: number, end: number, groups: Array<string>) => {
  return pipe(
    NEA.range(start, end),
    NEA.map(x => makeSubscriber(x.toString().padStart(3,'0'), groups))
  )
}