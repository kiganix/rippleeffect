import {
  startRipple,
  DefaultTheme as CanvasDefaultTheme,
  Position,
  Theme as CanvasTheme,
  Configuration,
  OnCompleted,
  StateResolver,
} from '@rippleeffect/canvas'
import * as CSS from 'csstype'

export type Theme = CanvasTheme & {
  display: CSS.Property.Display,
  cursor: CSS.Property.Cursor,
  position: CSS.Property.Position,
  overflow: CSS.Property.Overflow,
  webkitTapHighlightColor: CSS.Property.WebkitTapHighlightColor,
}

export const DefaultTheme: Theme = {
  ...CanvasDefaultTheme,
  display: 'inline-block',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  webkitTapHighlightColor: 'transparent',
}

export function resolvePosition(element: Element, e: MouseEvent | Touch): Position {
  const rect = element.getBoundingClientRect()
  return {
    centerX: e.pageX - rect.left,
    centerY: e.pageY - rect.top,
  }
}

export function createRippleElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  children?: string | Node,
  theme: Theme = DefaultTheme,
): HTMLElementTagNameMap[K] {
  const root = document.createElement(tagName)

  applyRippleElementStyles(root, theme)

  if (children) {
    root.append(children)
  }

  registerRippleElementEvents(root, theme)

  return root
}

function applyRippleElementStyles(
  root: HTMLElement,
  theme: Theme = DefaultTheme,
) {
  root.style.display = theme.display
  root.style.position = theme.position
  root.style.overflow = theme.overflow
  root.style.cursor = theme.cursor
  root.style.webkitTapHighlightColor = theme.webkitTapHighlightColor
}

type OnPress = (
  position: Position,
  stateResolver: StateResolver,
) => void

function registerRippleElementEvents(
  root: Element,
  theme: Theme = DefaultTheme
) {
  const onPress = (
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

  registerRippleElementMouseEvents(root, onPress)
  registerRippleElementTouchEvents(root, onPress)
}

function registerRippleElementMouseEvents(
  root: Element,
  onPress: OnPress,
) {
  const mouseDown = (e: MouseEvent) => {
    var released = false

    const position = resolvePosition(root, e)

    const stateResolver = () => {
      return {
        released: released,
      }
    }

    const releaseEvent = (e: MouseEvent) => { released = true }
    root.addEventListener('mouseup', releaseEvent, { once: true })
    root.addEventListener('mouseleave', releaseEvent, { once: true })

    onPress(position, stateResolver)
  }
  root.addEventListener('mousedown', mouseDown)
}

function registerRippleElementTouchEvents(
  root: Element,
  onPress: OnPress,
) {
  var presses: number[] = []

  root.addEventListener('touchstart', function (e: TouchEvent) {
    for (var i=0;i<e.changedTouches.length;i++) {
      const touch = e.changedTouches[i]
      const position = resolvePosition(root, touch)
      presses.push(touch.identifier)

      const stateResolver: StateResolver = () => {
        return {
          released: !presses.includes(touch.identifier)
        }
      }

      onPress(position, stateResolver)
    }
  })

  const touchEndEvent = (e: TouchEvent) => {
    for (var i=0;i<e.changedTouches.length;i++) {
      const touch = e.changedTouches[i]
      presses = presses.filter(itr => itr != touch.identifier)
    }
  }
  root.addEventListener('touchend', touchEndEvent)
  root.addEventListener('touchcancel', touchEndEvent)
}

function createCanvas(root: Element): HTMLCanvasElement {
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
