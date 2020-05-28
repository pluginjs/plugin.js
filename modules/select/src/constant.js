import { search } from '@pluginjs/match'

export const namespace = 'select'

export const events = {
  READY: 'ready',
  ENABLE: 'enable',
  DISABLE: 'disable',
  DESTROY: 'destroy',
  SELECT: 'select',
  UNSELECT: 'unselect',
  CHANGE: 'change',
  HIDE: 'hide',
  HIDED: 'hided',
  SHOW: 'show',
  SHOWN: 'shown',
  CLEAR: 'clear',
  FILTER: 'filter'
}

export const classes = {
  NAMESPACE: `pj-${namespace}`,
  ELEMENT: '{namespace}-element',
  TRIGGER: '{namespace}-trigger pj-input',
  LABEL: '{namespace}-label',
  WRAP: '{namespace}',
  SHOW: '{namespace}-show',
  DROPDOWN: '{namespace}-dropdown',
  GROUP: '{namespace}-group',
  GROUPLABEL: '{namespace}-group-label',
  OPTION: '{namespace}-option pj-dropdown-item',
  OPTIONDISABLED: '{namespace}-option-disabled pj-dropdown-item-disabled',
  SELECTED: '{namespace}-selected',
  DISABLED: '{namespace}-disabled',
  CLEARABLE: '{namespace}-clearable',
  CLEAR: '{namespace}-clear',
  FILTERABLE: '{namespace}-filterable',
  FILTER: '{namespace}-filter',
  NOTFOUND: '{namespace}-not-found',
  LOADING: '{namespace}-loading'
}

export const methods = [
  'select',
  'unselect',
  'set',
  'get',
  'val',
  'clear',
  'enable',
  'disable',
  'destroy'
]

export const defaults = {
  theme: null,
  source: null,
  placeholder: true,
  filterable: false,
  allSelectTriggerChange: false,
  filter(option, query) {
    return search(query, option.label, {
      diacritics: false,
      punctuation: false,
      case: false,
      whitespaces: false,
      boundaries: false
    })
  },
  keyboard: true,
  clearable: false,
  dropdown: {
    placement: 'bottom-start' // top
  },
  optionLabel(option) {
    return option.label
  },
  templates: {
    label() {
      return '<div class="{classes.LABEL}">{placeholder}</div>'
    },
    group() {
      return '<div class="{classes.GROUP}"><div class="{classes.GROUPLABEL}">{group.label}</div></div>'
    },
    option() {
      return '<div class="{classes.OPTION}" data-value="{option.value}">{option.label}</div>'
    }
  },
  parse(value) {
    return value
  },
  process(value) {
    return value
  }
}

export const translations = {
  en: {
    placeholderText: 'Please select',
    loadingText: 'loading..',
    notFoundText: 'No results found'
  },
  zh: {
    placeholderText: '请选择',
    loadingText: '加载中..',
    notFoundText: '无匹配数据'
  }
}

export const dependencies = ['dropdown']
