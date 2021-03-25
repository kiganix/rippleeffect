import {
  Theme, DefaultTheme,
  OnReleased,
} from '../consts'
import { OnPress } from '../internalConsts'
import { createOnPress } from './onPress'
import { registerRippleElementMouseEvents } from './mouse'
import { registerRippleElementTouchEvents } from './touch'

export function registerRippleElementEvents(
  root: Element,
  theme: Theme = DefaultTheme,
  onReleased: OnReleased | undefined,
) {
  const onPress: OnPress = createOnPress(root, theme)

  registerRippleElementTouchEvents(root, onPress, onReleased)
  registerRippleElementMouseEvents(root, onPress, onReleased)
}
