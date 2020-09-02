import { query } from '@pluginjs/dom'
import Grids from '@pluginjs/grids'

const element = query('#gutter .grids')
Grids.of(element, {
  itemSelector: '.grids-item',
  imgSelector: '.grids-image',
  gutter: 20
})
