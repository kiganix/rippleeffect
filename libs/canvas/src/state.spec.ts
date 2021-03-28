import { StateResolver } from './consts'
import { createInternalState, InternalState } from './state'

describe('createInternalState', () => {

  const stateResolver: (released: boolean) => StateResolver =
      (released: boolean) => { return () => { return { released: released } } }

  describe('初回描画につきstateがない場合', () => {
    const state: InternalState | undefined = undefined

    test.each([0, 114514, -114514])('initialPerformanceTimeは常に現在のperformanceTimeになること', (performanceTime) => {
      expect(
        createInternalState(state, performanceTime, stateResolver(false)).initialPerformanceTime
      ).toEqual(performanceTime)
    })

    test.each([0, 114514, -114514])('currentFrameが常に0になること', (pt) => {
      expect(
        createInternalState(state, pt, stateResolver(false)).currentFrame
      ).toEqual(0)
    })

    test.each([0, 114514, -114514])('pressedFrameが常に0になること', (pt) => {
      expect(
        createInternalState(state, pt, stateResolver(false)).pressedFrame
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

})
