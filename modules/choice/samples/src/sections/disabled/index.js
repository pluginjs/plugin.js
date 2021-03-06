import { query } from '@pluginjs/dom'
import Choice from '@pluginjs/choice'

const element = query('#disabled .blank')
Choice.of(element, {
  data: {
    on: {
      label: 'on'
    },
    off: {
      label: 'off'
    },
    default: {
      label: 'default'
    }
  },
  multiple: false,
  disabled: true
})
