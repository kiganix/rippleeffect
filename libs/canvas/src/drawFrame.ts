import { Configuration } from './consts'
import { drawRipple } from './drawRipple'
import { InternalState } from './state'

export function calcTotalProgress(
  currentFrame: number,
  lengthInMillis: number,
): number {
  return currentFrame <= 0 ?
    0 :
    currentFrame / lengthInMillis
}

export function calcRadius(
  max: number,
  progress: number
): number {
  return max * Math.min(
    progress,
    1.0
  )
}

export function drawLongTapFrame(
  max: number,
  config: Configuration,
  state: InternalState,
) {
  const radius = calcRadius(
    max,
    calcTotalProgress(state.currentFrame, config.theme.lengthInMillis),
  )

  drawRipple(
    config,
    radius,
    1.0
  )

  return radius
}

export function calcMaxFillLength(
  lengthInMillis: number,
  releasedFrame: number,
  releaseAcceleration: number,
  maxReleasedFillLengthInMillis: number,
): number {
  return Math.min(
    Math.max(
      (lengthInMillis - releasedFrame) / releaseAcceleration,
      0
    ),
    maxReleasedFillLengthInMillis
  )
}

export function calcReleasedRadius(
  max: number,
  lastIncreaseRadius: number,
  progress: number
) {
  const remainingRadius = max - lastIncreaseRadius

  return max <= lastIncreaseRadius ? max :
    Math.min(
      max,
      lastIncreaseRadius + (remainingRadius * progress)
    )
}

export function drawReleasedFrame(
  max: number,
  lastIncreaseRadius: number,
  config: Configuration,
  state: InternalState,
): {
  opacity: number, radius: number,
} {
  const maxFillLength = calcMaxFillLength(
    config.theme.lengthInMillis,
    state.releasedFrame,
    config.theme.releaseAcceleration,
    config.theme.maxReleasedFillLengthInMillis,
  )

  const currentReleasedTime = state.currentFrame - state.releasedFrame
  const radius = calcReleasedRadius(
    max,
    lastIncreaseRadius,
    calcTotalProgress(currentReleasedTime, maxFillLength),
  )

  const opacity = currentReleasedTime <= 0 ?
    1 :
    1 - Math.min(currentReleasedTime / config.theme.opacityLengthInMillis, 1)

  drawRipple(
    config,
    radius,
    opacity
  )

  return { opacity, radius }
}
