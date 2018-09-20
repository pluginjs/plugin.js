import Component from '@pluginjs/component'
import { isArray } from '@pluginjs/is'
import { debounce, compose } from '@pluginjs/utils'
import templateEngine from '@pluginjs/template'
import { addClass, removeClass, hasClass } from '@pluginjs/classes'
import { bindEvent, removeEvent } from '@pluginjs/events'
import {
  parseHTML,
  query,
  queryAll,
  insertBefore,
  insertAfter,
  getData,
  setData,
  append,
  prepend,
  children,
  parent,
  parentWith,
  wrap,
  wrapAll,
  clone,
  closest
} from '@pluginjs/dom'
import {
  setStyle,
  getStyle,
  hideElement,
  showElement,
  getHeight
} from '@pluginjs/styled'
import {
  eventable,
  register,
  stateable,
  styleable,
  themeable,
  translateable,
  optionable
} from '@pluginjs/decorator'
import Keyboard from './keyboard'
// import Webfontloader from 'webfontloader';
import {
  classes as CLASSES,
  defaults as DEFAULTS,
  dependencies as DEPENDENCIES,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE,
  translations as TRANSLATIONS
} from './constant'
import Dropdown from '@pluginjs/dropdown'
import Select from '@pluginjs/select'
import Scrollable from '@pluginjs/scrollable'

