import Component from '@pluginjs/component'
import templateEngine from '@pluginjs/template'
import { throttle } from '@pluginjs/utils'
import { addClass, removeClass, hasClass } from '@pluginjs/classes'
import Dropdown from '@pluginjs/dropdown'
import {
  parseHTML,
  insertAfter,
  insertBefore,
  children,
  append,
  prepend,
  query
} from '@pluginjs/dom'
import { getStyle, outerWidth, getWidth } from '@pluginjs/styled'
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
class Breadcrumb extends Component {
  constructor(element, options = {}) {
    super(element)

    this.setupOptions(options)
    this.setupClasses()

    addClass(this.classes.ELEMENT, this.element)

    this.$children = this.options.getItems(this.element)
    this.$firstChild = this.$children[0]

    this.$dropdown = null

    this.gap = 6
    this.items = []
    this.$data = []
    this.setupStates()
    this.initialize()
  }

  initialize() {
    addClass(
      this.getClass(this.classes.OVERFLOW, 'overflow', this.options.overflow),
      this.element
    )

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.element)
    }

    this.prepareItems()
    this.createDropdown()
    this.createEllipsis()

    this.render()

    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }

  prepareItems() {
    const template = templateEngine.compile(
      this.options.templates.dropdownItem.call(this)
    )
    const disableTemplate = templateEngine.compile(
      this.options.templates.dropdownItemDisable.call(this)
    )

    this.$children.forEach(el => {
      const $link = this.options.getItemLink(el)
      const href = $link ? $link.getAttribute('href') : ''
      let $dropdownItem

      if (href) {
        $dropdownItem = parseHTML(
          template({
            classes: this.classes,
            label: el.textContent,
            href
          })
        )
      } else {
        $dropdownItem = parseHTML(
          disableTemplate({
            classes: this.classes,
            label: el.textContent
          })
        )
      }

      this.items.push({
        $this: el,
        outerWidth: outerWidth(el),
        $item: $dropdownItem
      })
    })

    if (this.options.overflow === 'left') {
      this.items.reverse()
    }
  }

  createDropdown() {
    this.$dropdown = addClass(
      this.classes.HIDDEN,
      parseHTML(
        templateEngine.render(this.options.templates.dropdown.call(this), {
          classes: this.classes,
          text: this.options.responsiveText
        })
      )
    )

    if (this.options.overflow === 'right') {
      addClass(this.classes.DROPDOWNRIGHT, this.$dropdown)
      append(this.$dropdown, this.element)
    } else {
      prepend(this.$dropdown, this.element)
    }
  }

  createEllipsis() {
    if (!this.options.ellipsisText) {
      return
    }

    this.$ellipsis = addClass(
      this.classes.HIDDEN,
      parseHTML(
        templateEngine.render(this.options.templates.ellipsis.call(this), {
          classes: this.classes,
          lable: this.options.ellipsisText
        })
      )
    )
    if (this.options.overflow === 'right') {
      insertBefore(this.$ellipsis, this.$dropdown)
    } else {
      insertAfter(this.$ellipsis, this.$dropdown)
    }
  }

  render() {
    if (this.is('disabled')) {
      return
    }
    const dropdownWidth = this.getDropdownWidth()
    let childrenWidthTotal = 0
    const containerWidth = this.getConatinerWidth()

    let showDropdown = false
    this.$data = []

    for (let i = 0; i < this.items.length; i++) {
      childrenWidthTotal += this.items[i].outerWidth

      if (childrenWidthTotal + dropdownWidth > containerWidth) {
        showDropdown = true
        this.showDropdownItem(i)
      } else {
        this.hideDropdownItem(i)
      }

      if (!hasClass(`${this.classes.HIDDEN}`, this.items[i].$item)) {
        this.$data.push({
          label: this.items[i].$item.textContent,
          value: this.items[i].$item.textContent.toLowerCase()
        })
      }
    }

    if (!this.DROPDOWN) {
      this.$toggle = query(`.${this.classes.TOGGLE}`, this.$dropdown)
      this.DROPDOWN = Dropdown.of(this.$toggle, {
        data: this.$data,
        target: false
      })
    } else {
      children(this.DROPDOWN.$dropdown).map(item => {
        if(isIE()||isIE11()) {
          item.removeNode(true);
        } else {
          item.remove()
        }
      })
      this.DROPDOWN.appendItems(this.$data)
    }

    if (showDropdown) {
      removeClass(this.classes.HIDDEN, this.$ellipsis)
      removeClass(this.classes.HIDDEN, this.$dropdown)
    } else {
      addClass(this.classes.HIDDEN, this.$ellipsis)
      addClass(this.classes.HIDDEN, this.$dropdown)
    }

    this.trigger(EVENTS.UPDATE)
  }

  getDropdownWidth() {
    return (
      outerWidth(this.$dropdown) +
      (this.options.ellipsisText ? outerWidth(this.$ellipsis) : 0)
    )
  }

  getConatinerWidth() {
    let width = 0

    children(this.element).forEach(el => {
      if (
        getStyle('display', el) === 'inline-block' &&
        getStyle('float', el) === 'none'
      ) {
        width += this.gap
      }
    })
    return getWidth(this.element) - width
  }

  showDropdownItem(i) {
    removeClass(this.classes.HIDDEN, this.items[i].$item)
    addClass(this.classes.HIDDEN, this.items[i].$this)
  }

  hideDropdownItem(i) {
    removeClass(this.classes.HIDDEN, this.items[i].$this)
    addClass(this.classes.HIDDEN, this.items[i].$item)
  }

  enable() {
    if (this.is('disabled')) {
      this.leave('disabled')
    }

    removeClass(this.classes.DISABLED, this.$dropdown)
    this.render()
    this.trigger(EVENTS.ENABLE)
  }

  disable() {
    if (!this.is('disabled')) {
      this.enter('disabled')
    }

    children(this.element).map(removeClass(this.classes.HIDDEN))
    addClass(this.classes.DISABLED, this.$dropdown)
    if (this.options.ellipsisText) {
      if(isIE()||isIE11()) {
        this.$ellipsis.removeNode(true);
      } else {
        this.$ellipsis.remove()
      }
    }

    this.trigger(EVENTS.DISABLE)
  }

  destroy() {
    if (this.is('initialized')) {
      if (this.options.theme) {
        removeClass(this.getThemeClass(), this.element)
      }
      children(this.element).map(removeClass(this.classes.HIDDEN))
   
      if(isIE()||isIE11()) {
        this.$dropdown.removeNode(true);
      } else {
        this.$dropdown.remove()
      }

      if (this.options.ellipsisText) {
        if(isIE()||isIE11()) {
          this.$ellipsis.removeNode(true);
        } else {
          this.$ellipsis.remove()
        }
      }

      this.leave('initialized')
    }

    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }

  resize() {
    if (!this.is('disabled') && this.options.responsive) {
      throttle(this.render(), 250)
    }
  }
}

export default Breadcrumb
