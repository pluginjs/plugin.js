import template from '@pluginjs/template'
import { addClass, removeClass, hasClass } from '@pluginjs/classes'
import { queryAll, parseHTML, setData, getData, append } from '@pluginjs/dom'
import { bindEvent } from '@pluginjs/events'
import Tooltip from '@pluginjs/tooltip'

export default class TextTransform {
  constructor(instance) {
    this.instance = instance

    this.values = instance.options.textTransform.values
    this.defaultValue = instance.options.textTransform.value

    this.initialize()
  }

  initialize() {
    const that = this
    const html = template.compile(
      this.instance.options.textTransform.template()
    )({
      classes: this.instance.classes,
      uppercase: this.instance.translate('uppercase'),
      lowercase: this.instance.translate('lowercase'),
      capitalize: this.instance.translate('capitalize')
    })

    this.$wrap = []
    this.$wrap.push(parseHTML(html))
 
    for(let i in this.$wrap) {
      append(this.$wrap[i], this.instance.$typoDecorations)
    }

    this.$items = queryAll(
      `.${this.instance.classes.TEXTTRANSFORM}`,
      this.instance.$typoDecorations
    )

    for (let i = 0; i < this.$items.length; i++) {
      Tooltip.of(this.$items[i], {
        trigger: 'hover',
        title: '',
        placement: 'bottom'
      })
    }

    this.values.forEach((value, key) => {
      if (that.$items[key]) {
        setData('textTransform', value, that.$items[key])
      }
    })

    const value =
      typeof this.instance.value.textTransform !== 'undefined'
        ? this.instance.value.textTransform
        : this.defaultValue
    this.set(value)
    this.bind()
  }

  set(value) {
    this.$items.map(removeClass(this.instance.classes.ACTIVE))

    if (value === '') {
      this.instance.value.textTransform = this.defaultValue
    } else {
      for (let i = 0; i < this.values.length; i++) {
        if (value === this.values[i]) {
          this.instance.value.textTransform = value
          addClass(this.instance.classes.ACTIVE, this.$items[i])
        }
      }
    }

    return
  }

  clear() {
    this.set(this.defaultValue)
  }

  bind() {
    const that = this
    this.$items.map(
      bindEvent(this.instance.eventName('click'), ({ target }) => {
        if (that.instance.is('disabled')) {
          return null
        }

        const transform = getData('textTransform', target)
        if (hasClass(that.instance.classes.ACTIVE, target)) {
          removeClass(that.instance.classes.ACTIVE, target)
          that.instance.value.textTransform =
            that.instance.options.textTransform.defaultValue
        } else {
          that.set(transform)
        }

        return null
      })
    )
  }
}
