export const namespace = 'dynamicNumber'

export const events = {
  READY: 'ready',
  START: 'start',
  STOP: 'stop',
  COMPLETE: 'complete',
  PAUSE: 'pause',
  RESET: 'reset',
  RESUME: 'resume',
  RESTART: 'restart',
  UPDATE: 'update',
  DESTROY: 'destroy'
}

export const methods = [
  'start',
  'stop',
  'finish',
  'reset',
  'destroy',
  'go',
  'pause',
  'resume',
  'restart',
  'reset',
  'update'
]

export const defaults = {
  from: 0,
  to: 100,
  delay: 0,
  duration: 2000,
  loop: false,
  easing: x => x, // 'ease', 'linear', 'ease-in', 'ease-out'
  autoplay: false,
  direction: 'normal', // reverse, alternate
  format(value, options) {
    const decimal = String(options.to).split('.')[1]

    if (decimal) {
      return value.toFixed(decimal.length)
    }

    return value.toFixed(0)
  }
}
