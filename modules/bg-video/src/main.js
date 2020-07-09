import { addClass, removeClass } from '@pluginjs/classes'
import Video from '@pluginjs/video'
import { setStyle } from '@pluginjs/styled'
import { append, parseHTML } from '@pluginjs/dom'
import { isString, isIE, isIE11 } from '@pluginjs/is'
import {
  eventable,
  register,
  stateable,
  styleable,
  optionable
} from '@pluginjs/decorator'
import {
  classes as CLASSES,
  defaults as DEFAULTS,
  dependencies as DEPENDENCIES,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE
} from './constant'

@styleable(CLASSES)
@eventable(EVENTS)
@optionable(DEFAULTS, true)
@stateable()
@register(NAMESPACE, {
  methods: METHODS,
  dependencies: DEPENDENCIES
})
class BgVideo extends Video {
  constructor(element, options = {}) {
    super(element, options)
  }

  initVideo() {
    this.$video = parseHTML(`<div class="${this.classes.NAMESPACE}"></div>`)

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.$video)
    }

    addClass(this.classes.WRAP, this.element)
    append(this.$video, this.element)

    this.initOverlay()
  }

  initOverlay() {
    if (this.options.overlay) {
      this.$overlay = parseHTML(`<div class="${this.classes.OVERLAY}"></div>`)

      if (isString(this.options.overlay)) {
        setStyle('background', this.options.overlay, this.$overlay)
      }
      append(this.$overlay, this.$video)
    }
  }

  destroy() {
    if (this.is('initialized')) {
      if (this.options.overlay) {
        if(isIE()||isIE11()) {
          this.$overlay.removeNode(true);
        } else {
          this.$overlay.remove()
        }
      }

      removeClass(this.classes.WRAP, this.element)
    }

    super.destroy()

    if(isIE()||isIE11()) {
      this.$video.removeNode(true);
    } else {
      this.$video.remove()
    }
  }
}

export default BgVideo
