import Component from '@pluginjs/component'
import { compose } from '@pluginjs/utils'
import template from '@pluginjs/template'
import { addClass, removeClass } from '@pluginjs/classes'
import { bindEvent, removeEvent } from '@pluginjs/events'
import { setStyle } from '@pluginjs/styled' // , getStyle
import { query, has, parseHTML, getData, setData, wrap } from '@pluginjs/dom'
import ColorSelector from '@pluginjs/color-selector'
import Dropdown from '@pluginjs/dropdown'
import Range from '@pluginjs/range'
import Trigger from './trigger'
import {
  eventable,
  register,
  stateable,
  styleable,
  themeable,
  translateable,
  optionable
} from '@pluginjs/decorator'
import {
  classes as CLASSES,
  defaults as DEFAULTS,
  dependencies as DEPENDENCIES,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE,
  translations as TRANSLATIONS
} from './constant'

let DATA = null

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
class PatternPicker extends Component {
  constructor(element, options = {}) {
    super(element)
    this.setupOptions(options)
    this.setupClasses()

    addClass(this.classes.NAMESPACE, this.element)

    this.setupI18n()

    this.imgs = DATA
    this.data = {}

    this.foreColor = ''
    this.bgColor = this.options.bgcolor
    this.opacity = 1

    this.$content = null
    this.setupStates()
    this.initialize()
  }

