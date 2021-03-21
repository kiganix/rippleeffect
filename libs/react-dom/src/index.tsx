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

type LocalCanvas = {
  type: 'mouse' | 'touch',
  id: string,
  position: Position,
  keyPrefix: string,
}

export function RippleEffect<K extends keyof HTMLElementTagNameMap>(
  props: React.PropsWithChildren<RippleEffectProps<K>>
): ReactElement {
  const [rootReleased, setRootReleased] = useState<boolean>(false)
  const mouseCanvasesRef = useRef<LocalCanvas[]>([])
  const touchCanvasesRef = useRef<LocalCanvas[]>([])
  const holdTouchesRef = useRef<string[]>([])
  const setLastCanvasesUpdatedAt = useState<number | undefined>(undefined)[1]

  const style = useMemo(() => {
    return {
      ...(props.style ? props.style : {}),
      display: props.theme.display,
      position: props.theme.position,
      overflow: props.theme.overflow,
      cursor: props.theme.cursor,
      WebkitTapHighlightColor: props.theme.webkitTapHighlightColor,
    }
  }, [props.theme, props.style])

  const rootRef = useRef<React.ReactInstance>()

  const mouseDown = useCallback((e: MouseEvent) => {
    const node =
      rootRef.current ? ReactDOM.findDOMNode(rootRef.current) : undefined

    if (node instanceof Element) {
      mouseCanvasesRef.current = [
        ...mouseCanvasesRef.current,
        {
          type: 'mouse',
          id: new Date().getTime().toFixed(),
          position: resolvePosition(node, e),
          keyPrefix: '',
        }
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

  const touchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()

    const node =
      rootRef.current ? ReactDOM.findDOMNode(rootRef.current) : undefined

    if (node instanceof Element) {
      for (var i=0;i<e.changedTouches.length;i++) {
        const touch = e.changedTouches[i]
        const id = String(touch.identifier)

        touchCanvasesRef.current = [
          ...touchCanvasesRef.current,
          {
            type: 'touch',
            id: id,
            position: resolvePosition(node, touch),
            keyPrefix: new Date().getTime().toFixed()
          }
        ]

        holdTouchesRef.current = [
          ...holdTouchesRef.current,
          id,
        ]

        setLastCanvasesUpdatedAt(new Date().getTime())
      }
    } else {
      throw new Error('Illegal element type.')
    }
  }, [])

  const touchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()

    for (var i=0;i<e.changedTouches.length;i++) {
      const touch = e.changedTouches[i]
      const id = String(touch.identifier)

      holdTouchesRef.current =
        holdTouchesRef.current.filter(itr => itr != id)
    }

    setLastCanvasesUpdatedAt(new Date().getTime())
  }, [])

  const onCompleted = useCallback((identifier: string) => {
    mouseCanvasesRef.current =
      mouseCanvasesRef.current.filter(itr => itr[1] != identifier)
    touchCanvasesRef.current =
      touchCanvasesRef.current.filter(itr => itr[1] != identifier)
    setLastCanvasesUpdatedAt(new Date().getTime())
  }, [])

  useEffect(() => {
    const node =
      rootRef.current ? ReactDOM.findDOMNode(rootRef.current) : undefined

    if (node) {
      node.addEventListener('touchstart', touchStart, { passive: false, })
      node.addEventListener('touchend', touchEnd, { passive: false, })
      node.addEventListener('touchcancel', touchEnd, { passive: false, })
    }

    return () => {
      if (node) {
        node.removeEventListener('touchstart', touchStart)
        node.removeEventListener('touchend', touchEnd)
        node.removeEventListener('touchcancel', touchEnd)
      }
    }
  }, [rootRef, rootRef.current, touchStart, touchEnd])

  return React.createElement(props.as, {
    ref: rootRef,
    style: style,
    onMouseDown: mouseDown,
    onMouseUp: mouseRelease,
    onMouseLeave: mouseRelease,
  }, [
    props.children,
    [...mouseCanvasesRef.current, ...touchCanvasesRef.current].map(canvas => {
      return <RippleEffectCanvas
        key={`${canvas.keyPrefix}-${canvas.id}`}
        identifier={canvas.id}
        rootRef={rootRef}
        position={canvas.position}
        theme={props.theme}
        isRootReleased={
          canvas.type == 'mouse' ?
            rootReleased :
            !(holdTouchesRef.current.includes(canvas.id))
        }
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
