import {
  Position,
  StateResolver,
} from '@rippleeffect/canvas'

export type OnPress = (
  position: Position,
  stateResolver: StateResolver,
) => void
