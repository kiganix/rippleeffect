import {
  Position,
} from '@rippleeffect/canvas'
import {
  Theme, DefaultTheme,
} from './consts'

export function resolvePosition(element: Element, e: MouseEvent | Touch): Position {
  const rect = element.getBoundingClientRect()
  return {
    centerX: e.pageX - rect.left,
    centerY: e.pageY - rect.top,
  }
}

export function spreadTouchEvent(e: TouchEvent, map: (touch: Touch) => void) {
  for (var i=0;i<e.changedTouches.length;i++) {
    map(e.changedTouches[i])
  }
}

export function createCanvas(root: Element): HTMLCanvasElement {
  const foreground = document.createElement('canvas')

  foreground.width = root.clientWidth,
  foreground.height = root.clientHeight
  foreground.style.position = 'absolute'
  foreground.style.top = '0'
  foreground.style.left = '0'
  foreground.style.right = '0'
  foreground.style.bottom = '0'

  return foreground
}

export function applyRippleElementStyles(
  root: HTMLElement,
  theme: Theme = DefaultTheme,
) {
  root.style.display = theme.display
  root.style.position = theme.position
  root.style.overflow = theme.overflow
  root.style.cursor = theme.cursor
  root.style.webkitTapHighlightColor = theme.webkitTapHighlightColor
}
