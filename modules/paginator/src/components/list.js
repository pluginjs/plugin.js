import templateEngine from '@pluginjs/template'
import { deepMerge, arrayEqual } from '@pluginjs/utils'
import { addClass, removeClass } from '@pluginjs/classes'
import { bindEvent, removeEvent } from '@pluginjs/events'
import {
  parseHTML,
  query,
  queryAll,
  insertBefore,
  insertAfter,
  getData
} from '@pluginjs/dom'
import { isObject, isIE, isIE11 } from '@pluginjs/is'

const FilterFromData = (dataAttr, value = true, elements) =>
  elements.filter(item => {
    let VerifiData = dataAttr.split('-')
    VerifiData.shift()
    VerifiData = VerifiData.join('-')

    // const attr = parseInt(item.dataset[camelize(VerifiData, false)], 10)
    const attr = parseInt(getData(VerifiData, item), 10)
    if (value === true) {
      if (attr) {
        return item
      }
    } else {
      return attr === value
    }

    return attr
  })

class List {
  constructor(instance) {
    this.options = deepMerge(List.defaults, instance.options.components.list)
    this.instance = instance
    this.visibleSize = this.getVisibleSize()
    this.currentPage = this.instance.currentPage
    this.visiblePages = this.getVisiblePages()
  }

  generate() {
    let html = ''

    html += this.generateFirst()

    if (this.hasPrev()) {
      html += this.generatePrev()
    }

    const itemTemplate = templateEngine.compile(
      this.options.templates.item.call(this)
    )

    this.visiblePages.forEach(page => {
      html += itemTemplate({
        classes: this.instance.classes,
        page
      })
    })

    if (this.hasNext()) {
      html += this.generateNext()
    }

    if (this.instance.totalPages > 1) {
      html += this.generateLast()
    }

    return templateEngine.render(html, { classes: this.instance.classes })
  }

  getVisibleSize() {
    let size = 0

    if (isObject(this.instance.options.list.visibleSize)) {
      const keys = Object.keys(this.instance.options.list.visibleSize)
      for (const k of keys) {
        const value = this.instance.options.list.visibleSize[k]
        if (window.document.documentElement.clientWidth > k) {
          size = value
        }
      }
    } else {
      size = this.instance.options.list.visibleSize
    }

    return size
  }

  getItems() {
    this.items = FilterFromData(
      this.options.itemAttr,
      true,
      queryAll('li', this.instance.element)
    )
    return this.items
  }

  getNext() {
    this.next = query(
      `.${this.instance.classes.LISTNEXT}`,
      this.instance.element
    )
    return this.next
  }

  getPrev() {
    this.prev = query(
      `.${this.instance.classes.LISTPREV}`,
      this.instance.element
    )
    return this.prev
  }

  bind() {
    const that = this
    const instance = this.instance
    
    if (!Element.prototype.matches) {
      Element.prototype.matches = Element.prototype.msMatchesSelector;
    }

    if (!Element.prototype.closest)
      Element.prototype.closest = function(s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement;
        } while (el !== null);
        return null;
    };

    this.getItems()
    this.getNext()
    this.getPrev()

    bindEvent(
      'click',
      `.${instance.classes.ITEM}`,
      e => {
        const page = getData('page', e.target.closest('li'))
        if (typeof page === 'undefined') {
          return false
        }

        if (page === '') {
          return false
        }

        instance.goTo(page)
        return undefined /* eslint-disable-line no-undefined */
      },
      instance.element
    )

    bindEvent(
      'click',
      `.${instance.classes.LISTPREV}`,
      () => {
        that.instance.goTo(that.currentPage - that.visibleSize)
      },
      instance.element
    )

    bindEvent(
      'click',
      `.${instance.classes.LISTNEXT}`,
      () => {
        that.instance.goTo(that.currentPage + that.visibleSize)
      },
      instance.element
    )

    bindEvent(
      'paginator:ready',
      () => {
        const activeitem = FilterFromData(
          that.options.itemAttr,
          that.currentPage,
          that.items
        )
        activeitem.map(item => {
          return addClass(that.instance.classes.ACTIVE, item)
        })
      },
      instance.element
    )

