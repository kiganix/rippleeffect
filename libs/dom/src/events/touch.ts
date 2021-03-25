import {
  resolvePosition,
  spreadTouchEvent,
} from '../util'
import {
  OnPress,
} from '../internalConsts'
import {
  OnReleased,
} from '../consts'
import { StateResolver } from '@rippleeffect/canvas'

export function registerRippleElementTouchEvents(
  root: Element,
  onPress: OnPress,
  onReleased: OnReleased | undefined,
) {
  var presses: number[] = []
  const isPress = (id: number): boolean => presses.includes(id)

  root.addEventListener('touchstart', function (e: TouchEvent) {
    e.preventDefault()

    spreadTouchEvent(e, (touch) => {
      const position = resolvePosition(root, touch)
      presses.push(touch.identifier)

      const stateResolver: StateResolver = () => {
        return {
          released: !isPress(touch.identifier)
        }
      }

      onPress(position, stateResolver)
    })
  })

  const touchEndEvent = (isInterrupted: boolean, e: TouchEvent) => {
    e.preventDefault()
    spreadTouchEvent(e, (touch) => {
      if (isPress(touch.identifier) && onReleased) {
        onReleased(isInterrupted)
      }
      presses = presses.filter(itr => itr != touch.identifier)
    })
  }

  root.addEventListener('touchend', (e: TouchEvent) => { touchEndEvent(false, e) })
  root.addEventListener('touchcancel', (e: TouchEvent) => { touchEndEvent(true, e) })
}
