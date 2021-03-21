import React, { ReactElement, ReactInstance, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Theme,
  resolvePosition,
} from '@rippleeffect/dom'
import {
  Configuration,
  Position,
  startRipple,
  OnCompleted,
  StateResolver,
} from '@rippleeffect/canvas'
import ReactDOM from 'react-dom'

export type RippleEffectProps<K extends keyof HTMLElementTagNameMap> = {
  as: K,
  theme: Theme,
  style?: React.CSSProperties,
}

export function RippleEffect<K extends keyof HTMLElementTagNameMap>(
  props: React.PropsWithChildren<RippleEffectProps<K>>
): ReactElement {
  const [rootReleased, setRootReleased] = useState<boolean>(false)
  const mouseCanvasesRef = useRef<[string, Position][]>([])
  const setLastCanvasesUpdatedAt = useState<number | undefined>(undefined)[1]

  const style = useMemo(() => {
    return {
      ...(props.style ? props.style : {}),
      display: props.theme.display,
      position: props.theme.position,
      overflow: props.theme.overflow,
      cursor: props.theme.cursor,
    }
  }, [props.theme, props.style])

  const rootRef = useRef<React.ReactInstance>()

  const mouseDown = useCallback((e: MouseEvent) => {
    const node =
      rootRef.current ? ReactDOM.findDOMNode(rootRef.current) : undefined

    if (node instanceof Element) {
      mouseCanvasesRef.current = [
        ...mouseCanvasesRef.current,
        [
          new Date().getTime().toFixed(),
          resolvePosition(node, e),
        ]
      ]
      setLastCanvasesUpdatedAt(new Date().getTime())
    } else {
      throw new Error('Illegal element type.')
    }

    setRootReleased(false)
  }, [rootRef, rootRef.current])

  const mouseRelease = useCallback((e: MouseEvent) => {
    setRootReleased(true)
  }, [])

  const onCompleted = useCallback((identifier: string) => {
    mouseCanvasesRef.current =
      mouseCanvasesRef.current.filter(itr => itr[0] != identifier)
    setLastCanvasesUpdatedAt(new Date().getTime())
  }, [])

  return React.createElement(props.as, {
    ref: rootRef,
    style: style,
    onMouseDown: mouseDown,
    onMouseUp: mouseRelease,
    onMouseLeave: mouseRelease,
  }, [
    props.children,
    mouseCanvasesRef.current.map(canvas => {
      return <RippleEffectCanvas
        key={canvas[0]}
        identifier={canvas[0]}
        rootRef={rootRef}
        position={canvas[1]}
        theme={props.theme}
        isRootReleased={rootReleased}
        onCompleted={onCompleted}
        />
    })
  ])
}

function RippleEffectCanvas(
  props: React.PropsWithoutRef<{
    rootRef: React.MutableRefObject<ReactInstance>,
    identifier: string,
    position: Position,
    theme: Theme,
    onCompleted: (identifier: string) => void,
    isRootReleased: boolean,
  }>
) {
  const [startedOnce, setStartedOnce] = useState<boolean>(false)
  const releasedOnce = useRef<boolean>(false)

  const canvasRef = useRef<HTMLCanvasElement | undefined>(undefined)
  const [config, setConfiguration] = useState<Configuration | undefined>(undefined)

  useEffect(() => {
    const node =
      props.rootRef.current ? ReactDOM.findDOMNode(props.rootRef.current) : undefined

    if (node && canvasRef.current && node instanceof Element) {
      setConfiguration({
        context: canvasRef.current.getContext('2d'),
        theme: props.theme,
        position: props.position,
        areaSize: {width: node.clientWidth, height: node.clientHeight},
      })
    } else {
      setConfiguration(undefined)
    }
  }, [props.rootRef, props.rootRef.current, canvasRef, canvasRef.current])

  useEffect(() => {
    if (!releasedOnce.current) {
      releasedOnce.current = props.isRootReleased
    }
  }, [props.isRootReleased])

  useEffect(() => {
    if (config && !startedOnce) {
      setStartedOnce(true)
      releasedOnce.current = false
      startRipple(
        config,
        () => {
          return {
            released: releasedOnce.current,
          }
        },
        () => {
          props.onCompleted(props.identifier)
        },
        requestAnimationFrame,
      )
    }
  }, [config, props.onCompleted, requestAnimationFrame])

  return <canvas
    key={props.identifier}
    ref={canvasRef}
    width={config ? config.areaSize.width : undefined}
    height={config ? config.areaSize.height : undefined}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}
    />
}
