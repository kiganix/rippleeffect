import { RippleEffect } from '@rippleeffect/react-dom'
import { Theme, DefaultTheme, Options, DefaultOptions } from '@rippleeffect/dom'
import { DefaultColor } from '@rippleeffect/canvas'
import { NextPageContext } from "next";
import { useMemo, useState } from 'react';

const myTheme: Theme = {
  ...DefaultTheme,
  rippleColor: {
    ...DefaultColor,
  }
}

export default function IndexPage(context: NextPageContext) {
  const [releases, setReleases] = useState<boolean[]>([])

  const myOptions: Options = useMemo(() => {
    return {
      ...DefaultOptions,
      theme: myTheme,
      onReleased: (isInterrupted) => {
        setReleases([...releases, isInterrupted])
      }
    }
  }, [myTheme, releases, setReleases])

  return <div>
    <RippleEffect
      as="div"
      options={myOptions}
      style={{
        backgroundColor: '#eee',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, .25)',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingTop: '8px',
        paddingBottom: '8px',
        userSelect: 'none',
      }}>
      <span>Hello World!</span>
    </RippleEffect>
    {releases.map(itr => <div>isInterrupted: {`${itr}`}</div>)}
  </div>
}
