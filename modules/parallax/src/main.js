/* eslint-disable no-console */
import Component from '@pluginjs/component'
import templateEngine from '@pluginjs/template'
import { parseDataOptions } from '@pluginjs/utils'
import { addClass, hasClass } from '@pluginjs/classes'
import { closest, wrap, parentWith, parseHTML } from '@pluginjs/dom'
import { isString, isNan, isPlainObject } from '@pluginjs/is'
import { bindEvent, removeEvent } from '@pluginjs/events'
import { setStyle, getOffset } from '@pluginjs/styled'
import Pj from '@pluginjs/factory'
import {
  eventable,
  register,
  stateable,
  styleable,
  themeable,
  optionable
} from '@pluginjs/decorator'
import {
  classes as CLASSES,
  defaults as DEFAULTS,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE
} from './constant'

import Viewport from '@pluginjs/viewport'
import Loader from '@pluginjs/loader'
import Breakpoints from '@pluginjs/breakpoints'

import Image from './modules/image'
import Background from './modules/background'
import Video from './modules/video'

@themeable()
@styleable(CLASSES)
@eventable(EVENTS)
@stateable()
@optionable(DEFAULTS, true)
@register(NAMESPACE, {
  methods: METHODS
})
class Parallax extends Component {
  constructor(element, options = {}) {
    super(element)
    this.setupOptions(options)
    this.setupClasses()

    addClass(this.classes.NAMESPACE, this.element)

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.element)
    }

    this.setupStates()
    this.initialize()
  }

  initialize() {
    this.initContainer()
    this.initViewport()

    if (this.options.loader) {
      this.initLoader()
    }

    this.initSpeed()
    this.initBreakpoints()
    this.direction = this.options.direction || 'vertical'
    this.type = this.options.type || 'scroll'

    if (this.options.mode) {
      this.initMode()
    }

    this.effect()
    this.bind()
    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }

  initContainer() {
    this.container = closest(`.${this.classes.CONTAINER}`, this.element)
    if (!this.container) {
      if (this.options.container) {
        addClass(
          this.classes.CONTAINER,
          closest(this.options.container, this.element)
        )
      } else {
        wrap(`<div class="${this.classes.CONTAINER}"></div>`, this.element)
      }

      this.container = parentWith(
        hasClass(this.classes.CONTAINER),
        this.element
      )
    }

    this.containerOptions = this.container.dataset
      ? parseDataOptions(this.container.dataset)
      : {}

    if (this.containerOptions.height) {
      this.container.style.height = this.setContainerHeight()
    }
  }

  setContainerHeight() {
    const attrHeight = this.containerOptions.height

    if (!isNan(Number(attrHeight))) {
      return `${attrHeight}px`
    }

    const suffix = attrHeight.substr(attrHeight.length - 2, attrHeight.length)

    if (suffix === 'px' || suffix === 'vh') {
      return attrHeight
    }

    throw new Error(
      `Invalid height suffix, expected "px" or "vh" but got: ${suffix}`
    )
  }

  initLoader() {
    if (isPlainObject(this.options.loader)) {
      this.loader = Loader.of(this.container, this.options.loader)
    } else {
      this.loader = Loader.of(this.container, {
        theme: 'ring',
        color: '#000000',
        size: 'lg'
      })
    }

    this.loader.show()
  }

  initSpeed() {
    this.speed = this.options.speed

    this.ensureSpeed()

    return this.speed
  }

  ensureSpeed() {
    if (isString(this.speed)) {
      const attrSpeedNumber = Number(this.speed)
      if (isNan(attrSpeedNumber)) {
        console.error(
          `Invalid type for attribute speed for element: ${this.element}`
        )
        throw new Error('Invalid type for attribute speed')
      } else {
        this.speed = attrSpeedNumber
      }
    }
  }

  initBreakpoints() {
    Breakpoints.init()

    const screens = Breakpoints.all()
    this.initScreenOptions(screens)
    const that = this
    const currentName = Breakpoints.current().name

    if (this.screenOptions[currentName]) {
      Object.keys(this.screenOptions[currentName]).forEach(key => {
        this[key] = this.screenOptions[currentName][key]
      })
    }

    Breakpoints.on('change', function() {
      if (that.screenOptions[this.current.name]) {
        Object.keys(that.screenOptions[this.current.name]).forEach(key => {
          that[key] = that.screenOptions[this.current.name][key]
        })
      } else {
        that.reset()
      }
    })
  }

  reset() {
    this.speed = this.options.speed
  }

  initScreenOptions(screens) {
    this.screenOptions = {}
    Object.keys(this.options).forEach(key => {
      screens.forEach(screen => {
        const screenFirstUpper =
          screen.substring(0, 1).toUpperCase() + screen.substring(1)
        if (key.endsWith(screenFirstUpper)) {
          this.screenOptions[screen] = {}
          this.screenOptions[screen][
            key.slice(0, key.indexOf(screenFirstUpper))
          ] = this.options[key]
        }
      })
    })
  }

  initMode() {
    if (this.options.video) {
      this.mode = new Video(this)
      return
    }

    switch (this.options.mode) {
      case 'background':
        this.mode = new Background(this)
        break
      case 'image':
        this.mode = new Image(this)
        break
      default:
        break
    }
  }

  initViewport() {
    this.viewport = Viewport.of(this.container)
  }

  createElement(type) {
    const template = this.options.templates[type]
    let html = ''

    html = templateEngine.render(template.call(this), {
      classes: this.classes
    })

    return parseHTML(html)
  }

  effect() {
    switch (this.type) {
      case 'opacity':
        this.opacityHandle()
        break
      case 'scale':
        this.scaleHandle()
        break
      default:
        this.scrollHandle()
        break
    }
  }

  scrollHandle() {
    this.updateVars()

    if (Math.abs(this.speed) > 1) {
      this.speed = 0.5
    }

    const style = {
      'object-fit': 'cover'
    }

    if (this.direction === 'vertical') {
      style.height = this.imgHeight
      style.width = this.imgWidth
      style.left = 0

      const distanceFromTop =
        getOffset(this.container).top - this.getScrollTop()
      const imageDiff = this.imgHeight - this.containerHeight
      const percent =
        1 -
        (distanceFromTop + this.containerHeight) /
          (this.windowHeight + this.containerHeight)
      const scrollDistance =
        this.windowHeight * (1 - this.speed) * 2 - imageDiff
      const fromY = this.windowHeight * (1 - this.speed)
      this.distance = (percent * scrollDistance - fromY).toFixed(2)

      this.transform = `translate3d(0, ${this.distance}px, 0)`
    } else {
      style.width = `${this.containerWidth * (1 + Math.abs(this.speed) * 2)}px`
      style.height = this.containerHeight
      style.top = 0
      this.distance =
        -this.containerWidth *
        Math.abs(this.speed) *
        (this.containerBottom / (this.windowHeight + this.containerHeight))
      this.transform = `translate3d(${this.distance}px, 0, 0)`
    }

    style.transform = this.transform

    setStyle(style, this.mode.element)
  }

  opacityHandle() {
    this.updateVars()

    if (Math.abs(this.speed) > 1) {
      this.speed = 0.6
    }

    const offset =
      this.containerBottom / (this.windowHeight + this.containerHeight)

    this.transform = 'translate3d(0, 0, 0)'

    const style = {
      transform: this.transform,
      opacity: 1 - offset * Math.abs(this.speed),
      height: '100%',
      width: '100%'
    }

    setStyle(style, this.element)
  }

  scaleHandle() {
    this.updateVars()

    if (Math.abs(this.speed) > 1) {
      this.speed = 0.6
    }

    const offset =
      1.2 - this.containerBottom / (this.windowHeight + this.containerHeight)

    this.transform = `scale(${1 + offset * Math.abs(this.speed)})`

    setStyle(
      {
        transform: this.transform,
        height: '100%',
        top: '0',
        left: '0'
      },
      this.element
    )
  }

  updateVars() {
    this.windowWidth = window.innerWidth || document.documentElement.clientWidth
    this.windowHeight =
      window.innerHeight || document.documentElement.clientHeight
    const rect = this.container.getBoundingClientRect()
    this.containerHeight = rect.height
    this.containerWidth = rect.width
    this.containerBottom = rect.bottom
    this.imgWidth = this.containerWidth
    this.imgHeight = Math.floor(
      this.windowHeight -
        (this.windowHeight - this.containerHeight) * this.speed
    )
  }

  getScrollTop() {
    const scrollTop =
      document.documentElement.scrollTop ||
      window.pageYOffset ||
      document.body.scrollTop
    return scrollTop
  }

  bind() {
    bindEvent(
      'viewport:enter',
      () => {
        Pj.emitter.on(this.eventNameWithId('scroll'), this.effect.bind(this))
        this.trigger(EVENTS.ENTER)
      },
      this.container
    )

    bindEvent(
      'viewport:leave',
      () => {
        Pj.emitter.off(this.eventNameWithId('scroll'))
        this.trigger(EVENTS.LEAVE)
      },
      this.container
    )
  }

  unbind() {
    removeEvent('viewport:enter', this.container)
    removeEvent('viewport:leave', this.container)
    Pj.emitter.off(this.eventNameWithId('scroll'))
  }

  resize() {
    this.effect()
  }

  setSpeed(speed) {
    this.speed = speed
  }

  getSpeed() {
    return this.speed
  }

  enable() {
    if (this.is('disabled')) {
      this.leave('disabled')
    }
    this.trigger(EVENTS.ENABLE)
  }

  disable() {
    if (!this.is('disabled')) {
      this.enter('disabled')
    }

    this.trigger(EVENTS.DISABLE)
  }

  destroy() {
    if (this.is('initialized')) {
      this.unbind()
      this.leave('initialized')
    }

    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }
}

export default Parallax
