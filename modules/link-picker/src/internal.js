import template from '@pluginjs/template'
import Cascader from '@pluginjs/cascader'
import { parseHTML, query } from '@pluginjs/dom'

export default class Internal {
  constructor(instance) {
    this.instance = instance
    this.defaultValue = instance.options.internal.value
    this.initialize()
  }

  initialize() {
    const html = template.compile(this.instance.options.internal.template())({
      classes: this.instance.classes,
      field: this.instance.getClassName(
        this.instance.classes.NAMESPACE,
        'internal'
      ),
      internal: this.instance.translate('internal')
    })
    this.$wrap = parseHTML(html)
    this.$content = query(`.${this.instance.classes.FIELDCONTENT}`, this.$wrap)
    this.element = query(
      `.${this.instance.classes.CASCADERTRIGGER}`,
      this.$content
    )
    this.CASCADER = Cascader.of(this.element, {
      source: this.instance.options.internalValue,
      keyboard: true,
      onChange: value => {
        if (this.instance.is('disabled')) {
          return
        }
        this.instance.value.internal = value
        console.log(value)
      }
    })
  }

  set(value) {
    for (const key in this.values) {
      if (value === this.values[key]) {
        this.SELECT.select(value)
      }
    }
  }

  clear() {
    this.set(this.defaultValue)
  }
}