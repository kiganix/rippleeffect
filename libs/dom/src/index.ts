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

export type OnReleased =
  (isInterruped: boolean) => void

export type Options = {
  theme: Theme,
  onReleased: OnReleased | undefined,
}

export const DefaultOptions: Options = {
  theme: DefaultTheme,
  onReleased: undefined,
}

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
  theme: Theme = DefaultTheme,
  onReleased: OnReleased | undefined,
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

  registerRippleElementTouchEvents(root, onPress, onReleased)
  registerRippleElementMouseEvents(root, onPress, onReleased)
}

function registerRippleElementMouseEvents(
  root: Element,
  onPress: OnPress,
  onReleased: OnReleased | undefined,
) {
  const mouseDown = (e: MouseEvent) => {
    var released = false

    const position = resolvePosition(root, e)

    const stateResolver = () => {
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

function registerRippleElementTouchEvents(
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

export function spreadTouchEvent(e: TouchEvent, map: (touch: Touch) => void) {
  for (var i=0;i<e.changedTouches.length;i++) {
    map(e.changedTouches[i])
  }
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
