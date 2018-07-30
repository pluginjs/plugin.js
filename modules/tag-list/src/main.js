import templateEngine from '@pluginjs/template'
import { query, parseHTML, setObjData, parent } from '@pluginjs/dom'
import { bindEvent, removeEvent } from '@pluginjs/events'
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
import List from '@pluginjs/list'

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
class TagList extends List {
  constructor(element, options = {}) {
    super(element, options)

    this.initOptions(DEFAULTS, options)
    this.initClasses(CLASSES)
    this.setupI18n()

    this.$wrapper = parent(this.element)

    this.init()
  }

  init() {
    this.plugin = NAMESPACE
    this.initAddBtn()
    this.$addBtn = query(`.${this.classes.ADDBTN}`, this.$add)
    this.$addInput = query(`.${this.classes.ADDINPUT}`, this.$add)

    this.listener()
  }

  initAddBtn() {
    this.$add = parseHTML(
      templateEngine.compile(this.options.templates.add())({
        classes: this.classes,
        placeholder: this.translate('addPlaceholder'),
        BtnText: this.translate('add')
      })
    )

    this.$wrapper.append(this.$add)
  }

  listener() {
    bindEvent(
      {
        type: this.eventName('click'),
        handler: () => {
          if (this.is('disabled')) {
            return
          }
          const val = this.$addInput.value
          this.addItem(val)
        }
      },
      this.$addBtn
    )
  }

  unbind() {
    removeEvent(this.eventName(), this.$addBtn)
  }

  addItem(val) {
    if (!val || typeof val === 'undefined') {
      return
    }

    const data = { title: val }

    this.insert(data)
    this.$addInput.value = ''
  }

  removeListener() {
    removeEvent(this.eventName())
  }

  destroy() {
    this.$add.remove()
    this.unbind()
    setObjData('tagList', null, this.element)
    super.destroy()
  }

  enable() {
    if (this.is('disabled')) {
      this.$addBtn.disabled = false
      this.$addInput.disabled = false
    }

    super.enable()
  }

  disable() {
    if (!this.is('disabled')) {
      this.$addBtn.disabled = true
      this.$addInput.disabled = true
    }

    super.disable()
  }
}

export default TagList
