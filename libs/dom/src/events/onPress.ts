import {
  Theme,
  DefaultTheme,
} from '../consts'
import {
  startRipple,
  Position,
  Configuration,
  OnCompleted,
  StateResolver,
} from '@rippleeffect/canvas'
import {
  createCanvas,
} from '../util'
import { OnPress } from '../internalConsts'

export function createOnPress(
  root: Element,
  theme: Theme = DefaultTheme,
): OnPress {
  return (
    position: Position,
    stateResolver: StateResolver,
  ) => {
    const foreground = createCanvas(root)
    root.appendChild(foreground)

    const config: Configuration = {
      context: foreground.getContext('2d'),
      areaSize: { width: foreground.clientWidth, height: foreground.clientHeight },
      position: position,
      theme: theme,
    }
    const onCompleted: OnCompleted = () => { foreground.remove() }

    startRipple(
      config,
      stateResolver,
      onCompleted,
      requestAnimationFrame
    )
  }
}
