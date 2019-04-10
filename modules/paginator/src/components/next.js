import templateEngine from '@pluginjs/template'
import { addClass, removeClass } from '@pluginjs/classes'
import { bindEvent, removeEvent } from '@pluginjs/events'
import { query } from '@pluginjs/dom'
import { deepMerge } from '@pluginjs/utils'

class Next {
  constructor(instance) {
    this.options = deepMerge(Next.defaults, instance.options.components.next)
    this.instance = instance
  }

  generate() {
    return templateEngine.render(this.options.template.call(this), {
      classes: this.instance.classes,
      label: this.instance.translate('next')
    })
  }

  bind() {
    const instance = this.instance

    if (!this.next) {
      this.next = query(`.${instance.classes.NEXT}`, instance.element)
    }
    bindEvent('click', instance.next.bind(instance), this.next)

    bindEvent(
      'paginator:change',
      (e, instance, page, trigger) => {
        if (page === instance.totalPages && !trigger) {
          addClass(instance.classes.DISABLED, this.next)
        } else {
          removeClass(instance.classes.DISABLED, this.next)
        }
      },
      instance.element
    )
  }

  unbind() {
    removeEvent('click', this.next)
    removeEvent('paginator:change', this.instance.element)
  }
}

Next.defaults = {
  template() {
    return '<li class="{classes.ITEM} {classes.NEXT}"><a class="{classes.LINK}" alt="{label}">Next<i class="{classes.NEXTICON}" aria-hidden="true"></i></a></li>'
  }
}

Next.translations = {
  en: { next: 'next' },
  zh: { next: '下一页' }
}

Next.classes = {
  NEXT: '{namespace}-next',
  NEXTICON: 'pj-icon pj-icon-arrow-long-right'
}

export default Next
