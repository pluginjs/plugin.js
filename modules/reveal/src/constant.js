export const namespace = 'reveal'

export const events = {
  READY: 'ready',
  DESTROY: 'destroy',
  ENTER: 'enter',
  LEAVE: 'leave',
  SHOW: 'show',
  DISABLE: 'disable',
  ENABLE: 'enable',
  END: 'end'
}

export const classes = {
  NAMESPACE: `pj-${namespace}`,
  ANIMATED: '{namespace}-show',
  DISABLED: '{namespace}-disabled'
}

export const methods = ['destroy', 'enable', 'disable', 'isVisible']

export const defaults = {
  container: null,
  animation: 'fadeIn',
  duration: 600,
  easing: 'ease',
  delay: 0,
  once: true,
  order: 1,
  anchor: '',
  offset: '0px', // also can have values similar to the CSS margin property, ["10px 20px 30px 40px"](top, right, bottom, left)
  threshold: 0 // Either a single number or an array of numbers  [0, 0.25, 0.5, 0.75, 1]
}
