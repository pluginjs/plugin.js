import Component from '@pluginjs/component'
import { compose } from '@pluginjs/utils'
import { parseHTML, insertAfter, query } from '@pluginjs/dom'
import { hideElement, showElement, setStyle } from '@pluginjs/styled'
import { addClass, removeClass } from '@pluginjs/classes'
import { bindEvent, removeEvent } from '@pluginjs/events'
import PopDialog from '@pluginjs/pop-dialog'
import template from '@pluginjs/template'
import Dropdown from '@pluginjs/dropdown'
import {
  eventable,
  register,
  stateable,
  styleable,
  themeable,
  translateable,
  optionable
} from '@pluginjs/decorator'
import Attachment from './attachment'
import Position from './position'
import Repeat from './repeat'
import Size from './size'
import {
  classes as CLASSES,
  defaults as DEFAULTS,
  dependencies as DEPENDENCIES,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE,
  translations as TRANSLATIONS
} from './constant'

@translateable(TRANSLATIONS)
@themeable()
@styleable(CLASSES)
@eventable(EVENTS)
@stateable()
@optionable(DEFAULTS, true)
@register(NAMESPACE, {
  methods: METHODS,
  dependencies: DEPENDENCIES
})
class BgPicker extends Component {
  constructor(element, options = {}) {
    super(element)

    this.setupOptions(options)
    this.setupClasses()

    addClass(this.classes.INPUT, this.element)

    this.setupI18n()
    this.setupStates()
    this.initialize()
  }

