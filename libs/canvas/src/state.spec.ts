import { StateResolver } from './consts'
import { createInternalState, InternalState } from './state'

describe('createInternalState', () => {

  const stateResolver: (released: boolean) => StateResolver =
      (released: boolean) => { return () => { return { released: released } } }

  describe('初回描画につきstateがない場合', () => {
    const state: InternalState | undefined = undefined

    test('initialPerformanceTimeは常に現在のperformanceTimeになること', () => {
      expect(
        createInternalState(state, 0, stateResolver(false)).initialPerformanceTime
      ).toEqual(0)
      expect(
        createInternalState(state, 114514, stateResolver(false)).initialPerformanceTime
      ).toEqual(114514)
      expect(
        createInternalState(state, -114514, stateResolver(false)).initialPerformanceTime
      ).toEqual(-114514)
    })

    test('currentFrameが常に0になること', () => {
      expect(
        createInternalState(state, 0, stateResolver(false)).currentFrame
      ).toEqual(0)
      expect(
        createInternalState(state, 114514, stateResolver(false)).currentFrame
      ).toEqual(0)
      expect(
        createInternalState(state, -114514, stateResolver(false)).currentFrame
      ).toEqual(0)
    })

    test('pressedFrameが常に0になること', () => {
      expect(
        createInternalState(state, 0, stateResolver(false)).pressedFrame
      ).toEqual(0)
      expect(
        createInternalState(state, 114514, stateResolver(false)).pressedFrame
      ).toEqual(0)
      expect(
        createInternalState(state, -114514, stateResolver(false)).pressedFrame
      ).toEqual(0)
    })

    test('初回frame時点でreleaseされていない場合、常にreleasedFrameはundefinedになること', () => {
      expect(
        createInternalState(state, 0, stateResolver(false)).releasedFrame
      ).toBeUndefined()
      expect(
        createInternalState(state, 114514, stateResolver(false)).releasedFrame
      ).toBeUndefined()
      expect(
        createInternalState(state, -114514, stateResolver(false)).releasedFrame
      ).toBeUndefined()
    })

    test('初回frame時点でreleaseされていた場合、常にreleasedFrameは0になること', () => {
      expect(
        createInternalState(state, 0, stateResolver(true)).releasedFrame
      ).toEqual(0)
      expect(
        createInternalState(state, 114514, stateResolver(true)).releasedFrame
      ).toEqual(0)
      expect(
        createInternalState(state, -114514, stateResolver(true)).releasedFrame
      ).toEqual(0)
    })

  })

})
