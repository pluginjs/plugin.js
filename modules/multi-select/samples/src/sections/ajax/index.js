import { query } from '@pluginjs/dom'
import MultiSelect from '@pluginjs/multi-select'

const data = [
  {
    value: 1,
    label: 'Option 1'
  },
  {
    value: 2,
    label: 'Option 2'
  },
  {
    value: 3,
    label: 'Option 3'
  },
  {
    value: 4,
    label: 'Option 4'
  },
  {
    value: 5,
    label: 'Option 5'
  }
]

const element = query('#ajax .example')
MultiSelect.of(element, {
  source(resolve) {
    setTimeout(() => {
      resolve(data)
    }, 300)
  }
})