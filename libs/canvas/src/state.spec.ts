import { StateResolver } from './consts'
import { createInternalState, InternalState } from './state'

describe('createInternalState', () => {
  const randomBool = () => (Math.random() < 0.5)

  const stateResolver: (released?: boolean) => StateResolver =
      (released?: boolean) => { return () => {
        return { released: released !== undefined ? released : randomBool() } }
      }

  describe('初回描画につきstateがない場合', () => {
    const state: InternalState | undefined = undefined

    test.each([0, 114514, -114514])('initialPerformanceTimeは常に現在のperformanceTimeになること', (performanceTime) => {
      expect(
        createInternalState(state, performanceTime, stateResolver()).initialPerformanceTime
      ).toEqual(performanceTime)
    })

    test.each([0, 114514, -114514])('currentFrameが常に0になること', (pt) => {
      expect(
        createInternalState(state, pt, stateResolver()).currentFrame
      ).toEqual(0)
    })

    test.each([0, 114514, -114514])('初回frame時点でreleaseされていない場合、常にreleasedFrameはundefinedになること', (pt) => {
      expect(
        createInternalState(state, pt, stateResolver(false)).releasedFrame
      ).toBeUndefined()
    })

    test.each([0, 114514, -114514])('初回frame時点でreleaseされていた場合、常にreleasedFrameは0になること', (pt) => {
      expect(
        createInternalState(state, pt, stateResolver(true)).releasedFrame
      ).toEqual(0)
    })

  })

  describe('stateがある場合', () => {

    test.each([0, 114514, -114514])('initialStateは常に渡されたstateの内容に従うこと', (performanceTime) => {
      const initialState = createInternalState(undefined, 2929831, stateResolver())
      expect(initialState.initialPerformanceTime).not.toEqual(performanceTime)

      expect(
        createInternalState(initialState, performanceTime, stateResolver()).initialPerformanceTime
      ).toEqual(initialState.initialPerformanceTime)
    })

    test.each([0, 2929831, -2929831])('currentFrameは常にinitialStateからの経過時間になること', (performanceTime) => {
      const initialState = createInternalState(undefined, 114514, stateResolver())

      expect(
        createInternalState(initialState, performanceTime, stateResolver()).currentFrame
      ).toEqual(
        performanceTime - initialState.initialPerformanceTime
      )
    })

    test.each([0, 2929831, -2929831])('releasedFrameが存在する場合、常に渡された内容に従うこと', (performanceTime) => {
      const initialState = createInternalState(undefined, 114514, stateResolver(false))
      expect(initialState.releasedFrame).toBeUndefined()

      expect(
        createInternalState({...initialState, releasedFrame: performanceTime}, 114514, stateResolver()).releasedFrame
      ).toEqual(performanceTime)
    })

    test.each([0, 2929831, -2929831])('releasedFrameが存在する場合、常に渡された内容に従うこと', (performanceTime) => {
      const initialState = createInternalState(undefined, 114514, stateResolver(false))
      expect(initialState.released).toEqual(false)
      expect(initialState.releasedFrame).toBeUndefined()

      const target = createInternalState(initialState, performanceTime, stateResolver(true))

      expect(target.released).toEqual(true)
      expect(target.releasedFrame).toEqual(performanceTime - initialState.initialPerformanceTime)
    })

  })

})
