import Component from '@pluginjs/component'
import { compose } from '@pluginjs/utils'
import { addClass, removeClass } from '@pluginjs/classes'
import { bindEvent, removeEvent } from '@pluginjs/events'
import { queryAll, parseHTML, append } from '@pluginjs/dom'
import Popover from '@pluginjs/popover'
import templateEngine from '@pluginjs/template'
import { isArray } from '@pluginjs/is'
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
  dependencies as DEPENDENCIES,
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
  methods: METHODS,
  dependencies: DEPENDENCIES
})
class Hotspots extends Component {
  constructor(element, options = {}) {
    super(element)

    this.setupOptions(options)
    this.setupClasses()

    this.setupStates()
    this.initialize()
  }

  initialize() {
    addClass(this.classes.CONTAINER, this.element)

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.element)
    }

    this.createHotspots()
    this.$hotspots = queryAll(`.${this.classes.HOTSPOT}`, this.element)
    this.bind()
    this.setupPopover()

    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }

  bind() {
    compose(
      bindEvent(this.eventName('mouseenter'), () => {
        addClass(this.classes.HOVERING, this.element)
        this.enter('hovering')
        this.trigger(EVENTS.HOVER)
      }),
      bindEvent(this.eventName('mouseleave'), () => {
        removeClass(this.classes.HOVERING, this.element)

        if (!this.is('hovering')) {
          return
        }
        this.leave('hovering')
        this.trigger(EVENTS.HOVERED)
      }),
      bindEvent(this.eventName('mouseenter'), `.${this.classes.HOTSPOT}`, e => {
        const $hotspot = e.target
        addClass(this.classes.HOTSPOTHOVERING, $hotspot)

        this.trigger(EVENTS.HOTSPOTHOVER, $hotspot)
      }),
      bindEvent(this.eventName('mouseleave'), `.${this.classes.HOTSPOT}`, e => {
        const $hotspot = e.target
        removeClass(this.classes.HOTSPOTHOVERING, $hotspot)

        this.trigger(EVENTS.HOTSPOTHOVERED, $hotspot)
      })
    )(this.element)
  }

  unbind() {
    removeEvent(this.eventName(), this.element)
  }

  createHotspots() {
    const template = templateEngine.compile(
      this.options.templates.hotspot.call(this)
    )
    const iconTemplate = templateEngine.compile(
      this.options.templates.icon.call(this)
    )
    const textTemplate = templateEngine.compile(
      this.options.templates.text.call(this)
    )
    const dotTemplate = templateEngine.compile(
      this.options.templates.dot.call(this)
    )
    const numberTemplate = templateEngine.compile(
      this.options.templates.number.call(this)
    )

    let html = ''
    let label = ''
    let type = ''

    this.options.data.forEach(item => {
      type = item.type ? item.type : this.options.type
      switch (type) {
        case 'icon':
          label = iconTemplate({
            classes: this.classes,
            icon: item.icon ? item.icon : this.options.icon
          })
          break
        case 'text':
          label = textTemplate({
            classes: this.classes,
            text: item.text ? item.text : ''
          })
          break
        case 'number':
          label = numberTemplate({
            classes: this.classes,
            number: item.number ? item.number : ''
          })
          break
        case 'dot':
          label = dotTemplate({ classes: this.classes })
          break
        case 'hide':
          label = ''
          break
        default:
          break
      }

      html += template({
        classes: this.classes,
        title: item.title,
        content: item.content,
        skin: this.getClasses(
          this.classes.SKIN,
          'skin',
          item.skin ? item.skin : this.options.skin
        ),
        type: this.getClass(this.classes.TYPE, 'type', type),
        styles: this.getHotspotStyles(item),
        label,
        options: this.getHotspotOptions(item)
      })
    })

    append(parseHTML(html), this.element)
  }

  getHotspotOptions(item) {
    const options = [
      'theme',
      'skin',
      'placement',
      'trigger',
      'hideOutClick',
      'delay',
      'close',
      'html'
    ]
      .filter(option => Boolean(Object.hasOwnProperty.call(item, option)))
      .map(option => `data-${option}="${item[option]}"`)

    return options
  }

  getHotspotStyles(item) {
    const styles = []

    if (isArray(item.position)) {
      if (item.position[0]) {
        styles.push(`left:${item.position[0]}`)
      }
      if (item.position[1]) {
        styles.push(`top:${item.position[1]}`)
      }
    }
    if (typeof item.styles !== 'undefined') {
      Object.entries(item.styles).forEach(([style, value]) => {
        styles.push(`${style}:${value}`)
      })
    }

    return styles.join(';')
  }

  setupPopover() {
    this.$hotspotsInstance = this.$hotspots.map(el => {
      return Popover.of(el, this.options.popover)
    })
    this.$hotspots.map(
      compose(
        bindEvent('popover:show', (e, instance) => {
          addClass(this.classes.HOTSPOTACTIVE, instance.element)
          this.trigger(EVENTS.POPOVERSHOW, instance)
        }),
        bindEvent('popover:shown', (e, instance) => {
          this.trigger(EVENTS.POPOVERSHOWN, instance)
        }),
        bindEvent('popover:inserted', (e, instance) => {
          this.trigger(EVENTS.POPOVERINSERTED, instance)
        }),
        bindEvent('popover:hide', (e, instance) => {
          removeClass(this.classes.HOTSPOTACTIVE, instance.element)
          this.trigger(EVENTS.POPOVERHIDE, instance)
        }),
        bindEvent('popover:hidden', (e, instance) => {
          this.trigger(EVENTS.POPOVERHIDDEN, instance)
        })
      )
    )
  }

  enable() {
    if (this.is('disabled')) {
      removeClass(this.classes.DISABLED, this.element)
      this.$hotspotsInstance.map(instance => instance.enable())
      this.leave('disabled')
    }
    this.trigger(EVENTS.ENABLE)
  }

  disable() {
    if (!this.is('disabled')) {
      addClass(this.classes.DISABLED, this.element)
      this.$hotspotsInstance.map(instance => instance.disable())

      this.enter('disabled')
    }

    this.trigger(EVENTS.DISABLE)
  }

  destroy() {
    if (this.is('initialized')) {
      this.$hotspotsInstance.map(instance => instance.destroy())
      this.unbind()
      this.leave('initialized')
    }

    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }
}

export default Hotspots