let DATA = {}
let ACTIVATED = {}

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
class FontPicker extends Component {
  constructor(element, options = {}) {
    super(element)
    this.setupOptions(options)
    this.setupClasses()
    this.setupI18n()

    this.$fontPicker = addClass(
      this.classes.TRIGGER,
      parseHTML(
        templateEngine.compile(this.options.templates.trigger())({
          classes: this.classes
        })
      )
    )
    this.fontTrigger = query('.pj-dropdown-trigger', this.$fontPicker)
    insertAfter(this.$fontPicker, this.element)
    wrap(`<div class='${this.classes.WRAP}'></div>`, this.$fontPicker)
    insertBefore(this.element, this.$fontPicker)

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.$fontPicker)
    }

    this.activated = ACTIVATED
    this.source = DATA
    this.scrollLength = 0
    this.$font = null
    this.$fonts = []
    this.categoriesHeight = null

    this.$source = {}

    // this.setupI18n();

    this.setupStates()
    this.initialize()
    // this.get()
  }

  initialize() {
    // const that = this;
    this.$dropdown = this.initDropdown()
    this.$panel = this.$dropdown.$dropdown
    insertAfter(this.$panel, this.$fontPicker)
    addClass(this.classes.DROPDOWN, this.$panel)
    this.$activated = queryAll('.pj-dropdown-item', this.$panel)
    this.$activatedPackage = wrapAll(
      parseHTML(`<div class=${this.classes.ACTIVATED}></div>`),
      this.$activated
    )
    this.$sources = wrap(
      `<div class=${this.classes.SOURCES}></div>`,
      this.$activatedPackage
    )

    if (!Object.keys(this.activated)) {
      this.initEmpty()
    } else {
      this.initActivated()
      this.$activated = children(this.$activatedPackage)
      const $activatedLastElement = this.$activated[this.$activated.length - 1]
      this.$searchList = children(query('ul', $activatedLastElement))
      // Scrollable.of($activatedLastElement)
    }
    this.initSources()
    this.initController()
    this.handleSearch()
    this.initScrollable()

    this.wrapHeight = parseFloat(getStyle('height', this.$sources))

    this.itemHeight =
      parseInt(
        getStyle('height', query(`.${this.classes.FONT}`, this.$panel)),
        10
      ) +
      parseInt(
        getStyle('marginTop', query(`.${this.classes.FONT}`, this.$panel)),
        10
      )
    if (this.options.manager) {
      const text = this.translate('manager')
      this.$actions.append(
        parseHTML(
          `<div class=${
            this.classes.MANAGER
          }><i class='pj-icon pj-icon-setting-1'></i>${text}</div>`
        )
      )
    }

    if (this.options.keyboard) {
      this.$fontPicker.setAttribute('tabindex', 0)
      query('input', this.$search).setAttribute('tabindex', 0)
      queryAll(`.${this.classes.PACKAGETITLE}`, this.$sources).forEach(el => {
        el.setAttribute('tabindex', 0)
      })
      queryAll(`.${this.classes.FONT}`).forEach(el => {
        el.setAttribute('tabindex', 0)
      })
      query(`.${this.classes.MANAGER}`, this.$actions).setAttribute(
        'tabindex',
        0
      )
      this.KEYBOARD = new Keyboard(this)
    }

    if (this.element.value) {
      this.val(this.element.value, false)
    } else {
      this.fontTrigger.append(`${this.options.placeholder}`)
    }

    this.bind()

    if (this.element.disabled || this.options.disabled) {
      this.disable()
    }

    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }

  initEmpty() {
    this.$empty = parseHTML(
      templateEngine.compile(this.options.templates.empty())({
        classes: this.classes,
        title: this.translate('emptyTitle'),
        linkTitle: this.translate('emptyLinkTitle')
      })
    )

    children(this.$activatedPackage).forEach(el => el.remove())
    // this.$dropdown.$panel.children().remove();
    this.$activatedPackage.append(this.$empty)
  }

  bind() {
    if (this.is('disabled')) {
      return
    }
    const that = this

    bindEvent(
      this.eventName('click'),
      () => {
        this.$dropdown.show()
        return false
      },
      this.$fontPicker
    )

    // selected activated font
    bindEvent(
      this.eventName('click'),
      `.${this.classes.ACTIVATED} .${this.classes.FONT}`,
      e => {
        const $el = e.target
        this.setValue($el)
      },
      this.$panel
    )

    /*
      toggle package listener
    */
    bindEvent(
      this.eventName('click'),
      `.${this.classes.PACKAGETITLE}`,
      ({ target }) => {
        const $package = parent(target)
        if ($package.dataset.open === 'true') {
          this.close($package)
          removeEvent(this.eventName(), this.$sources)
        } else {
          this.open($package)
          // that.scrollLength = query('ul', $package).scrollTop()
        }
      },
      this.$panel
    )

    /*
      set font listener
    */
    bindEvent(
      this.eventName('click'),
      `.${this.classes.FONT}`,
      ({ target: $this }) => {
        if (that.$font) {
          removeClass(that.classes.ACTIVE, that.$font)
        }

        if (that.is('searching')) {
          removeClass(that.classes.SEARCHING, that.$panel)
          that.leave('searching')
        }

        that.setValue($this)
        that.$dropdown.hide()
      },
      this.$panel
    )

    /*
      lazy loading listener
    */
    queryAll('.pj-scrollable-container', this.$sources).map(
      bindEvent(this.eventName('scroll'), ({ target: $this }) => {
        if (hasClass(that.classes.SEARCHLIST, parent($this))) {
          const $searchList = that.$activated[that.$activated.length - 1]

          // that.scrollLength = $this.scrollTop()
          if (!that.is('listenScrollStop')) {
            let fontList = query(`.${that.classes.FONT}`, $searchList)
            if (that.is('searchReady') && that.is('searching')) {
              fontList = query(`.${that.classes.SEARCHED}`, $searchList)
            }
            that.isStopScroll($searchList.dataset.sourceName, 0, fontList)
          }
          return
        }
        const $categorie = parentWith(hasClass(that.classes.PACKAGE), $this)
        const $source = parent($categorie)

        const sourceName = $source.dataset.source
        // const sourceName = getData('source', $source)
        const categorieName = $categorie.dataset.value
        let index = 0

        Object.entries(that.source[sourceName].fonts).forEach(([i, v]) => {
          if (i === categorieName) {
            return
          }
          index += v.length
          return
        })

        // that.scrollLength = $this.scrollTop()
        if (!that.is('listenScrollStop')) {
          that.isStopScroll(sourceName, index)
        }
        return
      })
    )

    /*
      keyboard listener
    */
    if (this.options.keyboard) {
      bindEvent(
        this.eventName('keydown'),
        e => {
          if (e.keyCode === 13 && e.which === 13) {
            this.$dropdown.show()
          }

          if (e.keyCode === 27 && e.which === 27) {
            this.$dropdown.hide()
          }
        },
        this.$fontPicker
      )

      bindEvent(
        this.eventName('focus'),
        () => {
          if (that.is('keyboard')) {
            return
          }
          // let $this = $(this);
          that.KEYBOARD.init(that.$searchList)
        },
        query('input', this.$search)
      )

      compose(
        bindEvent(this.eventName('keydown'), e => {
          const code = e.keyCode
          const which = e.which
          const $this = parent(e.target)

          if (code === 13 && which === 13) {
            if (!$this.dataset.open && $this.dataset.open === 'false') {
              that.open($this)
              that.KEYBOARD.init(query(`.${that.classes.FONT}`, $this), true)
            } else {
              that.close($this)
              that.KEYBOARD.unbind()
            }

            e.stopPropagation()
            return false
          }
          return true
        }),
        bindEvent(this.eventName('focus'), e => {
          const $this = parent(e.target)

          if ($this.dataset.open === 'true' && !that.is('keyboard')) {
            that.KEYBOARD.init(query(`.${that.classes.FONT}`, $this), true)
          }
        })
      )(query(`.${this.classes.PACKAGETITLE}`, this.$panel))
      bindEvent(
        this.eventName('keydown'),
        `.${this.classes.FONT}`,
        e => {
          const $this = e.target
          const code = e.keyCode
          const which = e.which

          if (code === 13 && which === 13) {
            that.setValue($this)
            that.$dropdown.hide()
            that.KEYBOARD.unbind()
            e.stopPropagation()
            return false
          }
          return true
        },
        this.$sources
      )
    }

    /*
      search listener
    */
    compose(
      bindEvent(this.eventName('input'), e => {
        if (!that.is('searching')) {
          addClass(that.classes.SEARCHING, that.$panel)
        }
        that.enter('searching')

        const val = e.target.value
        debounce(that.searching(val), 1000)
      }),
      bindEvent(this.eventName('focus'), () => {
        addClass(that.classes.SEARCHREADY, that.$panel)
        that.enter('searchReady')
      })
    )(query('input', this.$search))

    bindEvent(
      this.eventName('click'),
      () => {
        query('input', this.$search).value = ''
        removeClass(this.classes.SEARCHREADY, this.$panel)
        this.leave('searchReady')
      },
      query(`.${this.classes.SEARCH}-close`, this.$search)
    )
  }

  unbind() {
    const removeEventByThisEventName = removeEvent(this.eventName())
    return [this.element, this.$fontPicker, this.$panel].forEach(
      removeEventByThisEventName
    )
    // removeEvent(this.eventName(), this.element)
    // removeEvent(this.eventName(), this.$fontPicker)
    // removeEvent(this.eventName(), this.$panel)
  }

  initActivated() {
    /*
      this.$activatedPackage.data() = {
        $fonts: [Array] // all of $selectedPackage's fonts
      }

      $font.data() = {
        value: [String], // font name
        source: [String], // source name
        categorie: [String], // categorie name
      }

      $searchFont.data() = {
        mapping: [jQery Object] // mapping the source font
      }
    */
    const that = this
    const $searchList = parseHTML(
      `<div class='${this.classes.SEARCHLIST}'><div><ul></ul></div></div>`
    )

    this.$activated.forEach($this => {
      const fontName = $this.dataset.value
      // let $sourceIcon = $(`<i class='${that.classes.SOURCEICON} icon-close'></i>`)

      Object.entries(that.activated).forEach(([sourceName, fonts]) => {
        if (fonts.indexOf(fontName) > -1) {
          $this.dataset.source = sourceName
          // getData('source', sourceName, $this)

          const $sourceIcon = parseHTML(
            `<i class='${that.classes.SOURCEICON} ${that.getIconName(
              sourceName
            )}'></i>`
          )
          $this.append($sourceIcon)
          return
        }
      })

      const $searchFont = setData(
        'mapping',
        $this,
        parseHTML(
          templateEngine.compile(that.options.templates.font())({
            font: that.classes.FONT,
            fontName
          })
        )
      )

      query('ul', $searchList).append($searchFont)
      that.$fonts.push($searchFont)
    })

    setData('$fonts', this.$fonts, this.$activatedPackage)
    setData('$fonts', this.$fonts, $searchList)
    this.$activatedPackage.append($searchList)
  }

  initSources() {
    /*
      this.$source = {
        sourceName: $sourcePackage
      }

      $sourcePackage.data() = {
        value: [String], // source name
        $fonts: [Array] // all of this $sourcePackage's fonts
      }
    */
    Object.entries(this.source).forEach(([sourceName, source]) => {
      const $sourcePackage = parseHTML(
        `<div class='${this.classes.SOURCE} ${
          this.classes.SOURCE
        }-${sourceName}'></div>`
      )
      const fonts = []
      const $searchList = parseHTML(
        `<div class='${this.classes.SEARCHLIST}'><div><ul></ul></div></div>`
      )

      if (isArray(source.fonts)) {
        const $fontsWrap = parseHTML(
          `<div class='${this.classes.FONTWRAP}'><div><ul></ul></div></div>`
        )
        source.fonts.forEach(fontName => {
          const $font = parseHTML(
            templateEngine.compile(this.options.templates.font())({
              font: this.classes.FONT,
              fontName
            })
          )
          $font.dataset.source = sourceName

          query('ul', $fontsWrap).append($font)
          fonts.push($font)
        })

        append($fontsWrap, $sourcePackage)
        hideElement($sourcePackage)
        append($sourcePackage, this.$sources)
        setData('$fonts', fonts, $sourcePackage)
        $sourcePackage.dataset.source = sourceName
        // setData('source', sourceName, $sourcePackage)
        this.$source[sourceName] = $sourcePackage
        return
      }
      if (!source) {
        return
      }
      // handle categorie
      Object.entries(source.fonts).forEach(([categorieName, categorie]) => {
        const $categorie = parseHTML(
          templateEngine.compile(this.options.templates.categories())({
            classes: this.classes,
            categoriesName: categorieName,
            title: categorieName.replace(/^.?/g, match =>
              match.toLocaleUpperCase()
            )
          })
        )

        const $fontsWrap = parseHTML(
          `<div class='${this.classes.FONTWRAP}'><div><ul></ul></div></div>`
        )

        $categorie.dataset.source = sourceName
        // handle font
        categorie.forEach(fontName => {
          const $font = parseHTML(
            templateEngine.compile(this.options.templates.font())({
              classes: this.classes,
              fontName
            })
          )
          $font.dataset.source = sourceName
          setData('categorie', categorieName, $font)

          query('ul', $fontsWrap).append($font)
          append($fontsWrap, $categorie)
          fonts.push($font)

          const $searchFont = setData('mapping', $font, clone($font))
          query('ul', $searchList).append($searchFont)
        })
        $sourcePackage.append($categorie)

        $sourcePackage.dataset.source = sourceName
        $searchList.dataset.sourceName = sourceName
        // setData('source', sourceName, $sourcePackage)
        // setData('sourceName', sourceName, $searchList)

        setData('$fonts', fonts, $sourcePackage)
        setData('$fonts', fonts, $searchList)
      })

      setData('title', source.title, $sourcePackage)
      $sourcePackage.append($searchList)
      this.$sources.append(hideElement($sourcePackage))
      this.$source[sourceName] = $sourcePackage

      this.setFontFamilies(
        $sourcePackage.dataset.source,
        // getData('source', $sourcePackage),
        0,
        query(`.${this.classes.FONT}`, $searchList)
      )
    })
  }

  initDropdown() {
    const that = this /* eslint-disable-line */
    const data = []
    if (!Object.keys(this.activated).length) {
      data.push({ label: 'empty', value: 'empty' })
    } else {
      Object.entries(this.activated).forEach(([, fonts]) => {
        fonts.forEach(font => {
          data.push({ label: font, value: font })
        })
      })
    }

    return Dropdown.of(this.fontTrigger, {
      theme: 'default',
      data,
      reference: this.$fontPicker,
      hideOnSelect: false,
      classes: {
        ITEM: `{namespace}-item ${this.classes.FONT}`
      },
      onHided() {
        that.$activated.forEach(v => {
          that.close(v)
        })
        // that.$selectorPanel.hide()
        if (that.is('searchReady')) {
          removeClass(that.classes.SEARCHREADY, that.$panel)
          query('input', that.$search).value = ''
          that.leave('searchReady')
        }

        if (that.is('keyboard')) {
          that.KEYBOARD.unbind()
        }
      },
      onShown() {
        that.categoriesHeight = getHeight(parent(that.$activated[0]))
        if (that.$font) {
          const $selectedPackage = parentWith(
            hasClass(that.classes.PACKAGE),
            that.$font
          )
          if (!$selectedPackage) {
            return
          }
          const $source = closest(
            `.${that.classes.SOURCE}-${that.$font.dataset.source}`,
            that.$font
          )
          that.$selectorPanel.set(getData('source', that.$font))
          that.toggleSources(getData('source', $source))
          that.$selectorPanel.set(getData('title', $source))
          that.open($selectedPackage)

          // count scrollTop number
          let scrollLength = 0  /* eslint-disable-line */
          getData('$fonts', $source).forEach(v => {
            if (v.dataset.categorie === that.$font.dataset.categorie) {
              if (v.dataset.value === that.$font.dataset.value) {
                // parent(this.$font).scrollT op(scrollLength)
                return
              }
              scrollLength += that.itemHeight
            }
          })
        }
        return
      }
    })
  }

  initController() {
    const data = []
    const localeText = this.translate('activatedFonts')
    this.$actions = parseHTML(
      templateEngine.compile(this.options.templates.actions())({
        classes: this.classes
      })
    )

    Object.entries(this.source).forEach(([, source]) => {
      data.push({ label: source.title, value: source.title })
    })
    data.push({ label: localeText, value: localeText })
    this.$panel.append(this.$actions)
    this.$switcher = query(`.${this.classes.SWITCHER}`, this.$actions)
    this.elSelect = query(`.${this.classes.ELSELECTOR}`, this.$switcher)
    const that = this
    this.$selectorPanel = Select.of(this.elSelect, {
      dropdown: {
        placement: 'top-center'
      },
      source: data,
      value: 'activated',
      keyboard: true,
      imitateSelect: true,
      width: this.$switcher,
      onShown() {
        if (this.is('builded')) {
          if (
            query('div', that.$selectorPanel.$dropdown).children.length === 0
          ) {
            queryAll('div', that.$selectorPanel.$dropdown).forEach(el => {
              Object.entries(that.source).forEach(([sourceName, source]) => {
                if (el.dataset.value === source.title) {
                  // el.dataset.source = sourceName
                  setData('source', sourceName, el)
                  prepend(
                    `<i class="${that.classes.SOURCEICON} ${that.getIconName(
                      sourceName
                    )}"></i>`,
                    el
                  )
                  return
                }
              })
            })
          }
        }
      },
      onChange(val) {
        if (query('i', query('.pj-dropdown-trigger', that.$switcher))) {
          query('i', query('.pj-dropdown-trigger', that.$switcher)).remove()
        }
        // const $source = val
        // const sourceName = $source.dataset.source
        // const sourceName = getData('source', $source)
        val = val.toLowerCase()
        that.toggleSources(val)
        that.categoriesHeight = getHeight(parent(that.$activated[0]))
        if (that.source[val]) {
          prepend(
            parseHTML(
              `<i class="${that.classes.SOURCEICON} ${that.getIconName(
                val
              )}"></i>`
            ),
            query('.pj-dropdown-trigger', that.$switcher)
          )
        }
      }
    })
  }

  initScrollable() {
    const $triggers = queryAll(`.${this.classes.FONTWRAP}`, this.$sources)

    const $searchList = queryAll(`.${this.classes.SEARCHLIST}`, this.$sources)

    $triggers.forEach($trigger => {
      Scrollable.of($trigger, {
        containerSelector: '>',
        contentSelector: '>'
      })
    })

    $searchList.forEach($trigger => {
      Scrollable.of($trigger, {
        containerSelector: '>',
        contentSelector: '>'
      })
    })
  }

  handleSearch() {
    this.$search = parseHTML(
      templateEngine.compile(this.options.templates.search())({
        classes: this.classes,
        placeholder: this.translate('searchText')
      })
    )

    insertBefore(this.$search, children(this.$panel)[0])
  }

  searching(val) {
    this.$showFonts = []
    val = val.toLowerCase()

    this.$searchList.forEach($font => {
      if ($font.dataset.value.toLowerCase().indexOf(val) >= 0) {
        addClass(this.classes.SEARCHED, $font)
        addClass(this.classes.FONT, $font)
        this.$showFonts.push($font)
      } else if (hasClass(this.classes.SEARCHED, $font)) {
        removeClass(this.classes.SEARCHED, $font)
      }
    })
    if (!this.$showFonts.length) {
      return
    }
    const $sourceFont = getData('mapping', this.$showFonts[0])
    if (!$sourceFont) {
      return
    }
    this.setFontFamilies($sourceFont.dataset.source, 0, this.$showFonts)
    this.trigger(EVENTS.SEARCHING)
  }

  isStopScroll(source, index, $fonts = this.$fonts) {
    let count = 0
    let temp = this.scrollLength

    const listenScrollStop = window.setInterval(() => {
      if (this.scrollLength === temp) {
        this.leave('listenScrollStop')
        window.clearInterval(listenScrollStop)
        let test = 0
        count = Math.floor(this.scrollLength / this.itemHeight)

        if (count === test) {
          return
        }
        this.setFontFamilies(source, index + count + test, $fonts)
        test = count
        return
      }
      temp = this.scrollLength

      return
    }, 500)

    this.enter('listenScrollStop')
  }

  toggleSources(val) {
    const value = val.toLowerCase()
    // const name = val.dataset.source
    // const localeText = this.translate('activatedFonts')
    if (this.$source[value]) {
      children(this.$sources).forEach(hideElement)
      showElement(this.$source[value])

      this.$activated = children(this.$source[value])
      this.$fonts = getData('$fonts', this.$source[value])
      this.$searchList = children(
        query('ul', this.$activated[this.$activated.length - 1])
      )
      return
    }
    Object.entries(this.$source).forEach(([, v]) => hideElement(v))

    showElement(this.$activatedPackage)

    this.$activated = children(this.$activatedPackage)
    this.$searchList = children(
      query('ul', this.$activated[this.$activated.length - 1])
    )
    this.$fonts = getData('$fonts', this.$activatedPackage)
    return

    // if (this.is('keyboard')) {
    //   this.KEYBOARD.unbind()
    // }
  }

  setFontFamilies(source, index, $fonts = this.$fonts) {
    if (!this.source[source]) {
      return false
    }
    if (!Array.isArray($fonts)) {
      const $item = $fonts
      const fontFamily = $item.dataset.value
      this.source[source].load($item, fontFamily, fontFamily)
    }
    for (let i = 0; i < this.options.lazyNumber; i++) {
      const $item = $fonts[index + i]
      if (!$item) {
        return false
      }
      const fontFamily = $item.dataset.value
      if (getStyle(fontFamily, $item) === fontFamily) {
        continue
      }
      this.source[source].load($item, fontFamily, fontFamily)
    }
    return true
  }

  open($el) {
    const that = this  /* eslint-disable-line */
    if (!$el.dataset.open && $el.dataset.open === 'false') {
      this.close(query(`.${this.classes.PACKAGEOPEN}`, this.$sources))
    }
    const $fontsList = query(`.${this.classes.FONTWRAP}`, $el)
    setStyle(
      'height',
      `${this.wrapHeight - this.categoriesHeight}px`,
      $fontsList
    )
    const container = query('.pj-scrollable-container', $fontsList)
    setStyle('height', getHeight($fontsList), container)

    $fontsList.style.display = 'block'
    // $fontsList.slideDown(this.options.delay)
    addClass(this.classes.PACKAGEOPEN, $el)
    $el.dataset.open = true

    const scrollableApi = Scrollable.findInstanceByElement($fontsList)
    scrollableApi.enable()
    setTimeout(() => {
      scrollableApi.update()
    }, 250)

    window.setTimeout(() => {
      let index = 0
      const name = $el.dataset.value
      const sourceName = $el.dataset.source

      Object.entries(this.source[sourceName].fonts).forEach(([i, v]) => {
        if (i === name) {
          return
        }
        index += v.length
        return
      })

      that.setFontFamilies(parent($el).dataset.source.toLowerCase(), index)
    }, that.options.delay)
  }
  close($el) {
    if (!$el) {
      return
    }
    const $fontsList = query(`.${this.classes.FONTWRAP}`, $el)
    if ($fontsList) {
      $fontsList.style.display = 'none'
    }
    // $fontsList.slideUp(this.options.delay)

    removeClass(this.classes.PACKAGEOPEN, $el)
    $el.dataset.open = false
  }

  getIconName(sourceName) {
    const source = this.source[sourceName.toLowerCase()]
    if (!source) {
      return ''
    }
    const icon = source.icon

    return icon ? icon : ''
  }

  setValue(val, trigger = true) {
    if (!this.$font) {
      if (this.element.value) {
        append('<span></span>', this.$fontPicker)
      }
    } else {
      removeClass(this.classes.ACTIVE, this.$font)
    }

    this.$font = getData('mapping', val) ? getData('mapping', val) : val
    const fontFamily = this.$font.dataset.value
    const sourceName = this.$font.dataset.source
    const $preView = query('.pj-dropdown-trigger', this.$fontPicker)
    addClass(this.classes.ACTIVE, this.$font)
    this.element.setAttribute('value', this.val())
    $preView.innerHTML = fontFamily
    $preView.dataset.value = fontFamily
    this.setFontFamilies(sourceName, 0, $preView)

    if (this.is('keyboard')) {
      this.KEYBOARD.unbind()
    }
    if (trigger) {
      this.trigger(EVENTS.CHANGE, this.$font)
    }
  }

  get() {
    return this.options.process({
      ...this.$font.dataset,
      ...this.$font.objData
    })
  }

  set(value, trigger = true) {
    if (typeof value === 'undefined') {
      return
    }

    const valueObj = this.options.parse(value)
    const $source = this.$source[valueObj.source.toLowerCase()]
    if (!$source) {
      return
    }

    const $fonts = getData('$fonts', $source)

    $fonts.forEach(v => {
      if (v.dataset.value === valueObj.value) {
        this.setValue(v, trigger)
      } else {
        return
      }
      return
    })
  }

  val(value, trigger = true) {
    if (typeof value === 'undefined') {
      return this.get()
    }

    this.set(value, trigger)
    return false
  }

  enable() {
    if (this.is('disabled')) {
      removeClass(this.classes.DISABLED, this.$fontPicker)
      this.$dropdown.enable()
      this.element.disabled = false
      this.leave('disabled')
    }
    this.trigger(EVENTS.ENABLE)
  }

  disable() {
    if (!this.is('disabled')) {
      addClass(this.classes.DISABLED, this.$fontPicker)
      this.$dropdown.disable()
      this.element.disabled = true
      this.enter('disabled')
    }

    this.trigger(EVENTS.DISABLE)
  }

  destroy() {
    if (this.is('initialized')) {
      this.unbind()
      removeClass(this.classes.TRIGGER, this.$fontPicker)
      if (this.options.theme) {
        removeClass(this.getThemeClass(), this.$fontPicker)
      }

      this.$dropdown.destroy()
      this.$selectorPanel.destroy()
      parentWith(hasClass(this.classes.WRAP), this.$fontPicker).remove()
      this.$fontPicker.remove()
      this.element.value = ''
      this.leave('initialized')
    }

    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }

  static setData(data) {
    DATA = data
  }

  static registerSources(data) {
    Object.entries(data).forEach(([name, value]) => {
      FontPicker.registerSource(name, value)
    })
  }

  static registerSource(name, data) {
    DATA[name] = data
  }

  static setActivated(data) {
    ACTIVATED = data
  }
}

export default FontPicker
