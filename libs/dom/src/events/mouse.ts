import {
  resolvePosition,
} from '../util'
import {
  OnPress,
} from '../internalConsts'
import {
  OnReleased,
} from '../consts'
import { StateResolver } from '@rippleeffect/canvas'

export function registerRippleElementMouseEvents(
  root: Element,
  onPress: OnPress,
  onReleased: OnReleased | undefined,
) {
  const mouseDown = (e: MouseEvent) => {
    var released = false

    const position = resolvePosition(root, e)

    const stateResolver: StateResolver = () => {
      return {
        released: released,
      }
    }

    root.addEventListener('mouseup', () => {
      if (!released && onReleased) {
        onReleased(false)
      }
      released = true
    }, { once: true })

    root.addEventListener('mouseleave', () => {
      if (!released && onReleased) {
        onReleased(true)
      }
      released = true
    }, { once: true })

    onPress(position, stateResolver)
  }
  root.addEventListener('mousedown', mouseDown)
}
