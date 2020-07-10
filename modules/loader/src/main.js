import Component from '@pluginjs/component'
import { addClass, removeClass } from '@pluginjs/classes'
import { append, appendTo } from '@pluginjs/dom'
import { isIE, isIE11 } from '@pluginjs/is'
import { setStyle } from '@pluginjs/styled'
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

@themeable()
@styleable(CLASSES)
@eventable(EVENTS)
@stateable()
@optionable(DEFAULTS, true)
@register(NAMESPACE, {
  methods: METHODS
})
class Loader extends Component {
  constructor(element, options = {}) {
    super(element)

    this.setupOptions(options)
    this.setupClasses()
    this.setupStates()
    this.initialize()
  }

  initialize() {
    this.$mask = appendTo(
      `<div class="${this.classes.MASK}"></div>`,
      this.element
    )

    this.$loader = appendTo(
      `<div class="${this.classes.LOADER}"></div>`,
      this.$mask
    )

    if (this.options.size) {
      addClass(
        this.getClass(this.classes.SIZE, 'size', this.options.size),
        this.$loader
      )
    }

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.$loader)
    }

    if (this.options.background) {
      setStyle('background', this.options.background, this.$mask)
    }

    if (this.options.color) {
      setStyle('color', this.options.color, this.$loader)
    }

    if (this.options.text) {
      this.$text = append(
        `<div class="${this.classes.TEXT}">${this.options.text}</div>`,
        this.$mask
      )
    }

    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }

  destroy() {
    if (this.is('initialized')) {
      if(isIE() || isIE11()) {
        if (this.options.text) 
        this.$text.removeNode(true);

        this.$loader.removeNode(true);
        this.$mask.removeNode(true);
      } else {
        if (this.options.text) 
        this.$text.remove()
        
        this.$loader.remove()
        this.$mask.remove()
      }

      this.leave('initialized')
    }

    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }

  toggle() {
    if (this.is('shown')) {
      this.hide()
    } else {
      this.show()
    }
  }

  show() {
    if (!this.is('shown')) {
      addClass(this.classes.SHOW, this.$mask)
      this.enter('shown')
    }
    this.trigger(EVENTS.SHOW)
  }

  hide() {
    if (this.is('shown')) {
      removeClass(this.classes.SHOW, this.$mask)
      this.leave('shown')
    }
    this.trigger(EVENTS.HIDE)
  }
}

export default Loader
