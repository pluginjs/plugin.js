import { query } from '@pluginjs/dom'
import Infinite from '@pluginjs/infinite'
import { loremIpsum } from 'lorem-ipsum'

const element = query('#button .infinite')
Infinite.of(element, {
  trigger: 'button',
  load(count, resolve) {
    setTimeout(() => {
      resolve(
        loremIpsum({
          count: 5,
          format: 'html',
          units: 'paragraph'
        })
      )
    }, 1000)
  },
  checkEnd(count) {
    return count === 2
  }
})
