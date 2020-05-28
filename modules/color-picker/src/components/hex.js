import { bindEvent } from '@pluginjs/events'
import { query, parseHTML, attr } from '@pluginjs/dom'
import { compose, debounce } from '@pluginjs/utils'
import { Color } from '@pluginjs/color'
import Select from '@pluginjs/select'
import { addClass } from '@pluginjs/classes'

class Hex {
  constructor(instance, element) {
    this.instance = instance
    this.element = element
    this.classes = this.instance.classes
    this.opac = 100
    this.color = null
    this.COLOR = new Color()
    this.mode = this.COLOR.toHEX()
    this.HSL = this.COLOR.toHSL().toUpperCase()
    this.HEX = this.COLOR.toHEX().toUpperCase()
    this.RGB = this.COLOR.toRGB().toUpperCase()

    this.classify = this.HEX

    this.data = [
      { label: this.HEX, value: 'HEX' },
      { label: this.HSL, value: 'HSL' },
      { label: this.RGB, value: 'RGB' }
    ]
    this.init()
  }

  init() {
    this.build()
    this.bind()
  }

  build() {
    const $selector = parseHTML(
      `<div class='${this.classes.HEXMODE}'><input type="text" value="${this.data[0].value}" /></div>`
    )

    if(this.instance.module.hexInput) {
      this.$input = parseHTML(
        `<input class="pj-input pj-input-sm ${this.classes.HEXINPUT}" type="text"/>`
      )

      compose(
        attr({ placeholder: this.instance.options.placeholder })
      )(this.$input)

      this.element.append(this.$input)

      addClass(this.classes.HEXWIDTHINPUT, this.element)
    }

    if (this.instance.module.alpha) {
      this.$opac = parseHTML(
        `<div class='${this.classes.HEXBOX}'>
          <input class="pj-input pj-input-sm ${this.classes.HEXANGLE}" type="text"/>
          <div class="${this.classes.HEXUNIT}">%</div>
        </div>`
      )

      this.element.append($selector, this.$opac)
    } else {
      this.element.append($selector)
    }

    this.$el = query(`.${this.classes.HEXMODE}>input`, this.element)
    this.SELECT = Select.of(this.$el, {
      source: this.data,
      allSelectTriggerChange: true,
      dropdown: {
        placement: 'bottom-end' // top
      },
      classes: {
        TRIGGER: '{namespace}-trigger pj-input pj-input-sm'
      },
      onChange: res => {
        this.updateColor(res, this.color)
      },
      onShow: () => {
        if (!this.instance.is('hexFirsrtShown')) {
          this.color &&
          this.updateColor(this.SELECT.element.value, this.color)
          this.instance.enter('hexFirsrtShown')
        }   
      }
    })
  }

  bind() {
    bindEvent(
      this.instance.selfEventName('changeColor'),
      (e, el, color) => {
        this.color = color
        if (this.instance.module.alpha) {
          query(`.${this.classes.HEXANGLE}`, this.$opac).value = parseInt(color.value.a * 100) /* eslint-disable-line */
        }

        this.updateColor(this.SELECT.element.value, color)
      },
      this.instance.element
    )

    bindEvent(
      this.instance.eventName('change'),
      ({ target }) => {
        this.update(this.mode)
      },
      this.$el
    )

    bindEvent(
      this.instance.eventName('input'),
      debounce(e => {
        if (new Color().matchString(e.target.value)) {
          this.instance.set(e.target.value)
        }
      }, 1000),
      this.$input
    )

    if (this.instance.module.alpha) {
      bindEvent(
        this.instance.eventName('change'),
        `.${this.classes.HEXANGLE}`,
        ({ target }) => {
          this.updateAlpha(target.value)
        },
        this.$opac
      )
    }
  }

  updateColor(val, color) {
    if (val.indexOf('HSL') > -1) {
      this.mode = color.toHSL().toUpperCase()
    } else if (val.indexOf('RGB') > -1) {
      this.mode = color.toRGB().toUpperCase()
    } else {
      this.mode = color.toHEX().toUpperCase()
    }

    this.data = [
      this.color.toHEX().toUpperCase(),
      this.color.toHSL().toUpperCase(),
      this.color.toRGB().toUpperCase()
    ]

    this.SELECT.$label.innerText = this.mode
    this.SELECT.options.value = this.mode
    this.SELECT.options.source = this.data

    this.element
      .querySelectorAll('.pj-dropdown-item')
      .forEach((value, index) => {
        value.innerText = this.data[index]
      })
  }

  updateAlpha(percent) {
    percent /= 100
    
    this.instance.setColor({ a: `${percent}` })
  }

  update(value) {
    if (this.instance.COLOR.isValid(value)) {
      this.instance.setColor(value)
      // this.updateColor(this.instance.color, this.instance.COLOR)
    }
  }
}

export default Hex
