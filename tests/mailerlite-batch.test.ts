import '@relmify/jest-fp-ts'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import 'jest'
import { groups, subscribers, batch} from '../src'
import { cfg, logger, makeSubscribers } from './common'


let delSubsList: ReturnType<typeof makeSubscribers>
let grp: groups.IGroupData

beforeAll( async () => {
  const groupName = 'fltest_'+ (new Date()).toISOString() 
  await pipe(
    { name: groupName },
    groups.create(cfg),
    TE.fold(
      (e) => () => {throw e},
      (res) => T.fromIO(() => { grp = res.data })
    )
    )()

  delSubsList = makeSubscribers(1, 40, [grp.id])
})


// test('Upsert batch', async () => {

//   const res = await pipe(
//     delSubsList,
//     A.traverse(E.Applicative)(subscribers.upsertBatch),
//     TE.fromEither,
//     TE.chainW(xs => runBatch(cfg)(xs)),
//     TE.chain(validateBatch)
//   )()
//   expect(res).toBeRight()

//   if (E.isRight(res)) {
//     logger.info('res', {...res.right, responses: null})
//   }
// })


test('Upsert & Delete batch', async () => {

  delSubsList = makeSubscribers(50, 60, [grp.id])

  const delBatch = pipe(
    delSubsList,
    A.map(x => ({id: x.email})),
    A.traverse(E.Applicative)(subscribers.delBatch),
    TE.fromEither,
  )
  const upsertBatch = pipe(
    delSubsList,
    A.traverse(E.Applicative)(subscribers.upsertBatch),
    TE.fromEither,
  )

  const res = await pipe(
    upsertBatch,
    TE.chainW(batch.runBatch(cfg)),
    TE.chainW(batch.validateBatch),
    TE.chain( r => { r; return delBatch}),
    TE.chainW(batch.runBatch(cfg)),
    TE.chainW(batch.validateBatch),
  )()
  expect(res).toBeRight()

  if (E.isRight(res)) {
    logger.info('res', {...res.right, responses: null})
  }
})
