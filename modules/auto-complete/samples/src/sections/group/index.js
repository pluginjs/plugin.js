import { query } from '@pluginjs/dom'
import AutoComplete from '@pluginjs/auto-complete'
import { continents, countries } from 'countries-list'

const source = Object.values(countries).map(country => {
  return {
    name: country.name,
    continent: country.continent
  }
})

const element = query('#group .example')
AutoComplete.of(element, {
  source,
  group: 'continent',
  groupLabel(group) {
    return group in continents ? continents[group] : 'Unknown'
  },
  itemLabel(item) {
    return item.name
  },
  itemValue(item) {
    return item.name
  }
})
