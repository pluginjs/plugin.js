import { query } from '@pluginjs/dom'
import Swipe from '@pluginjs/swipe'

const element = query('#center .swipe')
Swipe.of(element, {
  /** options **/
  desktopColumn: 2,
  active: 1,
  gutter: 20,
  center: true,
  arrows: {
    theme: 'light'
  }
})