  initialize() {
    this.create()
    this.bind()

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.$wrap)
    }

    this.initData()

    if (this.element.disabled || this.options.disabled) {
      this.disable()
    }

    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }

  initData() {
    const data = this.element.value
    if (data) {
      this.val(data, false)
    }
  }

  create() {
    addClass(this.classes.INPUT, this.element)
    this.$wrap = wrap(
      `<div class='${this.classes.NAMESPACE}'></div>`,
      this.element
    )
    if (this.options.theme) {
      addClass(this.classes.THEME, this.$wrap)
    }

    this.TRIGGER = new Trigger(this)

    this.$dropdown = parseHTML(
      template.compile(this.options.templates.dropdown())({
        classes: this.classes
      })
    )

    this.$wrap.append(this.$dropdown)
    this.handelComponent()

    this.pluginCreate()
    this.render()
  }

  handelComponent() {
    this.$fillImg = query(`.${this.classes.FILLIMG}`, this.TRIGGER.$fill)

    this.$previewBox = parseHTML(
      `<div class='${this.classes.PREVIEW}'><div class='${
        this.classes.PREVIEWIMG
      }'></div></div>`
    )
    this.$previewImg = query(`.${this.classes.PREVIEWIMG}`, this.$previewBox)
    this.$forePickerBox = parseHTML(
      `<div class='${this.classes.FIELD}'><span class='${
        this.classes.FIELDTITLE
      }'>${this.translate('foreColor')}</span><div class='${
        this.classes.FIELDCONTENT
      }'><input class='${
        this.classes.FORECOLOR
      } pj-input' type='text' placeholder='choose color' /></div></div>`
    )
    this.$forePicker = query(`.${this.classes.FORECOLOR}`, this.$forePickerBox)
    this.$bgColorBox = parseHTML(
      `<div class='${this.classes.FIELD}'><span class='${
        this.classes.FIELDTITLE
      }'>${this.translate('bgColor')}</span><div class='${
        this.classes.FIELDCONTENT
      }'><input class='${
        this.classes.BGCOLOR
      } pj-input' type='text' placeholder='choose color' /></div></div>`
    )
    this.$bgColor = query(`.${this.classes.BGCOLOR}`, this.$bgColorBox)
    this.$opacityBox = parseHTML(
      `<div class='${this.classes.FIELD}'><span class='${
        this.classes.FIELDTITLE
      }'>${this.translate('opacity')}</span><div class='${
        this.classes.FIELDCONTENT
      }' style='width:160px'><input class='${
        this.classes.OPACITY
      }' type='text' /></div></div>`
    )
    this.$opacity = query(`.${this.classes.OPACITY}`, this.$opacityBox)
    this.$action = parseHTML(
      `<div class='${this.classes.BTNACTION}'>
        <button type='button' class='${
          this.classes.CANCEL
        } pj-btn pj-btn-transparent'>Cancel</button>
        <button type='button' class='${
          this.classes.SAVE
        } pj-btn pj-btn-transparent'>Save</button>
      </div>`
    )
  }

  pluginCreate() {
    this.DROPDOWN = Dropdown.of(this.TRIGGER.$empty, {
      target: this.$dropdown,
      reference: this.TRIGGER.$trigger,
      templates: this.options.template,
      hideOutClick: true,
      hideOnSelect: false,
      onShow: () => {
        if (!this.DROPDOWN.is('builded')) {
          this.$dropdown.append(
            this.$previewBox,
            this.$forePickerBox,
            this.$bgColorBox,
            this.$opacityBox,
            this.$action
          )
        }
      }
    })

    this.FOREPICKER = ColorSelector.of(this.$forePicker, {
      theme: 'default',
      module: ['solid'],
      solidMode: 'sample',
      solidModule: {
        alpha: false,
        hex: false
      },
      onChange: val => {
        this.foreColor = val

        this.enter('foreChange')
        this.leave('bgChange')
        this.leave('opacityChange')
        this.updateComponent()

        return
      }
    })

    this.BGCOLOR = ColorSelector.of(this.$bgColor, {
      theme: 'default',
      module: ['solid'],
      solidMode: 'sample',
      solidModule: {
        alpha: false,
        hex: false
      },
      onChange: val => {
        // if (!this.$selected) {
        //   return
        // }
        val = val.toHEX()
        this.bgColor = val
        this.leave('foreChange')
        this.enter('bgChange')
        this.leave('opacityChange')
        this.updateComponent()
        return
      }
    })

    this.OPACITY = Range.of(this.$opacity, {
      theme: 'default',
      tip: false,
      range: false,
      units: {
        '%': {
          min: 0,
          max: 100,
          step: 1
        }
      },
      onChange: data => {
        this.opacity = data / 100

        this.leave('foreChange')
        this.leave('bgChange')
        this.enter('opacityChange')
        this.updateComponent()

        return
      }
    })

    // set initial color
    this.FOREPICKER.val('#000')
    this.BGCOLOR.val(this.bgColor)
    this.OPACITY.val('100%')
  }

  render() {
    const img = Object.entries(this.imgs)[0]
    const info = {
      name: img[0],
      'background-color': this.bgColor,
      // make '#' to '%23', fixed svg data image not working on FireFox.
        'background-image': img[1].replace(/\#+/g, '%23')/* eslint-disable-line */
    }
    setData('info', info, this.$previewImg)

    this.setInfo(this.$previewImg)

    this.BGCOLOR.val(this.options.format(info, 'background-color'))
    this.FOREPICKER.val(this.options.format(info, 'color'))
    this.OPACITY.val(`${this.options.format(info, 'opacity')}%`)
  }

  bind() {
    // document
    bindEvent(
      this.eventName('click'),
      e => {
        if (
          e.target === this.TRIGGER.$trigger ||
          has(e.target, this.TRIGGER.$trigger) ||
          e.target === this.$dropdown ||
          has(e.target, this.$dropdown)
        ) {
          return
        }
        removeClass(this.classes.OPENDISABLE, this.TRIGGER.$trigger)
      },
      window.document
    )

    // action save
    compose(
      bindEvent(this.eventName('click'), `.${this.classes.SAVE}`, () => {
        this.update()
      }),
      bindEvent(this.eventName('click'), `.${this.classes.CANCEL}`, () => {
        // this.update()
        this.DROPDOWN.hide()
        removeClass(this.classes.OPENDISABLE, this.TRIGGER.$trigger)
        if (!this.is('state')) {
          removeClass(this.classes.SHOW, this.$wrap)
        }
      })
    )(this.$action)
  }

  unbind() {
    removeEvent(this.eventName(), this.$wrap)
  }

  update(data) {
    if (data) {
      setData('info', data, this.$previewImg)
      this.setInfo(this.$previewImg)
    } else {
      this.data = getData('info', this.$previewImg)
    }

    setData('info', getData('info', this.$previewImg), this.$fillImg)
    this.setInfo(this.$fillImg)
    this.element.value = this.val()
    this.DROPDOWN.hide()
    removeClass(this.classes.OPENDISABLE, this.TRIGGER.$trigger)
    addClass(this.classes.SHOW, this.$wrap)

    this.enter('state')
  }

  updateComponent() {
    let key = ''

    if (this.is('foreChange')) {
      key = 'foreColor'
    } else if (this.is('bgChange')) {
      key = 'bgColor'
    } else {
      key = 'opacity'
    }

    this.setAttr(key, this.$previewImg)
    // this.element.value = this.options.process.call(
    //   this,
    //   getData('info', this.$previewImg)
    // )
  }

  setInfo(img) {
    const imgData = getData('info', img)
    setStyle(
      {
        backgroundColor: imgData['background-color'],

        // make '#' to '%23', fixed svg data image not working on FireFox.
        backgroundImage: imgData['background-image'].replace(/\#+/g, '%23')/* eslint-disable-line */

      },
      img
    )

    setData('info', imgData, img)
  }

  set(data, trigger = true) {
    if (!this.imgs || !data) {
      return
    }
    const name = data.name

    if (!this.imgs[name]) {
      return
    }

    this.data = data

    const info = getData('info', this.$previewImg)

    if (info.name !== name) {
      if (data['background-color']) {
        this.bgColor = data['background-color']
      } else {
        data['background-color'] = this.bgColor
      }

      this.BGCOLOR.val(this.options.format(data, 'background-color'))
      this.FOREPICKER.val(this.options.format(data, 'color'))
      this.OPACITY.val(`${this.options.format(data, 'opacity')}%`)

      this.update(data)
    }

    if (trigger) {
      this.trigger(EVENTS.CHANGE, data)
    }

    return
  }

  get() {
    return this.data
  }

  val(value, trigger = true) {
    if (typeof value === 'undefined') {
      return this.options.process.call(this, this.get())
    }
    const val = this.options.parse.call(this, value)
    this.set(val, trigger)
    return null
  }

  setAttr(key, el) {
    const info = getData('info', el)
    if (!info) {
      return
    }
    if (key !== 'bgColor') {
      const attr = key === 'opacity' ? 'opacity' : 'fill'
      const val = key === 'opacity' ? this.opacity : this.foreColor
      const reg = new RegExp(`${attr}='(.*?)'`, 'g')

      const img = info['background-image'].replace(reg, `${attr}='${val}'`)

      info['background-image'] = img
    } else {
      info['background-color'] = this.bgColor
    }
    setData('info', info, el)
    this.setInfo(el)
  }

  clear() {
    setData('info', '', this.$previewImg)
    setStyle(
      {
        backgroundColor: 'transparent',
        backgroundImage: 'none'
      },
      this.$previewImg
    )

    setData('info', '', this.$fillImg)
    setStyle(
      {
        backgroundColor: 'transparent',
        backgroundImage: 'none'
      },
      this.$fillImg
    )

    this.OPACITY.val('100%')
    this.FOREPICKER.clear()
    this.BGCOLOR.clear()

    removeClass(this.classes.SHOW, this.$wrap)
    this.leave('state')
  }

  enable() {
    if (this.is('disabled')) {
      removeClass(this.classes.DISABLED, this.$wrap)
      this.TRIGGER.CLEARPOP.enable()
      this.DROPDOWN.enable()
      this.element.disabled = false
      this.leave('disabled')
    }
    this.trigger(EVENTS.ENABLE)
  }

  disable() {
    if (!this.is('disabled')) {
      addClass(this.classes.DISABLED, this.$wrap)
      this.TRIGGER.CLEARPOP.disable()
      this.DROPDOWN.disable()
      this.element.disabled = true
      this.enter('disabled')
    }
    this.trigger(EVENTS.DISABLE)
  }

  destroy() {
    if (this.is('initialized')) {
      removeClass(this.classes.NAMESPACE, this.element)
      this.unbind()
      this.clear()
      this.DROPDOWN.destroy()
      this.leave('initialized')
    }

    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }

  static setData(data) {
    DATA = data
  }
}

export default PatternPicker