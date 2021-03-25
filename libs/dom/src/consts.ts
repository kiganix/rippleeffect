import {
  DefaultTheme as CanvasDefaultTheme,
  Theme as CanvasTheme,
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

export type OnReleased =
  (
    /**
     * 領域外でリリースされた場合などにtrue
     */
    isInterruped: boolean
  ) => void

export type Options = {
  theme: Theme,
  onReleased: OnReleased | undefined,
}

export const DefaultOptions: Options = {
  theme: DefaultTheme,
  onReleased: undefined,
}
