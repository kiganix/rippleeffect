import React, { ReactElement, ReactInstance, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Theme,
  resolvePosition,
  Options,
  spreadTouchEvent,
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
  options: Options,
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

  const isTouch = useCallback((id: string) => {
    return holdTouchesRef.current.includes(id)
  }, [holdTouchesRef, holdTouchesRef.current])

  const style = useMemo(() => {
    return {
      ...(props.style ? props.style : {}),
      display: props.options.theme.display,
      position: props.options.theme.position,
      overflow: props.options.theme.overflow,
      cursor: props.options.theme.cursor,
      WebkitTapHighlightColor: props.options.theme.webkitTapHighlightColor,
    }
  }, [props.options.theme, props.style])

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

  const mouseUp = useCallback((e: MouseEvent) => {
    if (!rootReleased && props.options.onReleased) {
      props.options.onReleased(false)
    }
    setRootReleased(true)
  }, [rootReleased])

  const mouseLeave = useCallback((e: MouseEvent) => {
    if (!rootReleased && props.options.onReleased) {
      props.options.onReleased(true)
    }
    setRootReleased(true)
  }, [rootReleased])

  const touchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()

    const node =
      rootRef.current ? ReactDOM.findDOMNode(rootRef.current) : undefined

    if (node instanceof Element) {
      spreadTouchEvent(e, (touch) => {
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
      })
    } else {
      throw new Error('Illegal element type.')
    }
  }, [])

  const touchRelease = useCallback((isInterrupted: boolean, e: TouchEvent) => {
    e.preventDefault()

    spreadTouchEvent(e, (touch) => {
      const id = String(touch.identifier)

      if (isTouch(id) && props.options.onReleased) {
        props.options.onReleased(isInterrupted)
      }

      holdTouchesRef.current =
        holdTouchesRef.current.filter(itr => itr != id)
    })

    setLastCanvasesUpdatedAt(new Date().getTime())
  }, [props.options.onReleased])

  const touchEnd = useCallback((e: TouchEvent) => {
    touchRelease(false, e)
  }, [touchRelease])
  const touchCancel = useCallback((e: TouchEvent) => {
    touchRelease(true, e)
  }, [touchRelease])

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
      node.addEventListener('touchcancel', touchCancel, { passive: false, })
    }

    return () => {
      if (node) {
        node.removeEventListener('touchstart', touchStart)
        node.removeEventListener('touchend', touchEnd)
        node.removeEventListener('touchcancel', touchCancel)
      }
    }
  }, [rootRef, rootRef.current, touchStart, touchEnd, touchCancel])

  return React.createElement(props.as, {
    ref: rootRef,
    style: style,
    onMouseDown: mouseDown,
    onMouseUp: mouseUp,
    onMouseLeave: mouseLeave,
  }, [
    props.children,
    [...mouseCanvasesRef.current, ...touchCanvasesRef.current].map(canvas => {
      return <RippleEffectCanvas
        key={`${canvas.keyPrefix}-${canvas.id}`}
        identifier={canvas.id}
        rootRef={rootRef}
        position={canvas.position}
        theme={props.options.theme}
        isRootReleased={
          canvas.type == 'mouse' ?
            rootReleased :
            !isTouch(canvas.id)
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
