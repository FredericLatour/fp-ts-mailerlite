/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import '@relmify/jest-fp-ts'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import 'jest'
import { groups, subscribers } from '../src'
import { cfg, CustomFields, logger, makeSubscribers } from './common'

let subsList: ReturnType<typeof makeSubscribers>
let grp: groups.IGroupData

// const init = (env: MlEnv) => ({
//   runner: <A>(e: Effect<A>): TE.TaskEither<Error, A> => e(env)
// })

// const fn = (cfg: MlConfig) => ({
//   runner: <A>(e: (x: MlConfig) => TE.TaskEither<Error, A>): TE.TaskEither<Error, A> => e(cfg)
// })

// const initialize = (env: MlEnv) => ({
//   runner: <A>(e: Effect<A>): Promise<E.Either<Error, A>> => e(env)()
// })

beforeAll(async () => {
  const groupName = 'fltest_' + new Date().toISOString()

  await pipe(
    { name: groupName },
    groups.create(cfg),
    TE.fold(
      (e) => () => {
        throw e
      },
      (res) =>
        T.fromIO(() => {
          grp = res.data
        })
    )
  )()
  subsList = makeSubscribers(1, 2, [grp.id])
})

afterAll(async () => {
  await pipe(
    { id: grp.id },
    groups.del(cfg),
    TE.fold(
      (e) => () => {
        throw e
      },
      (res) => T.fromIO(() => logger.info(res))
    )
  )()
})

// test('create group, add subscriber...', async () => {
//   const groupName = 'fltest_'+ (new Date()).toISOString()
//   const resCreate = await pipe(
//     TE.Do,
//     // Create a temporary group
//     TE.bind( 'grp', () => groups.create({ name: groupName })(deps)),
//     TE.chainFirstIOK(
//       ({grp}) => () => expect(grp.data).toEqual(expect.objectContaining({ name: groupName }))
//     ),

//     // Add subscribers to the newly created group
//     TE.bind( 'subs', ({grp}) => subscribers.Upsert({...subsList[0], groups:[grp.data.id]}) (deps)),
//     TE.chainFirstIOK(({subs}) => () => {
//       console.log(subs)
//       expect(subs.data).toEqual(
//         expect.objectContaining({ email: subsList[0].email })
//       )
//     }),
//     TE.foldW(
//       (e) => async () => {throw e},
//       (res) => async () => ({ kind: 'done', data: { res } })
//     )
//   )()
//   logger.info('resCreate', resCreate)
// })

test('Upsert 00', async () => {
  const sub = subsList[0]
  const res = await pipe(sub, subscribers.upsert<CustomFields>(cfg))()
  expect(res).toSubsetEqualRight({ data: { email: sub.email } })
})

test('Upsert 01', async () => {
  const sub = subsList[1]!
  const res = await pipe(sub, subscribers.upsert<CustomFields>(cfg))()
  expect(res).toSubsetEqualRight({ data: { email: sub.email } })
})

test('List subscribers', async () => {
  const params: subscribers.IListParams = { filter: { group: grp.id } }
  const res = await pipe(params, subscribers.list<CustomFields>(cfg))()
  expect(res).toBeRight()
})

test('Delete', async () => {
  const delOneUser = (email: string) =>
    pipe(
      { id: email },
      subscribers.fetch(cfg),
      TE.chain((subs) => subscribers.del(cfg)({ id: subs.data.id }))
    )
  const res = await pipe(
    [delOneUser(subsList[0].email), delOneUser(subsList[1]!.email)],
    A.sequence(TE.ApplicativeSeq)
  )()
  expect(res).toBeRight()
})

test('UpsertList', async () => {
  const subscriberList = makeSubscribers(100, 310, [grp.id])

  const res = await pipe(subscriberList, subscribers.upsertList<CustomFields>(cfg))()
  const disp = E.isRight(res)
    ? pipe(
        res.right,
        A.map(({ failed, successful, total }) => ({ failed, successful, total }))
      )
    : res.left

  logger.info('UpsertList', disp)
  expect(res).toBeRight()
})

test('deleteList', async () => {
  const subscriberList = makeSubscribers(100, 310, [grp.id])

  const res = await pipe(
    subscriberList,
    A.map((x) => ({ id: x.email })),
    subscribers.delList(cfg)
  )()
  const disp = E.isRight(res)
    ? pipe(
        res.right,
        A.map(({ failed, successful, total }) => ({ failed, successful, total }))
      )
    : res.left

  logger.info('UpsertList', disp)
  expect(res).toBeRight()
})

test('Upsert Error', async () => {
  const sub = subsList[0]
  const res = await pipe({...sub, email: '', wrongfield: 'test' }, subscribers.upsert<CustomFields>(cfg))()
  logger.info('Upsert Error', res)
  expect(res).toBeLeft()
})


test('List subscribers with wrong params', async () => {
  const wrongParams = JSON.parse(JSON.stringify({limit: 2, filter: {truc: 'test'}}))
  const res = await pipe(wrongParams, subscribers.list<CustomFields>(cfg))()
  logger.info('List subscribers with wrong params', res)
  expect(res).toSubsetEqualLeft({kind: 'UnprocessableError'})
})


test('Delete non existing subscriber should be left', async () => {
  const res = await pipe(
        subscribers.del(cfg)({id: 'fake@fake.com'})
  )()
  logger.info('Delete non existing', res)
  expect(res).toBeLeft()
})

test('deleteList with non existing subs', async () => {
  const subscriberList = [{email: 'fake01@fake.com'}, {email: 'fake02@fake.com'}, ]

  // const checkErr = (err: MlError) => {
  //   const data = err.data as IBatchResponse
  //   const nErr = data.responses.filter( el => (el.code > 300 && el.code != 404) )
  //   return nErr.length
  // }

  const res = await pipe(
    subscriberList,
    A.map((x) => ({ id: x.email })),
    subscribers.delList(cfg),
    // TE.fold( 
    //   e => checkErr(e) > 0 ? TE.left(e) : TE.right(e as any),
    //   res => TE.right(res)
    //   )
  )()

  logger.info('deletelist with non existing', res)
  expect(res).toSubsetEqualLeft({kind: 'BatchError', message: '2 batch failed out of 2' })
})


test('deleteList with a mix of non existing and existing subs', async () => {
  
  const res = await pipe(
    subsList[0],
    subscribers.upsert<CustomFields>(cfg),
    TE.map(xs => [{id: xs.data.email}, {id: 'fake@fake.com'}]),
    TE.chain(subscribers.delList(cfg))
    )()

  logger.info('deletelist with a mix', res)
  expect(res).toSubsetEqualLeft({kind: 'BatchError', message: '1 batch failed out of 2' })
})

