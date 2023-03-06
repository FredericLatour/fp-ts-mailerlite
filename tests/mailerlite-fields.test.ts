import '@relmify/jest-fp-ts'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import 'jest'
import { fields } from '../src'
import { cfg, logger } from './common'


// const fieldListp: fields.ICreateParams[] = [
//     {
//       name: "dob",
//       type: "date",
//     },
//     {
//       name: "date_optin",
//       type: "date",
//     },
//     {
//       name: "geocity",
//       type: "text",
//     },
//     {
//       name: "order_access_date",
//       type: "date",
//     },
//     {
//       name: "purchase_count",
//       type: "number",
//     },
//     {
//       name: "purchase_date",
//       type: "date",
//     },
//   ]

const fieldList: fields.ICreateParams[] = [
  {
    name: "fieldName 01",
    type: "date",
  },
  {
    name: "fieldName 02",
    type: "text",
  },
  {
    name: "fieldName 03",
    type: "number",
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


  test('delete fields previously created', async () => {
    const res = await pipe(
      fields.list(cfg)({filter:{keyword: 'fieldName'}} as unknown as fields.IListParams),
      TE.chainFirstIOK( xs => () => logger.info(xs)),
      TE.map( ({data}) => pipe( data, A.map( x => ({id: x.id}))) ),
      TE.chainW( fields.delFields(cfg) )
      )()
    if (E.isLeft(res)) {
      logger.info('error', res.left)
    }

    expect(res).toBeRight()
  })
  