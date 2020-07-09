import Component from '@pluginjs/component'
import { compose } from '@pluginjs/utils'
import { setStyle, getStyle, getWidth } from '@pluginjs/styled'
import { parent } from '@pluginjs/dom'
import { bindEvent, removeEvent } from '@pluginjs/events'
import { eventable, register, stateable, optionable } from '@pluginjs/decorator'
import {
  defaults as DEFAULTS,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE
} from './constant'
import anime from 'animejs'

@eventable(EVENTS)
@stateable()
@optionable(DEFAULTS, true)
@register(NAMESPACE, {
  methods: METHODS
})
class AdaptText extends Component {
  constructor(element, options = {}) {
    super(element)
    this.setupOptions(options)
    const display = getStyle('display', this.element)
    this.inline = display === 'inline' || Boolean(display === 'inline-block')
    this.width = this.getWidth()

    this.setupStates()
    this.initialize()
  }

  initialize() {
    const lineHeight = getStyle('lineHeight', this.element)
    if (lineHeight.includes('px')) {
      setStyle(
        {
          lineHeight:
            parseInt(lineHeight, 10) /
            parseInt(getStyle('fontSize', this.element), 10)
        },
        this.element
      )
    }

    this.resize()

    if (this.options.scrollable) {
      this.scrollOnHover()
    }

    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }

  getWidth() {
    if (this.inline) {
      return compose(
        getWidth,
        parent
      )(this.element)
    }
    return getWidth(this.element)
  }

  scrollOnHover() {
    /* eslint consistent-return: "off" */
    const mouseenterHandle = () => {
      if (this.is('disabled')) {
        return
      }
      const distance = this.element.scrollWidth - this.width

      if (distance > 0) {
        const scrollSpeed =
          Math.sqrt(distance / this.width) * this.options.scrollSpeed

        setStyle('cursor', 'e-resize', this.element)
        anime.remove(this.element)
        anime({
          targets: this.element,
          textIndent: -distance,
          duration: scrollSpeed,
          easing: 'linear',
          complete: () =>
            setStyle(
              {
                cursor: 'text',
                textOverflow: ''
              },
              this.element
            )
        })
      }
    }
    const mouseleaveHandle = () => {
      if (this.is('disabled')) {
        return
      }
      anime.remove(this.element)
      anime({
        targets: this.element,
        textIndent: 0,
        duration: this.options.scrollResetSpeed,
        easing: 'linear',
        complete: () => setStyle('textOverflow', 'ellipsis', this.element)
      })
    }
    compose(
      bindEvent(this.eventName('mouseleave'), mouseleaveHandle),
      bindEvent(this.eventName('mouseenter'), mouseenterHandle)
    )(this.element)
    setStyle(
      {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },
      this.element
    )
  }

  resize() {
    if (this.is('disabled')) {
      return
    }

    this.width = this.getWidth()
    if (this.width === 0) {
      return
    }

    setStyle(
      'fontSize',
      `${Math.floor(
        Math.max(
          Math.min(
            this.width / this.options.ratio,
            parseFloat(this.options.max)
          ),
          parseFloat(this.options.min)
        )
      )}px`,
      this.element
    )
  }

  enable() {
    if (this.is('disabled')) {
      this.leave('disabled')
    }
    this.resize()

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
      setStyle(
        {
          fontSize: '',
          lineHeight: ''
        },
        this.element
      )

      if (this.options.scrollable) {
        setStyle(
          {
            overflow: '',
            textOverflow: '',
            whiteSpace: '',
            cursor: '',
            textIndent: ''
          },
          this.element
        )
      }

      removeEvent(this.eventName(), this.element)
      this.leave('initialized')
    }
    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }

  static resize() {
    const instances = this.getInstances()

    instances.forEach(instance => {
      if (instance.options.resize) {
        instance.resize()
      }
    })
  }
}

export default AdaptText
