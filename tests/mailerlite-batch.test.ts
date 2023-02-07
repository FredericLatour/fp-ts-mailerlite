import '@relmify/jest-fp-ts'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import 'jest'
import { groups, IBatchResponse, runBatch, subscribers } from '../src'
import { cfg, logger, makeSubscribers } from './common'


let subsList: ReturnType<typeof makeSubscribers>
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

  subsList = makeSubscribers(1, 40, [grp.id])
})


test('Upsert batch', async () => {
  const validateBatch = (b: IBatchResponse) => {

    if (b.failed > 0) {
      // const failed = pipe(b.responses, A.filter(e => e.code >= 300))
      const err = new Error(`${b.failed} batch failed`)
      return TE.left(err)
    } else {
      return TE.right(b)
    }
  }

  const res = await pipe(
    subsList,
    A.traverse(E.Applicative)(subscribers.upsertBatch),
    TE.fromEither,
    TE.chainW(xs => runBatch(cfg)(xs)),
    TE.chain(validateBatch)
  )()
  expect(res).toBeRight()

  if (E.isRight(res)) {
    logger.info('res', {...res.right, responses: null})
  }
})
