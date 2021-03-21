import { RippleEffect } from '@rippleeffect/react-dom'
import { Theme, DefaultTheme } from '@rippleeffect/dom'
import { DefaultColor } from '@rippleeffect/canvas'
import { NextPageContext } from "next";

const theme: Theme = {
  ...DefaultTheme,
  rippleColor: {
    ...DefaultColor,
  }
}

export default function IndexPage(context: NextPageContext) {
  return <div>
    <RippleEffect
      as="div"
      theme={theme}
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
  </div>
}
