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

export function drawLongTapFrame(
  max: number,
  config: Configuration,
  state: InternalState,
) {
  const radius = max * Math.min(
    calcTotalProgress(state.currentFrame, config.theme.lengthInMillis),
    1.0
  )

  drawRipple(
    config,
    radius,
    1.0
  )

  return radius
}

export function drawReleasedFrame(
  max: number,
  lastIncreaseRadius: number,
  config: Configuration,
  state: InternalState,
): {
  opacity: number, radius: number,
} {
  const maxFillLength = Math.min(
    Math.max(
      (config.theme.lengthInMillis - state.releasedFrame) / config.theme.releaseAcceleration,
      0
    ),
    config.theme.maxReleasedFillLengthInMillis
  )

  const currentReleasedTime = state.currentFrame - state.releasedFrame
  const radius =
    max <= lastIncreaseRadius ?
      max :
      Math.min(
        max,
        lastIncreaseRadius + (
          (max - lastIncreaseRadius) * (currentReleasedTime / maxFillLength)
        )
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
