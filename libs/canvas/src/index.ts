export type Position = {
  centerX: number,
  centerY: number,
}

type AreaSize = {
  width: number,
  height: number,
}

export type Rgba = {
  r: number,
  g: number,
  b: number,
  a: number,
}

export const DefaultColor: Rgba = {
  r: 0,
  g: 0,
  b: 0,
  a: 0.3,
}

export type Theme = {
  rippleColor: Rgba,
  lengthInMillis: number,
  opacityLengthInMillis: number,
  maxReleasedFillLengthInMillis: number,
  releaseAcceleration: number,
}

export const DefaultTheme: Theme = {
  rippleColor: DefaultColor,
  lengthInMillis: 1500,
  opacityLengthInMillis: 800,
  releaseAcceleration: 2,
  maxReleasedFillLengthInMillis: 300,
}

export type Configuration = {
  context: CanvasRenderingContext2D,
  areaSize: AreaSize,
  position: Position,
  theme: Theme,
}

export type OnCompleted = () => void

export type State = {
  released: boolean,
}

export type StateResolver = () => State

function createCircle(
  position: Position,
  radius: number,
) {
  const circle = new Path2D()
  circle.arc(
    position.centerX, position.centerY,
    radius,
    0 * Math.PI,
    360 * Math.PI,
    false
  )
  return circle
}

function drawRipple(
  config: Configuration,
  radius: number,
  opacity: number,
) {
  config.context.clearRect(0, 0, config.areaSize.width, config.areaSize.height)
  config.context.fillStyle =
    `rgba(${config.theme.rippleColor.r}, ${config.theme.rippleColor.g}, ${config.theme.rippleColor.b}, ${opacity * config.theme.rippleColor.a})`
  config.context.fill(
    createCircle(
      config.position,
      radius
    )
  )
}

type InternalState = State & {
  initialPerformanceTime: number,
  currentFrame: number,
  pressedFrame: number,
  releasedFrame: undefined | number,
}

function createState(
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

function drawLongTapFrame(
  max: number,
  config: Configuration,
  state: InternalState,
) {
  const totalProgress = state.currentFrame <= 0 ?
    0 :
    state.currentFrame / config.theme.lengthInMillis
  const radius = max * Math.min(totalProgress, 1.0)

  drawRipple(
    config,
    radius,
    1.0
  )

  return radius
}

function drawReleasedFrame(
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

/**
 * クリック位置からコンパスする
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

export function startRipple(
  config: Configuration,
  stateResolver: StateResolver,
  onCompleted: OnCompleted,
  requestAnimationFrame: (callback: FrameRequestCallback) => void,
): void {
  const max = calcMaxRadius(config.areaSize, config.position)

  var state: InternalState | undefined = undefined
  var lastIncreaseRadius: number | undefined = undefined

  const drawFrame: FrameRequestCallback = (performanceTime) => {
    state = createState(state, performanceTime, stateResolver)
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
