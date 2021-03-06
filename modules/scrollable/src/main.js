import Component from '@pluginjs/component'
import { isString, isNumber, isPercentage, isDomNode } from '@pluginjs/is'
import easing from '@pluginjs/easing'
import SCROLLBAR from '@pluginjs/scrollbar'
import {
  convertFloatToPercentage,
  convertPercentageToFloat,
  getTime,
  compose
} from '@pluginjs/utils'
import { addClass, removeClass } from '@pluginjs/classes'
import { setStyle, getStyle, getHeight, getWidth } from '@pluginjs/styled'
import { bindEvent, removeEvent } from '@pluginjs/events'
import { children, append, query, wrap, unwrap, parent } from '@pluginjs/dom'
import {
  eventable,
  optionable,
  register,
  stateable,
  styleable,
  themeable
} from '@pluginjs/decorator'
import {
  classes as CLASSES,
  defaults as DEFAULTS,
  dependencies as DEPENDENCIES,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE
} from './constant'
import * as util from './util'

@themeable()
@styleable(CLASSES)
@eventable(EVENTS)
@stateable()
@optionable(DEFAULTS, true)
@register(NAMESPACE, {
  methods: METHODS,
  dependencies: DEPENDENCIES
})
class Scrollable extends Component {
  constructor(element, options = {}) {
    super(element)

    this.setupOptions(options)
    this.setupClasses()

    this.attributes = {
      vertical: {
        axis: 'Y',
        overflow: 'overflow-y',

        scroll: 'scrollTop',
        scrollLength: 'scrollHeight',
        pageOffset: 'pageYOffset',

        ffPadding: 'padding-right',

        length: 'height',
        clientLength: 'clientHeight',
        offset: 'offsetHeight',

        crossLength: 'width',
        crossClientLength: 'clientWidth',
        crossOffset: 'offsetWidth'
      },
      horizontal: {
        axis: 'X',
        overflow: 'overflow-x',

        scroll: 'scrollLeft',
        scrollLength: 'scrollWidth',
        pageOffset: 'pageXOffset',

        ffPadding: 'padding-bottom',

        length: 'width',
        clientLength: 'clientWidth',
        offset: 'offsetWidth',

        crossLength: 'height',
        crossClientLength: 'clientHeight',
        crossOffset: 'offsetHeight'
      }
    }

    // Current state information.
    this.privateStates = {}

    // Supported direction
    this.horizontal = null
    this.vertical = null

    this.$bar = []

    // Current timeout
    this._frameId = null
    this.privateTimeoutId = null

    this.easing = easing.get(this.options.easing) || easing.get('ease')

    this.setupStates()
    this.initialize()
  }
  /* eslint-disable complexity */
  initialize() {
    const position = getStyle('position', this.element)
    if (this.options.containerSelector) {
      if (this.options.containerSelector === '>') {
        this.$container = children(this.element)[0]
      } else {
        this.$container = query(this.options.containerSelector, this.element)
      }
      this.$wrap = this.element

      if (position === 'static') {
        setStyle('position', 'relative', this.$wrap)
      }
    } else {
      this.$wrap = wrap('<div></div>', this.element)
      this.$container = this.element
      this.$wrap.style.height =
        getHeight(this.element) >= 0 ? `${getHeight(this.element)}px` : '0px'

      if (position !== 'static') {
        setStyle('position', position, this.$wrap)
      } else {
        setStyle('position', 'relative', this.$wrap)
      }
    }

    if (this.options.contentSelector) {
      if (this.options.contentSelector === '>') {
        this.$content = children(this.$container)[0]
      } else {
        this.$content = query(this.options.contentSelector, this.$container)
      }
    } else {
      wrap('<div></div>', this.$container)
      this.$content = this.$container
      this.$container = parent(this.$content)
    }

    switch (this.options.direction) {
      case 'vertical': {
        this.vertical = true
        break
      }
      case 'horizontal': {
        this.horizontal = true
        break
      }
      case 'both': {
        this.horizontal = true
        this.vertical = true
        break
      }
      case 'auto': {
        const overflowX = getStyle('overflowX', this.element)
        const overflowY = getStyle('overflowY', this.element)

        if (overflowX === 'scroll' || overflowX === 'auto') {
          this.horizontal = true
        }
        if (overflowY === 'scroll' || overflowY === 'auto') {
          this.vertical = true
        }
        break
      }
      default: {
        break
      }
    }

    if (!this.vertical && !this.horizontal) {
      return
    }
    addClass(this.classes.WARP, this.$wrap)
    addClass(this.classes.CONTAINER, this.$container)
    addClass(this.classes.CONTENT, this.$content)

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.$wrap)
    }

    addClass(this.classes.ENABLED, this.$wrap)

    if (this.horizontal) {
      addClass(this.classes.HORIZONTAL, this.$wrap)
      this.initLayout('horizontal')
      this.createBar('horizontal')
    }

    if (this.vertical) {
      addClass(this.classes.VERTICAL, this.$wrap)
      this.initLayout('vertical')
      this.createBar('vertical')
    }

    this.bind()

    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }
  /* eslint-enable complexity */

  resize() {
    if (this.options.responsive) {
      this.update()
    }
  }

  bind() {
    if (!this.horizontal && !this.vertical) {
      return
    }

    const that = this

    bindEvent(
      this.eventName('mouseenter'),
      () => {
        addClass(this.classes.HOVERING, this.$wrap)
        that.enter('hovering')
        that.trigger(EVENTS.HOVER)
      },
      this.$wrap
    )

    bindEvent(
      this.eventName('mouseleave'),
      () => {
        removeClass(this.classes.HOVERING, this.$wrap)

        if (!that.is('hovering')) {
          return
        }
        that.leave('hovering')
        that.trigger(EVENTS.HOVERED)
      },
      this.$wrap
    )

    if (this.options.showOnHover) {
      if (this.options.showOnBarHover) {
        this.$bar.forEach(bar => {
          bindEvent(
            this.selfEventName(EVENTS.HOVER),
            () => {
              if (that.horizontal) {
                that.showBar('horizontal')
              }
              if (that.vertical) {
                that.showBar('vertical')
              }
            },
            bar
          )
          bindEvent(
            this.selfEventName(EVENTS.HOVERED),
            () => {
              if (that.horizontal) {
                that.hideBar('horizontal')
              }
              if (that.vertical) {
                that.hideBar('vertical')
              }
            },
            bar
          )
        })
      } else {
        bindEvent(
          this.selfEventName(EVENTS.HOVER),
          this.showBar.bind(this),
          this.element
        )
        bindEvent(
          this.selfEventName(EVENTS.HOVERED),
          this.hideBar.bind(this),
          this.element
        )
      }
    }

    bindEvent(
      this.eventName(EVENTS.SCROLL),
      () => {
        if (that.horizontal) {
          const oldLeft = that.offsetLeft
          that.offsetLeft = that.getOffset('horizontal')

          if (oldLeft !== that.offsetLeft) {
            that.trigger(
              EVENTS.SCROLL,
              that.getPercentOffset('horizontal'),
              'horizontal'
            )

            if (that.offsetLeft === 0) {
              that.trigger(EVENTS.SCROLLTOP, 'horizontal')
            }
            if (that.offsetLeft === that.getScrollLength('horizontal')) {
              that.trigger(EVENTS.SCROLLEND, 'horizontal')
            }
          }
        }

        if (that.vertical) {
          const oldTop = that.offsetTop

          that.offsetTop = that.getOffset('vertical')

          if (oldTop !== that.offsetTop) {
            that.trigger(
              EVENTS.SCROLL,
              that.getPercentOffset('vertical'),
              'vertical'
            )

            if (that.offsetTop === 0) {
              that.trigger(EVENTS.SCROLLTOP, 'vertical')
            }
            if (that.offsetTop === that.getScrollLength('vertical')) {
              that.trigger(EVENTS.SCROLLEND, 'vertical')
            }
          }
        }
      },
      this.$container
    )

    bindEvent(
      this.selfEventName(EVENTS.SCROLL),
      (e, instance, value, direction) => {
        this.onScroll(value, direction)
      },
      this.element
    )

    this.$bar.forEach(bar => {
      bindEvent(
        'scrollbar:change',
        (e, instance, data) => {
          const value = data
          if (isString(e.target.direction)) {
            that.scrollTo(
              e.target.direction,
              convertFloatToPercentage(value),
              false,
              true
            )
          }
        },
        bar
      )

      bindEvent(
        'scrollbar:drag',
        () => addClass(this.classes.DRAGGING, that.wrap),
        bar
      )

      bindEvent(
        'scrollbar:dragged',
        () => removeClass(this.classes.DRAGGING, this.$wrap),
        bar
      )
    })
  }

  onScroll(value, direction) {
    if (!this.is('scrolling')) {
      this.enter('scrolling')
      addClass(this.classes.SCROLLING, this.$wrap)
    }

    const bar = this.getBarApi(direction)
    bar.moveTo(convertFloatToPercentage(value), false, true)

    clearTimeout(this.privateTimeoutId)
    this.privateTimeoutId = setTimeout(() => {
      removeClass(this.classes.SCROLLING, this.$wrap)
      this.leave('scrolling')
    }, 200)
  }

  unbind() {
    removeEvent(this.eventName(), this.$wrap)
    removeEvent(this.selfEventName(EVENTS.SCROLL), this.element)
    removeEvent(this.selfEventName(EVENTS.HOVER), this.element)
    removeEvent(this.selfEventName(EVENTS.HOVERED), this.element)
    removeEvent(this.eventName(), this.$container)
  }

  initLayout(direction) {
    if (direction === 'vertical') {
      setStyle('height', getHeight(this.$wrap), this.$container)
    } else {
      setStyle('width', getWidth(this.$wrap), this.$container)
    }

    const attributes = this.attributes[direction]
    const container = this.$container

    const parentLength = container.parentNode[attributes.crossClientLength]
    const scrollbarWidth = this.getBrowserScrollbarWidth(direction)

    setStyle(attributes.crossLength, parentLength, this.$content)
    setStyle(
      attributes.crossLength,
      scrollbarWidth + parentLength,
      this.$container
    )

    if (scrollbarWidth === 0 && util.isFFLionScrollbar) {
      setStyle(attributes.ffPadding, 16, this.$container)
    }
  }

  createBar(direction) {
    const options = Object.assign(this.options.scrollbar, {
      direction,
      useCssTransitions: false,
      keyboard: false,
      clickMoveStep: 1
    })
    const $bar = document.createElement('div')

    const api = new SCROLLBAR($bar, options)

    if (this.options.showOnHover) {
      addClass(this.classes.BARHIDE, $bar)
    }

    append($bar, this.$wrap)

    this[`$${direction}`] = $bar
    this[`$${direction}`].api = api

    this.$bar.push($bar)
    this.updateBarHandle(direction)
  }

  getBrowserScrollbarWidth(direction) {
    const attributes = this.attributes[direction]
    if (attributes.scrollbarWidth) {
      return attributes.scrollbarWidth
    }
    const outer = document.createElement('div')
    const outerStyle = outer.style
    outerStyle.position = 'absolute'
    outerStyle.width = '100px'
    outerStyle.height = '100px'
    outerStyle.overflow = 'scroll'
    outerStyle.top = '-9999px'
    document.body.appendChild(outer)
    attributes.scrollbarWidth =
      outer[attributes.offset] - outer[attributes.clientLength]
    document.body.removeChild(outer)
    return attributes.scrollbarWidth
  }

  getOffset(direction) {
    const attributes = this.attributes[direction]
    const container = this.$container

    return container[attributes.pageOffset] || container[attributes.scroll]
  }

  getPercentOffset(direction) {
    return this.getOffset(direction) / this.getScrollLength(direction)
  }

  getContainerLength(direction) {
    return this.$container[this.attributes[direction].clientLength]
  }

  getScrollLength(direction) {
    const scrollLength = this.$content[this.attributes[direction].scrollLength]

    return scrollLength - this.getContainerLength(direction)
  }

  scrollTo(direction, value, trigger, sync) {
    let type = typeof value

    if (type === 'string') {
      if (isPercentage(value)) {
        value =
          convertPercentageToFloat(value) * this.getScrollLength(direction)
      }

      value = parseFloat(value)
      type = 'number'
    }

    if (type !== 'number') {
      return
    }

    this.move(direction, value, trigger, sync)
  }

  scrollBy(direction, value, trigger, sync) {
    let type = typeof value

    if (type === 'string') {
      if (isPercentage(value)) {
        value =
          convertPercentageToFloat(value) * this.getScrollLength(direction)
      }

      value = parseFloat(value)
      type = 'number'
    }

    if (type !== 'number') {
      return
    }

    this.move(direction, this.getOffset(direction) + value, trigger, sync)
  }

  move(direction, value, trigger, sync) {
    if (this[direction] !== true || !isNumber(value)) {
      return
    }

    this.enter('moving')

    if (value < 0) {
      value = 0
    } else if (value > this.getScrollLength(direction)) {
      value = this.getScrollLength(direction)
    }

    const attributes = this.attributes[direction]

    const that = this
    const callback = () => {
      that.leave('moving')
    }

    if (sync) {
      this.$container[attributes.scroll] = value

      if (trigger !== false) {
        this.trigger(
          EVENTS.CHANGE,
          value / this.getScrollLength(direction),
          direction
        )
      }
      callback()
    } else {
      this.enter('animating')

      const startTime = getTime()
      const start = this.getOffset(direction)
      const end = value

      const run = time => {
        let percent = (time - startTime) / that.options.duration

        if (percent > 1) {
          percent = 1
        }

        percent = this.easing(percent)

        const current = parseFloat(start + percent * (end - start), 10)
        that.$container[attributes.scroll] = current

        if (trigger !== false) {
          that.trigger(
            EVENTS.CHANGE,
            value / that.getScrollLength(direction),
            direction
          )
        }

        if (percent === 1) {
          window.cancelAnimationFrame(that._frameId)
          that._frameId = null

          that.leave('animating')
          callback()
        } else {
          that._frameId = window.requestAnimationFrame(run)
        }
      }

      this._frameId = window.requestAnimationFrame(run)
    }
  }

  scrollXto(value, trigger, sync) {
    return this.scrollTo('horizontal', value, trigger, sync)
  }

  scrollYto(value, trigger, sync) {
    return this.scrollTo('vertical', value, trigger, sync)
  }

  scrollXby(value, trigger, sync) {
    return this.scrollBy('horizontal', value, trigger, sync)
  }

  scrollYby(value, trigger, sync) {
    return this.scrollBy('vertical', value, trigger, sync)
  }

  getBar(direction) {
    if (direction && this[`$${direction}`]) {
      return this[`$${direction}`]
    }
    return this.$bar
  }

  getBarApi(direction) {
    return this.getBar(direction).api
  }

  getBarX() {
    return this.getBar('horizontal')
  }

  getBarY() {
    return this.getBar('vertical')
  }

  showBar(direction) {
    const $bar = this.getBar(direction)
    if (isDomNode($bar)) {
      removeClass(this.classes.BARHIDE, $bar)
    } else {
      $bar.map(bar => removeClass(this.classes.BARHIDE, bar))
    }
  }

  hideBar(direction) {
    const $bar = this.getBar(direction)
    if (isDomNode($bar)) {
      addClass(this.classes.BARHIDE, $bar)
    } else {
      $bar.map(bar => addClass(this.classes.BARHIDE, bar))
    }
  }

  updateBarHandle(direction) {
    const api = this.getBarApi(direction)

    if (!api) {
      return
    }

    const containerLength = this.getContainerLength(direction)
    const scrollLength = this.getScrollLength(direction)

    if (scrollLength > 0) {
      if (api.is('disabled')) {
        api.enable()
      }
      api.setHandleLength(
        (api.getBarLength() * containerLength) /
          (scrollLength + containerLength),
        true
      )
    } else {
      api.disable()
    }
  }

  disable() {
    if (!this.is('disabled')) {
      this.enter('disabled')
      addClass(this.classes.DISABLED, this.$wrap)
      removeClass(this.classes.ENABLED, this.$wrap)

      this.unbind()
      this.unStyle()
    }

    this.trigger(EVENTS.DISABLE)
  }

  enable() {
    if (this.is('disabled')) {
      this.leave('disabled')
      addClass(this.classes.ENABLED, this.$wrap)
      removeClass(this.classes.DISABLED, this.$wrap)

      this.bind()
      this.update()
    }

    this.trigger(EVENTS.ENABLE)
  }

  update() {
    if (this.is('disabled')) {
      return
    }
    if (
      this.element.style.visibility === 'hidden' ||
      this.element.style.display === 'none'
    ) {
      return
    }
    if (this.horizontal) {
      this.initLayout('horizontal')
      this.updateBarHandle('horizontal')
    }
    if (this.vertical) {
      this.initLayout('vertical')
      this.updateBarHandle('vertical')
    }
  }

  unStyle() {
    if (this.horizontal) {
      setStyle(
        {
          height: null,
          paddingBottom: null
        },
        this.$container
      )
      setStyle('height', null, this.$content)
    }
    if (this.vertical) {
      setStyle(
        {
          height: null,
          width: null,
          paddingRight: null
        },
        this.$container
      )
      setStyle('width', null, this.$content)
    }
    if (!this.options.containerSelector) {
      setStyle('height', null, this.$wrap)
    }
  }

  destroy() {
    if (this.is('initialized')) {
      compose(
        removeClass(this.classes.VERTICAL),
        removeClass(this.classes.WARP),
        removeClass(this.classes.ENABLED),
        removeClass(this.classes.DISABLED)
      )(this.$wrap)

      if (this.options.theme) {
        removeClass(this.getThemeClass(), this.$wrap)
      }
      this.unStyle()

      if (this.$bar) {
        this.$bar.map(bar => bar.remove())
      }

      this.unbind()

      if (this.options.containerSelector) {
        removeClass(this.classes.CONTAINER, this.$container)
      } else {
        unwrap(this.$container)
      }
      if (!this.options.contentSelector) {
        unwrap(this.$content)
      }
      removeClass(this.classes.CONTENT, this.$content)
      this.leave('initialized')
    }
    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }
}

export default Scrollable