    bindEvent(
      'paginator:change',
      (e, instance, page, trigger) => {
        that.update(trigger)
      },
      instance.element
    )
  }

  unbind() {
    const instance = this.instance
    removeEvent('click', instance.element)
    removeEvent('paginator:ready', instance.element)
    removeEvent('paginator:change', instance.element)
  }

  update(trigger = false) {
    const oldPages = this.visiblePages
    const newPages = this.getVisiblePages()
    const items = this.items
    if (this.currentPage !== this.instance.currentPage || trigger) {
      items.map(item => removeClass(this.instance.classes.ACTIVE, item))
    }

    if (!arrayEqual(oldPages, newPages)) {
      const itemTemplate = templateEngine.compile(
        this.options.templates.item.call(this)
      )
      const start = FilterFromData(this.options.itemAttr, oldPages[0], items)[0]
      let end = FilterFromData(
        this.options.itemAttr,
        oldPages[oldPages.length - 1],
        items
      )[0]
      if (this.hasPrev()) {
        if (this.prev) {
          if(isIE() || isIE11()) {
            this.prev.removeNode(true);
          } else {
            this.prev.remove()
          } 
        }
        this.prev = parseHTML(this.generatePrev())
        insertAfter(this.prev, items[0])
      } else if (this.prev) {
        if(isIE() || isIE11()) {
          this.prev.removeNode(true);
        } else {
          this.prev.remove()
        }
      }

      if (this.hasNext()) {
        if (this.next) {
          if(isIE() || isIE11()) {
            this.next.removeNode(true);
          } else {
            this.next.remove()
          }
        }
        this.next = parseHTML(this.generateNext())
        insertBefore(this.next, items[items.length - 1])
      } else if (this.next) {
        if(isIE() || isIE11()) {
          this.next.removeNode(true);
        } else {
          this.next.remove()
        }
      }

      newPages.forEach(page => {
        if (oldPages.indexOf(page) === -1) {
          if (page < oldPages[0]) {
            const pagehtml = itemTemplate({
              classes: this.instance.classes,
              page
            })

            insertBefore(pagehtml, start)
          } else {
            const endEl = parseHTML(
              itemTemplate({
                classes: this.instance.classes,
                page
              })
            )
            insertAfter(endEl, end)
            end = endEl
          }
        }
      })

      oldPages.forEach(page => {
        if (newPages.indexOf(page) === -1) {
          const item = FilterFromData(this.options.itemAttr, page, items)
          if(isIE() || isIE11()) {
            item[0].removeNode(true);
          } else {
            item[0].remove()
          }
        }
      })

      this.getItems()
    }

    if (this.currentPage !== this.instance.currentPage || trigger) {
      this.currentPage = this.instance.currentPage

      const activeitem = FilterFromData(
        this.options.itemAttr,
        this.currentPage,
        queryAll('li', this.instance.element)
      )
      activeitem.forEach(item => {
        addClass(this.instance.classes.ACTIVE, item)
      })
    }
  }

  resize() {
    this.visibleSize = this.getVisibleSize()
    this.update()
  }

  getAfterSize() {
    return Math.ceil((this.visibleSize - 1) / 2)
  }

  hasPrev() {
    return this.instance.totalPages > 2 && this.visiblePages[0] !== 2
  }

  hasNext() {
    return (
      this.instance.totalPages > 2 &&
      this.visiblePages[this.visiblePages.length - 1] !==
        this.instance.totalPages - 1
    )
  }

  getVisiblePages() {
    let visibleSize = this.visibleSize
    const currentPage = this.instance.currentPage
    const totalPages = this.instance.totalPages

    if (totalPages <= 2) {
      return []
    }

    if (visibleSize > totalPages - 2) {
      visibleSize = totalPages - 2
    }

    let beforeSize = Math.floor((visibleSize - 1) / 2)
    let afterSize

    if (currentPage === 1) {
      beforeSize = 0
      afterSize = visibleSize
    } else if (currentPage === totalPages) {
      beforeSize = visibleSize
      afterSize = 0
    } else {
      if (currentPage - beforeSize < 2) {
        beforeSize = currentPage - 2
      }

      afterSize = visibleSize - 1 - beforeSize

      if (currentPage + afterSize > totalPages - 1) {
        afterSize = totalPages - currentPage - 1
        beforeSize = visibleSize - 1 - afterSize
        if (currentPage - beforeSize <= 2) {
          beforeSize = currentPage - 2
        }
      }
    }

    const pages = []

    if (beforeSize > 0) {
      for (let i = currentPage - beforeSize; i < currentPage; i++) {
        pages.push(i)
      }
    }

    if (currentPage !== 1 && currentPage !== totalPages) {
      pages.push(currentPage)
    }

    if (afterSize > 0) {
      for (let i = currentPage + 1; i <= currentPage + afterSize; i++) {
        pages.push(i)
      }
    }

    this.visiblePages = pages
    return this.visiblePages
  }

  generatePrev() {
    return templateEngine.render(this.options.templates.prev.call(this), {
      classes: this.instance.classes,
      label: this.instance.translate('listPrev', { count: this.visibleSize })
    })
  }

  generateNext() {
    return templateEngine.render(this.options.templates.next.call(this), {
      classes: this.instance.classes,
      label: this.instance.translate('listNext', { count: this.visibleSize })
    })
  }

  generateFirst() {
    return templateEngine.render(this.options.templates.item.call(this), {
      classes: this.instance.classes,
      page: 1
    })
  }

  generateLast() {
    return templateEngine.render(this.options.templates.item.call(this), {
      classes: this.instance.classes,
      page: this.instance.totalPages
    })
  }
}

List.defaults = {
  // visibleSize: {
  //   0: 3,
  //   960: 5,
  //   1280: 7
  // },
  itemAttr: 'data-page',
  templates: {
    next() {
      return '<li class="{classes.LISTNEXT}"><a class="{classes.LINK}" href="#" alt="{label}" title="{label}"><i class="{classes.LISTNEXTICON}" aria-hidden="true">...</i></a></li>'
    },
    prev() {
      return '<li class="{classes.LISTPREV}"><a class="{classes.LINK}" href="#" alt="{label}" title="{label}"><i class="{classes.LISTPREVICON}" aria-hidden="true">...</i></a></li>'
    },
    item() {
      return '<li class="{classes.ITEM}" data-page="{page}"><a class="{classes.LINK}" href="#">{page}</a></li>'
    }
  }
}

List.translations = {
  en: {
    listNext: 'Next {count} pages',
    listPrev: 'Prev {count} pages'
  },
  zh: {
    listNext: '向前 {count} 页',
    listPrev: '向后 {count} 页'
  }
}

List.classes = {
  LISTNEXT: '{namespace}-list-next',
  LISTNEXTICON: 'pj-icon pj-icon-ellipsis-circle-h',
  LISTPREV: '{namespace}-list-prev',
  LISTPREVICON: 'pj-icon pj-icon-ellipsis-circle-h'
}

export default List
