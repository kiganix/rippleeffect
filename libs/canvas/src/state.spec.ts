import { StateResolver } from './consts'
import { createInternalState, InternalState } from './state'

describe('createInternalState', () => {

  describe('初回描画につきstateがない場合', () => {
    const state: InternalState | undefined = undefined
    const stateResolver: StateResolver = () => { return { released: false } }

    test('initialPerformanceTimeは常に現在のperformanceTimeになること', () => {
      expect(
        createInternalState(state, 0, stateResolver).initialPerformanceTime
      ).toEqual(0)
      expect(
        createInternalState(state, 114514, stateResolver).initialPerformanceTime
      ).toEqual(114514)
      expect(
        createInternalState(state, -114514, stateResolver).initialPerformanceTime
      ).toEqual(-114514)
    })

    test('currentFrameが常に0になること', () => {
      expect(
        createInternalState(state, 0, stateResolver).currentFrame
      ).toEqual(0)
      expect(
        createInternalState(state, 114514, stateResolver).currentFrame
      ).toEqual(0)
      expect(
        createInternalState(state, -114514, stateResolver).currentFrame
      ).toEqual(0)
    })

  })

})
