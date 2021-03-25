import {
  Options, DefaultOptions,
} from './consts'
import {
  applyRippleElementStyles,
} from './util'
import { registerRippleElementEvents } from './events'

export function createRippleElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  children?: string | Node,
  options: Options = DefaultOptions
): HTMLElementTagNameMap[K] {
  const root = document.createElement(tagName)

  applyRippleElementStyles(root, options.theme)

  if (children) {
    root.append(children)
  }

  registerRippleElementEvents(root, options.theme, options.onReleased)

  return root
}
