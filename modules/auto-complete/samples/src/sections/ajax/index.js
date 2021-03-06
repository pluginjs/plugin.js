import { countries } from 'countries-list'
import { query } from '@pluginjs/dom'
import AutoComplete from '@pluginjs/auto-complete'

const data = Object.values(countries).map(country => {
  return country.name
})

const element = query('#ajax .example')

AutoComplete.of(element, {
  source(query, resolve) {
    setTimeout(() => {
      resolve(data)
    }, 300)
  }
})
