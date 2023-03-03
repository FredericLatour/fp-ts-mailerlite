import '@relmify/jest-fp-ts'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import 'jest'
import { IBatchResponse, runBatch, subscribers,fields } from '../src'
import { cfg, logger, makeSubscribers } from './common'


const fieldList: fields.ICreateParams[] = [
    {
      name: "dob",
      type: "date",
    },
    {
      name: "date_optin",
      type: "date",
    },
    {
      name: "geocity",
      type: "text",
    },
    {
      name: "order_access_date",
      type: "date",
    },
    {
      name: "purchase_count",
      type: "number",
    },
    {
      name: "purchase_date",
      type: "date",
    },
  ]

  test('Create a list of fields', async () => {
    const res = await pipe(
      fieldList,
      fields.createList(cfg))()
    expect(res).toBeRight()
  })
  
  test('list fields and ensure those created', async () => {
    const res = await pipe(
      fields.list(cfg)({} as fields.IListParams),
      TE.map( ({data}) => pipe( data, A.filter(x => !x.is_default) , A.map( x => ({name: x.name, type: x.type}))) ),
      TE.chainFirstIOK( xs => () => logger.info(xs) ),
      TE.map(A.map( x => fieldList.includes(x)) ),
      TE.map(A.reduce(true, (acc, curr) => acc && curr) )
      )()
    expect(res).toBeRight()
  })