  initialize() {
    this.createHtml()

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.$wrap)
    }

    // this.value = this.options.parse(this.element.value.replace(/'/g, '"'))
    this.value = this.options.value
    this.set(this.value, false)

    // init
    if (!this.value.image) {
      addClass(this.classes.WRITE, this.$wrap)
    }

    this.SIZE = new Size(this)
    this.ATTACHMENT = new Attachment(this)
    this.POSITION = new Position(this)
    this.REPEAT = new Repeat(this)

    addClass(this.classes.EXIST, this.$wrap)

    this.bind()

    if (this.element.disabled || this.options.disabled) {
      this.disable()
    }

    this.initDropdown()
    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }

  initDropdown() {
    this.DROPDOWN = Dropdown.of(this.$empty, {
      // data: this.getTimeList().map(value => ({ label: value })),
      // placeholder: this.options.placeholder,
      theme: 'dafault',
      placement: 'bottom-left',
      reference: this.$trigger,
      target: this.$Panel,
      hideOutClick: false,
      hideOnSelect: false,
      templates: this.options.templates
    })
  }

  bind() {
    const that = this
    bindEvent(
      this.eventName('click'),
      () => {
        if (this.is('disabled')) {
          return
        }
        // console.log(this.element.value.image)
        this.setImage(this.options.value.image)
        removeClass(
          this.classes.EXIST,
          addClass(this.classes.EXPAND, this.$wrap)
        )
      },
      this.$empty
    )

    compose(
      bindEvent(this.eventName('mouseenter'), ({ target }) => {
        if (this.is('disabled')) {
          return
        }

        addClass(that.classes.HOVER, target)
      }),
      bindEvent(this.eventName('mouseleave'), ({ target }) => {
        if (this.is('disabled')) {
          return null
        }
        if (this.is('holdHover')) {
          return false
        }
        removeClass(this.classes.HOVER, target)
        this.leave('holdHover')
        return null
      }),
      bindEvent(this.eventName('click'), `.${this.classes.EDIT}`, () => {
        if (this.is('disabled')) {
          return null
        }
        this.DROPDOWN.show()
        this.oldValue = this.val()
        removeClass(
          this.classes.EXIST,
          addClass(this.classes.EXPAND, this.$wrap)
        )

        return false
      }),
      bindEvent(this.eventName('click'), `.${this.classes.REMOVE}`, () => {
        if (this.is('disabled')) {
          return null
        }
        return null
      })
    )(this.$fill)

    bindEvent(
      this.eventName('click'),
      () => {
        if (this.is('disabled')) {
          return null
        }

        this.val(this.oldValue)
        this.update()
        removeClass(
          this.classes.EXPAND,
          addClass(this.classes.EXIST, this.$wrap)
        )
        this.DROPDOWN.hide()
        return false
      },
      this.$cancel
    )

    bindEvent(
      this.eventName('click'),
      () => {
        if (this.is('disbaled')) {
          return null
        }

        this.update()
        removeClass(
          this.classes.EXPAND,
          addClass(this.classes.EXIST, this.$wrap)
        )
        this.DROPDOWN.hide()
        return false
      },
      this.$save
    )

    bindEvent(
      this.eventName('click'),
      () => {
        if (this.is('disabled')) {
          return
        }
        this.options.select.apply(this)
      },
      this.$image
    )
  }

  unbind() {
    ;[
      this.element,
      this.$empty,
      this.$fill,
      this.$cancel,
      this.$image,
      this.$edit,
      this.$remove
    ].map(removeEvent(this.eventName()))
  }

  createHtml() {
    this.$wrap = parseHTML(
      template.compile(this.options.template())({
        classes: this.classes,
        placeholder: this.translate('placeholder'),
        cancel: this.translate('cancel'),
        save: this.translate('save')
      })
    )
    insertAfter(this.$wrap, this.element)

    this.$empty = query(`.${this.classes.EMPTY}`, this.$wrap)

    this.$fill = query(`.${this.classes.FILL}`, this.$wrap)
    this.$fillImageName = hideElement(
      query(`.${this.classes.IMAGENAMEFILL}`, this.$fill)
    )
    this.$trigger = query(`.${this.classes.TRIGGER}`, this.$wrap)
    this.$fillImage = query(`.${this.classes.FILLIMAGE}`, this.$fill)
    this.$remove = query(`.${this.classes.REMOVE}`, this.$fill)
    this.$edit = query(`.${this.classes.EDIT}`, this.$fill)
    this.$Panel = query(`.${this.classes.DROPDOWN}`, this.$wrap)
    this.$expandPanel = query(`.${this.classes.EXPANDPANEL}`, this.$wrap)
    this.$control = query(`.${this.classes.CONTROL}`, this.$expandPanel)
    this.$cancel = query(`.${this.classes.CANCEL}`, this.$control)
    this.$save = query(`.${this.classes.SAVE}`, this.$control)
    this.$imageWrap = query(`.${this.classes.IMAGEWRAP}`, this.$expandPanel)
    this.$image = query(`.${this.classes.IMAGE}`, this.$expandPanel)

    // init pop
    this.pop = new PopDialog(this.$remove, {
      placement: 'bottom',
      content: 'Are you sure you want to delete?',
      buttons: {
        cancel: { label: 'Cancel' },
        delete: {
          label: 'Delete',
          color: 'danger',
          fn: resolve => {
            this.clear()
            resolve()
          }
        }
      },
      onShow: () => {
        this.enter('holdHover')
      },
      onHide: () => {
        removeClass(this.classes.HOVER, this.$fill)
        this.leave('holdHover')
      }
    })
  }

  setState(image) {
    if (!image || image === this.options.image) {
      addClass(this.classes.WRITE, this.$wrap)
    } else {
      removeClass(this.classes.WRITE, this.$wrap)
    }
  }

  returnFill(image) {
    let imgName
    if (!image || image === this.options.image) {
      this.$fillImageName.textContent = this.translate('placeholder')
    } else {
      imgName = image.match(/([\S]+[/])([\S]+\w+$)/i)[2]
      this.$fillImageName.textContent = imgName
    }
  }

  update() {
    const value = this.val()
    this.element.value = value
    this.trigger(EVENTS.CHANGE, value)
  }

  val(value) {
    if (typeof value === 'undefined') {
      return this.options.process.call(this, this.value)
    }
    const valueObj = this.options.parse.call(this, value)
    if (valueObj) {
      this.set(valueObj)
    } else {
      this.clear()
    }

    return null
  }

  set(value, update) {
    this.value = value
    this.setImage(value.image)

    if (update !== false) {
      if (typeof value.repeat !== 'undefined') {
        this.REPEAT.set(value.repeat)
      } else {
        this.REPEAT.clear()
      }
      if (typeof value.size !== 'undefined') {
        this.SIZE.set(value.size)
      } else {
        this.SIZE.clear()
      }
      if (typeof value.position !== 'undefined') {
        this.POSITION.set(value.position)
      } else {
        this.POSITION.clear()
      }
      if (typeof value.attachment !== 'undefined') {
        this.ATTACHMENT.set(value.attachment)
      } else {
        this.ATTACHMENT.clear()
      }

      this.update()
    }
  }

  clear(update) {
    this.value = {}

    if (update !== false) {
      const image = ''
      this.setImage(image)

      this.REPEAT.clear()
      this.SIZE.clear()
      this.POSITION.clear()
      this.ATTACHMENT.clear()
      this.update()
    }
  }

  setImage(image) {
    let thumbnailUrl
    this.setState(image)
    this.returnFill(image)
    if (image === '' || typeof image === 'undefined') {
      showElement(this.$fillImageName)
      setStyle('background-image', 'none', this.$image)

      setStyle('background-image', 'none', this.$fillImage)
    } else if (image || image !== this.options.image) {
      thumbnailUrl = this.options.thumbnail ? this.options.thumbnail : image
      const IMG = new Image()
      IMG.onload = () => {
        this.value.image = thumbnailUrl
        this.returnFill(this.value.image)
        setStyle('background-image', `url('${this.value.image}')`, this.$image)

        setStyle(
          'background-image',
          `url('${this.value.image}')`,
          this.$fillImage
        )
      }
      IMG.onerror = () => {
        this.value.image = image
        this.returnFill(image)
        this.update()
        setStyle('background-image', 'none', this.$image)
        setStyle('background-image', 'none', this.$fillImage)
      }
      IMG.src = thumbnailUrl
    }
  }

  setRepeat(repeat) {
    this.REPEAT.set(repeat)
    this.update()
  }

  setSize(size) {
    this.SIZE.set(size)
    this.update()
  }

  setPosition(position) {
    this.POSITION.set(position)
    this.update()
  }

  setAttachment(attachment) {
    this.ATTACHMENT.set(attachment)
    this.update()
  }

  get() {
    return this.value
  }

  enable() {
    if (this.is('disabled')) {
      this.element.disabled = false
      this.pop.enable()
      removeClass(this.classes.DISABLED, this.$wrap)
      this.leave('disabled')
    }
    this.trigger(EVENTS.ENABLE)
  }

  disable() {
    if (!this.is('disabled')) {
      this.element.disabled = true
      this.pop.disable()
      addClass(this.classes.DISABLED, this.$wrap)
      this.enter('disabled')
    }

    this.trigger(EVENTS.DISABLE)
  }

  destroy() {
    if (this.is('initialized')) {
      this.unbind()
      this.leave('initialized')

      removeClass(this.classes.INPUT, this.element)
      this.$wrap.remove()
      if (this.options.theme) {
        removeClass(this.getThemeClass(), this.element)
      }
    }

    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }
}

export default BgPicker
