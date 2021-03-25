import { Position, Configuration, StateResolver, AreaSize, OnCompleted } from './consts'
import { InternalState, createInternalState } from './state'
import { drawLongTapFrame, drawReleasedFrame } from './drawFrame'

/**
 * クリック位置からコンパスを引く
 */
function calcMaxRadius(
  areaSize: AreaSize,
  position: Position,
): number {
  return Math.sqrt(
    Math.pow(
      Math.max(
        position.centerX,
        areaSize.width - position.centerX
      ),
    2) +
    Math.pow(
      Math.max(
        position.centerY,
        areaSize.height - position.centerY
      ),
    2)
  )
}

/**
 * クリックやタッチ開始時にコールする
 */
export function startRipple(
  config: Configuration,
  stateResolver: StateResolver,
  onCompleted: OnCompleted,
  requestAnimationFrame: (callback: FrameRequestCallback) => void,
): void {
  const max = calcMaxRadius(config.areaSize, config.position)

  var state: InternalState | undefined = undefined
  var lastIncreaseRadius: number = 0

  const drawFrame: FrameRequestCallback = (performanceTime) => {
    state = createInternalState(state, performanceTime, stateResolver)
    if (state.releasedFrame === undefined) {
      lastIncreaseRadius = drawLongTapFrame(max, config, state)
      requestAnimationFrame(drawFrame)
    } else {
      const { opacity, radius } = drawReleasedFrame(max, lastIncreaseRadius, config, state)
      if (opacity > 0 || radius < max) {
        requestAnimationFrame(drawFrame)
      } else {
        onCompleted()
      }
    }
  }

  requestAnimationFrame(drawFrame)
}
