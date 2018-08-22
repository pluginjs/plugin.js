import { queryAll } from '@pluginjs/dom'
import Arrows from '@pluginjs/arrows'

const elements = queryAll('#shadow .example')

elements.forEach(element => Arrows.of(element, {}))
