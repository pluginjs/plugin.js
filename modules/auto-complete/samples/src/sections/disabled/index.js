import { query } from '@pluginjs/dom'
import AutoComplete from '@pluginjs/auto-complete'

const data = [
  'JAVA',
  'Java Script',
  'Go',
  'Swift',
  'C++',
  '易语言',
  'C#',
  'Python',
  'Ruby'
]

const element = query('#disabled .input')
AutoComplete.of(element, {
  data,
  disabled: true
})
