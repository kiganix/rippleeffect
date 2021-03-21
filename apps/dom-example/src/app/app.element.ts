import './app.element.css';
import { DefaultTheme, createRippleElement, Theme } from '@rippleeffect/dom'
import { Rgba, DefaultColor } from '@rippleeffect/canvas'

const myTheme: Theme = {
  ...DefaultTheme,
  rippleColor: {
    ...DefaultColor,
  }
}

export class AppElement extends HTMLElement {
  public static observedAttributes = [];

  connectedCallback() {
    const button = createRippleElement('div', 'Hello World!', myTheme)
    button.style.backgroundColor = '#eee'
    button.style.borderRadius = '4px'
    button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, .25)'
    button.style.paddingLeft = '24px'
    button.style.paddingRight = '24px'
    button.style.paddingTop = '8px'
    button.style.paddingBottom = '8px'
    this.append(button)
  }

}
customElements.define('myapp-root', AppElement);
