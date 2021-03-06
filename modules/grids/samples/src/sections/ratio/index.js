import { query } from '@pluginjs/dom'
import Grids from '@pluginjs/grids'

const element = query('#ratio .grids')
Grids.of(element, {
  itemSelector: '.grids-item',
  imgSelector: '.grids-image',
  aspectRatio: '3:2',
  gutter: 20
})
