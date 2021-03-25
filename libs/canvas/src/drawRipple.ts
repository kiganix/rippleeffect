import { Position, Configuration, Theme } from './consts'

export function drawRipple(
  config: Configuration,
  radius: number,
  opacity: number,
) {
  config.context.clearRect(0, 0, config.areaSize.width, config.areaSize.height)
  config.context.fillStyle = createFillStyle(opacity, config.theme)
  config.context.fill(
    createCircle(
      config.position,
      radius
    )
  )
}

function createFillStyle(opacity: number, theme: Theme) {
  return `rgba(${theme.rippleColor.r}, ${theme.rippleColor.g}, ${theme.rippleColor.b}, ${opacity * theme.rippleColor.a})`
}

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
