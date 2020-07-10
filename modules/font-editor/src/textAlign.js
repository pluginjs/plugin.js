import template from '@pluginjs/template'
import Tooltip from '@pluginjs/tooltip'

import {
  parseHTML,
  // query,
  // insertBefore,
  queryAll,
  setData,
  getData
} from '@pluginjs/dom'
import { bindEvent } from '@pluginjs/events'
import { hasClass, addClass, removeClass } from '@pluginjs/classes'
// import FontEditor from './main'

export default class TextAlign {
  constructor(instance) {
    this.instance = instance
    this.values = instance.options.textAlign.values
    this.defaultValue = instance.options.textAlign.value

    this.initialize()
  }

  initialize() {
    const that = this
    const html = template.compile(this.instance.options.textAlign.template())({
      classes: this.instance.classes,
      textStart: this.instance.translate('textStart'),
      textEnd: this.instance.translate('textEnd'),
      textCenter: this.instance.translate('textCenter')
    })

    this.$wrap = parseHTML(html)
    this.instance.$typoDecorations = this.$wrap
    this.$items = queryAll(
      `.${this.instance.classes.TEXTALIGN}`,
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
      setData('textAlign', value, that.$items[key])
    })

    const value =
      typeof this.instance.value.textAlign !== 'undefined'
        ? this.instance.value.textAlign
        : this.defaultValue
    this.set(value)

    this.bind()
  }

  set(value) {
    let found = false
    this.$items.map(removeClass(this.instance.classes.ACTIVE))
    if (value === '') {
      this.instance.value.textAlign = ''
      found = true
    } else {
      for (let i = 0; i < this.values.length; i++) {
        if (value === this.values[i]) {
          this.instance.value.textAlign = value
          addClass(this.instance.classes.ACTIVE, this.$items[i])
          found = true
        }
      }
    }

    if (!found) {
      this.set(this.defaultValue)
    }
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

        const align = getData('textAlign', target)
        if (hasClass(that.instance.classes.ACTIVE, target)) {
          removeClass(that.instance.classes.ACTIVE, target)
          that.instance.value.textAlign = this.defaultValue
        } else {
          that.set(align)
        }

        switch (that.instance.value.textAlign) {
          case 'left':
            that.instance.value.textAlign = 'left'
            break
          case 'center':
            that.instance.value.textAlign = 'center'
            break
          case 'right':
            that.instance.value.textAlign = 'right'
            break
          default:
            break
        }
        return null
      })
    )
  }
}
