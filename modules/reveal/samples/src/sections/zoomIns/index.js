import { queryAll } from '@pluginjs/dom'
import Reveal from '@pluginjs/reveal'

const elements = queryAll('#zoomIns .reveal')
elements.forEach(el => Reveal.of(el, {}))
