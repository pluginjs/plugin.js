import { html as render, query } from '@pluginjs/dom'
import html from './index.html'
import AdaptText from '@pluginjs/adapt-text'

const element = query('.adapt-text', render(html, query('#scrollable')))
AdaptText.of(element, {
  /** options **/
})
