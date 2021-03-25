import { State, StateResolver } from './consts'

export type InternalState = State & {
  initialPerformanceTime: number,
  currentFrame: number,
  pressedFrame: number,
  releasedFrame: undefined | number,
}

export function createInternalState(
  state: InternalState | undefined,
  performanceTime: number,
  stateResolver: StateResolver,
): InternalState {
  const externalState = stateResolver()
  const initialPerformanceTime =
    state ? state.initialPerformanceTime : performanceTime
  const currentFrame =
    performanceTime - initialPerformanceTime

  const pressedFrame =
    state ? state.pressedFrame : 0

  const releasedFrame =
    state && state.releasedFrame ? state.releasedFrame :
    externalState.released ? currentFrame : undefined

  return {
    ...externalState,
    initialPerformanceTime,
    currentFrame,
    pressedFrame,
    releasedFrame
  }
}
