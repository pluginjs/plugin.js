import { queryAll } from '@pluginjs/dom'
import ScrollProgress from '@pluginjs/scroll-progress'

const elements = queryAll('#default .content')
elements.forEach(el =>
  ScrollProgress.of(el, {
    size: 10
  })
)
// ScrollProgress.of(document.body, { custom: false })
