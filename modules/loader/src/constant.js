export const namespace = 'loader'

export const events = {
  READY: 'ready',
  DESTROY: 'destroy',
  SHOW: 'show',
  HIDE: 'hide'
}

export const classes = {
  NAMESPACE: 'pj-loader',
  LOADER: '{namespace}',
  THEME: '{namespace}--{theme}',
  SHOW: '{namespace}-show',
  SIZE: '{namespace}-{size}',
  TEXT: '{namespace}-text',
  MASK: '{namespace}-mask'
}

export const methods = ['destroy', 'show', 'hide', 'toggle']

export const defaults = {
  theme: 'circle', // circle, rolling, snake, ripple, dot, ring, clock, flip, windmill
  size: null, // sm, lg
  text: null,
  background: null,
  color: null
}
