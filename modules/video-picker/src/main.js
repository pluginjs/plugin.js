import Component from '@pluginjs/component'
import { compose } from '@pluginjs/utils'
import template from '@pluginjs/template'
import { addClass, removeClass } from '@pluginjs/classes'
import {
  setStyle,
  hideElement,
  showElement,
  contentWidth,
  contentHeight
} from '@pluginjs/styled'
import { bindEvent, removeEvent } from '@pluginjs/events'
import {
  parseHTML,
  query,
  parentWith,
  fadeIn,
  fadeOut,
  wrap
} from '@pluginjs/dom'
import Video from '@pluginjs/video'
import Dropdown from '@pluginjs/dropdown'
import PopDialog from '@pluginjs/pop-dialog'
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
class VideoPicker extends Component {
  constructor(element, options = {}) {
    super(NAMESPACE, element)
    this.initOptions(DEFAULTS, options)
    this.initClasses(CLASSES)
    this.setupI18n()
    addClass(this.classes.NAMESPACE, this.element)
    this.data = {}
    this.data.source = this.options.sources[0]
    this.data.url = ''
    this.data.poster = ''
    this.data.ratio = 'auto'

    this.initStates()
    this.initialize()
  }

  initialize() {
    this.build()
    this.bind()

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.element)
    }

    const defaultValue = this.element.value
    if (defaultValue) {
      this.val(defaultValue)
    }

    if (this.element.disabled || this.options.disabled) {
      this.disable()
    }

    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }
  build() {
    const that = this
    const $wrap = parseHTML(
      `<div class='${this.classes.NAMESPACE} ${this.classes.WRAP}'></div>`
    )
    if (this.options.theme) {
      addClass(this.classes.THEME, $wrap)
    }
    wrap($wrap, addClass(this.classes.INPUT, this.element))
    this.$wrap = parentWith(
      el => el.matches(`.${this.classes.NAMESPACE}`),
      this.element
    )
    // creat trigger
    // this.$trigger = parseHTML(
    //   this.createEl('trigger', {
    //     classes: this.classes
    //   })
    // )
    // create dropdown
    // this.$dropdown = parseHTML(
    //   this.createEl('dropdown', {
    //     classes: this.classes
    //   })
    // )
    this.$trigger = parseHTML(
      template.compile(this.options.templates.trigger())({
        classes: this.classes
      })
    )
    this.$fill = parseHTML(
      template.compile(this.options.templates.fill())({
        classes: this.classes
      })
    )
    this.$empty = parseHTML(
      template.compile(this.options.templates.empty())({
        classes: this.classes,
        icon: 'icon-chevron-circle-up',
        text: this.translate('inputPlaceholder')
      })
    )
    this.$dropdown = parseHTML(
      template.compile(this.options.templates.dropdown())({
        classes: this.classes
      })
    )
    this.$action = parseHTML(
      template.compile(this.options.templates.previewContent())({
        classes: this.classes
      })
    )
    this.$videoPreview = parseHTML(
      template.compile(this.options.templates.videoPreview())({
        classes: this.classes
      })
    )
    this.$infoAction = parseHTML(
      template.compile(this.options.templates.infoAction())({
        classes: this.classes
      })
    )
    this.$wrap.append(this.$trigger, this.$dropdown)
    this.$trigger.append(this.$empty, this.$fill)
    this.$fill.append(this.$infoAction)
    // set Aspect Ratio
    const sourceData = []
    this.options.sources.forEach((v, i) => {
      sourceData[i] = { label: v }
    })
    const ratioData = [{ label: 'auto' }, { label: '4:3' }, { label: '16:9' }]
    const localeCancel = this.translate('cancel')
    const localeDelete = this.translate('delete')
    // const localeSave = this.translate('save');
    const localeAddVideo = this.translate('addVideo')
    const localePddPoster = this.translate('addPoster')
    const localeChangeVideo = this.translate('changeVideo')
    const localeChangePoster = this.translate('changePoster')

    // create priview
    this.$preview = parseHTML(`<div class='${this.classes.PREVIEW}'></div>`)
    this.$preview.append(this.$action, this.$videoPreview)
    // create components
    this.$source = parseHTML(
      `<div class='${this.classes.COMPONENT}'><span class='${
        this.classes.COMTITLE
      }'>${this.translate('videoSource')}</span><div class='${
        this.classes.SOURCE
      }'><span class="pj-dropdown-trigger"></span></div></div>`
    )
    this.$sourceTrigger = query('.pj-dropdown-trigger', this.$source)
    this.$videoUrlContent = parseHTML(
      `<div class='${this.classes.COMPONENT}'><span class='${
        this.classes.COMTITLE
      }'>${this.translate('videoURL')}</span><div class='${
        this.classes.VIDEOURL
      }'><input type='text' class='pj-input' /><i class='icon-close-mini'></i></div></div>`
    )
    this.$videoUrl = query(`.${this.classes.VIDEOURL}`, this.$videoUrlContent)
    this.$localUrlContent = parseHTML(
      `<div class='${
        this.classes.COMPONENT
      }' style='display:none'><span class='${
        this.classes.COMTITLE
      }'>${this.translate('chooseVideo')}</span><div class='${
        this.classes.LOCALURL
      }'><span class='${
        this.classes.LOCALURLADD
      }'>${localeAddVideo}</span><span class='${
        this.classes.LOCALURLCHANGE
      }'>${localeChangeVideo}</span><span class='${
        this.classes.LOCALURLDELETE
      }'>${localeDelete}</span></div></div>`
    )
    this.$localUrl = query(`.${this.classes.LOCALURL}`, this.$localUrlContent)
    this.$ratioContent = parseHTML(
      `<div class='${this.classes.COMPONENT}'><span class='${
        this.classes.COMTITLE
      }'>${this.translate('aspectRatio')}</span><div class="${
        this.classes.RATIO
      }"><span class="pj-dropdown-trigger"></span></div></div>`
    )
    this.$ratio = query(`.${this.classes.RATIO}`, this.$ratioContent)
    this.$ratioTrigger = query('.pj-dropdown-trigger', this.$ratio)
    this.$posterContent = parseHTML(
      `<div class='${this.classes.COMPONENT}'><span class='${
        this.classes.COMTITLE
      }'>${this.translate('poster')}</span><div class='${
        this.classes.POSTER
      }'><span class='${
        this.classes.POSTERADD
      }'>${localePddPoster}</span><span class='${
        this.classes.POSTERCHANGE
      }'>${localeChangePoster}</span><span class='${
        this.classes.POSTERDELETE
      }'>${localeDelete}</span></div></div>`
    )
    this.$poster = query(`.${this.classes.POSTER}`, this.$posterContent)
    this.$btnAction = parseHTML(
      `<div class="${this.classes.BTNACTION}">
      <button class="pj-btn pj-btn-transparent ${
        this.classes.CANCEL
      }">${this.translate('cancel')}</button>
      <button class="pj-btn pj-btn-primary ${
        this.classes.SAVE
      }">${this.translate('save')}</button>
      </div>`
    )

    this.$dropdown.append(
      this.$preview,
      this.$source,
      this.$videoUrlContent,
      this.$localUrlContent,
      this.$ratioContent,
      this.$posterContent,
      this.$btnAction
    )
    // init source dropdown
    this.$defaultDropdown = Dropdown.of(this.$empty, {
      exclusive: false,
      templates: this.options.template,
      constraintToScrollParent: false,
      constraintToWindow: false,
      hideOnClick: false,
      hideOnSelect: false
    })

    this.$sourceDropdown = Dropdown.of(this.$sourceTrigger, {
      data: sourceData,
      width: 160,
      exclusive: false,
      imitateSelect: true,
      icon: 'icon-char icon-chevron-down',
      select: sourceData[0].label,
      templates: {
        panel() {
          return `<ul class='${that.classes.DROPDOWNPANEL}'></ul>`
        }
      },
      constraintToScrollParent: false,
      constraintToWindow: false
    })

    this.$ratioDropdown = Dropdown.of(this.$ratioTrigger, {
      data: ratioData,
      width: 160,
      exclusive: false,
      imitateSelect: true,
      icon: 'icon-char icon-chevron-down',
      select: ratioData[0].label,
      templates: {
        panel() {
          return `<ul class='${that.classes.DROPDOWNPANEL}'></ul>`
        }
      },
      constraintToScrollParent: false,
      constraintToWindow: false
    })
    // init eidtor panel
    // this.editPanel = EditPanel.of(this.element, {
    //   init: {
    //     icon: 'icon-chevron-circle-up',
    //     text: this.translate('inputPlaceholder')
    //   },
    //   hasSelector: false,
    //   components: [
    //     {
    //       title: this.translate('videoSource'),
    //       element: this.$source,
    //       type: 'dropdown',
    //       options: {
    //         data: sourceData,
    //         width: 160,
    //         imitateSelect: true,
    //         icon: 'icon-char icon-chevron-down',
    //         select: sourceData[0].label,
    //         templates: {
    //           panel() {
    //             return `<ul class='${that.classes.DROPDOWNPANEL}'></ul>`
    //           }
    //         },
    //         constraintToScrollParent: false,
    //         constraintToWindow: false
    //       }
    //     },
    //     {
    //       title: this.translate('videoURL'),
    //       element: this.$videoUrl
    //     },
    //     {
    //       title: this.translate('chooseVideo'),
    //       element: this.$localUrl
    //     },
    //     {
    //       title: this.translate('aspectRatio'),
    //       element: this.$ratio,
    //       type: 'dropdown',
    //       options: {
    //         data: ratioData,
    //         width: 160,
    //         imitateSelect: true,
    //         icon: 'icon-char icon-chevron-down',
    //         select: ratioData[0].label,
    //         templates: {
    //           panel() {
    //             return `<ul class='${that.classes.DROPDOWNPANEL}'></ul>`
    //           }
    //         },
    //         constraintToScrollParent: false,
    //         constraintToWindow: false
    //       }
    //     },
    //     {
    //       title: this.translate('poster'),
    //       element: this.$poster
    //     }
    //   ],
    //   action: {
    //     panel: {
    //       cancel: {
    //         title: this.translate('cancel'),
    //         class: ''
    //       },
    //       save: {
    //         title: this.translate('save'),
    //         class: ''
    //       }
    //     },
    //     selector: {
    //       cancel: {
    //         title: this.translate('cancel'),
    //         class: ''
    //       },
    //       save: {
    //         title: this.translate('useIt'),
    //         class: ''
    //       }
    //     }
    //   },
    //   templates: {
    //     wrap() {
    //       return `<div class='${that.classes.WRAP} {class}'></div>`
    //     },
    //     init() {
    //       return `<div class='{class} ${
    //         that.classes.INIT
    //       }'><i class='{icon}'></i>{text}</div>`
    //     },
    //     info() {
    //       return `<div class='{class}'><image class='{content} ${
    //         that.classes.INFOPOSTER
    //       }' /></div>`
    //     },
    //     infoAction() {
    //       return `<div class='{class}'><i class='icon-pencil-square ${
    //         that.classes.EDITOR
    //       }'></i><i class='icon-trash ${that.classes.REMOVE}'></i></div>`
    //     },
    //     previewContent() {
    //       return `<div class='${that.classes.VIDEOACTION}'>
    //           <i class='icon-chevron-circle-right ${that.classes.VIDEOBTN}'></i>
    //           <div class='${that.classes.VIDEOPOSTER}'></div>
    //           <div class="${
    //             that.classes.VIDEOANIMATE
    //           } cp-spinner cp-round"></div>
    //         </div>
    //         <div class='{class} ${that.classes.VIDEO}'></div>`
    //     },
    //     panel() {
    //       return `<section class='{class} ${that.classes.PANEL}'>
    //     <div class='{preview}'>
    //     </div>
    //   </section>`
    //     }
    //   }
    // })

    // hideElement(
    //   parentWith(el => el.matches('.pj-editPanel-component'), this.$localUrl)
    // )

    // this.changeSource = Dropdown.findInstanceByElement(query('.pj-dropdown-trigger', this.$source))
    // console.log(this.$sourceDropdown)
    // this.changeRatio = Dropdown.findInstanceByElement(this.$ratio)
    // console.log(Dropdown.findInstanceByElement(this.$ratio))

    // this.$wrap = parent()
    // this.$data = this.$wrap.find('.pj-editPanel-data');
    this.$infoCover = query(`.${this.classes.INFOPOSTER}`, this.$wrap)
    this.$video = query(`.${this.classes.VIDEO}`, this.$wrap)
    this.$urlInput = query('input', this.$videoUrl)
    this.$videoAction = query(`.${this.classes.VIDEOACTION}`, this.$wrap)
    this.$videoPoster = query(`.${this.classes.VIDEOPOSTER}`, this.$wrap)
    // this.$infoAction = parent(query(`.${this.classes.REMOVE}`, this.$wrap))
    console.log(this.$wrap)
    console.log(this.$infoCover)
    console.log(this.$urlInput)
    console.log(this.$videoPoster)
    console.log(this.$infoAction)
    // init popDialog
    this.pop = PopDialog.of(
      query(`.${this.classes.REMOVE}`, this.$infoAction),
      {
        content: this.translate('deleteTitle'),
        placement: 'bottom',
        buttons: {
          cancel: { label: localeCancel },
          delete: {
            label: localeDelete,
            color: 'danger',
            fn(resolve) {
              fadeOut(
                {
                  delay: 100,
                  callback: () => {
                    removeClass(that.classes.SHOW, that.$wrap)
                    that.removeVideo()
                    that.$infoCover.setAttribute({ src: '' })
                    fadeIn(that.$infoAction)
                  }
                },
                that.$infoAction
              )

              resolve()
            }
          }
        }
      }
    )
  }

  bind() {
    // pop event
    this.pop.options.onShow = () => {
      addClass(this.classes.SHOW, this.$wrap)
      this.enter('holdHover')
    }
    this.pop.options.onHide = () => {
      removeClass(this.classes.SHOW, this.$wrap)
      removeClass(this.classes.HOVER, this.$infoAction)
      this.leave('holdHover')
    }
    compose(
      // const that = this;
      // info actions
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.EDITOR}`,
        handler: () => {
          this.$defaultDropdown.show()
        }
      }),
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.REMOVE}`,
        handler: () => {
          this.$defaultDropdown.hide()
        }
      }),
      // info actions hover hold
      bindEvent({
        type: this.eventName('mouseover'),
        identity: '.pj-videoPicker-fill',
        handler: () => {
          addClass(this.classes.HOVER, this.$infoAction)
        }
      }),
      bindEvent({
        type: this.eventName('mouseout'),
        identity: '.pj-videoPicker-fill',
        handler: () => {
          if (this.is('holdHover')) {
            return
          }
          removeClass(this.classes.HOVER, this.$infoAction)
          return
        }
      }),

      // play video
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.VIDEOACTION}`,
        handler: () => {
          if (!this.is('loaded')) {
            this.loadVideo()
            return
          }

          if (!this.is('playing')) {
            addClass(this.classes.VIDEOPLAYING, this.$videoAction)
            this.videoApi.play()
            this.enter('playing')
          } else {
            removeClass(this.classes.VIDEOPLAYING, this.$videoAction)
            this.videoApi.pause()
            this.leave('playing')
            if (this.is('loaded') && this.$videoPoster) {
              setStyle(
                {
                  backgroundImage: ''
                },
                this.$videoPoster
              )
            }
          }
        }
      }),

      // input video url
      bindEvent({
        type: this.eventName('change'),
        identity: `.${this.classes.VIDEOURL} input`,
        handler: () => {
          removeClass(this.classes.WARNING, this.$urlInput).setAttribute(
            'placeholder',
            ''
          )

          this.data.url = this.$urlInput.value
          this.changeVideo()
          return false
        }
      }),
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.VIDEOURL} i`,
        handler: () => {
          this.removeVideo()
        }
      }),

      // local video
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.LOCALURLADD}`,
        handler: () => {
          this.data.url = this.options.selectLocalVideo.call(this)
          addClass(this.classes.LOCALURLSELECTED, this.$localUrl)
        }
      }),
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.LOCALURLDELETE}`,
        handler: () => {
          removeClass(this.classes.LOCALURLSELECTED, this.$localUrl)
          this.removeVideo()
        }
      }),
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.LOCALURLCHANGE}`,
        handler: () => {
          this.data.url = this.options.selectLocalVideo.call(this)
          this.changeVideo()
        }
      })
    )(this.$wrap)

    // change Video Source
    this.$sourceDropdown.options.onChange = el => {
      this.data.source = el.dataset.value

      if (this.data.source === 'Local File') {
        showElement(
          parentWith(
            el => el.matches('.pj-videoPicker-component'),
            this.$localUrl
          )
        )
        hideElement(
          parentWith(
            el => el.matches('.pj-videoPicker-component'),
            this.$videoUrl
          )
        )
      } else {
        hideElement(
          parentWith(
            el => el.matches('.pj-videoPicker-component'),
            this.$localUrl
          )
        )
        showElement(
          parentWith(
            el => el.matches('.pj-videoPicker-component'),
            this.$videoUrl
          )
        )
      }
      if (this.$videoPoster) {
        setStyle(
          {
            backgroundImage: ''
          },
          this.$videoPoster
        )
      }
      removeClass(this.classes.POSTERSELECTED, this.$poster)
      if (this.videoApi) {
        this.removeVideo()
      }
    }

    // change Ratio
    this.$ratioDropdown.options.onChange = el => {
      this.data.ratio = el.dataset.value
    }

    // change poster
    compose(
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.POSTERADD}`,
        handler: () => {
          this.addPoster(this.options.selectCover.call(this))
        }
      }),
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.POSTERCHANGE}`,
        handler: () => {
          this.addPoster(this.options.selectCover.call(this))
        }
      }),
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.POSTERDELETE}`,
        handler: () => {
          this.deletePoster()
        }
      })
    )(this.$wrap)

    compose(
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.CANCEL}`,
        handler: () => {
          this.$defaultDropdown.hide()
        }
      }),
      bindEvent({
        type: this.eventName('click'),
        identity: `.${this.classes.SAVE}`,
        handler: () => {
          this.$defaultDropdown.hide()
          addClass(this.classes.SHOW, this.$wrap)
        }
      })
    )(this.$btnAction)
    // panel update
    this.$defaultDropdown.options.onUpdate = () => {
      this.$infoCover.setAttribute('src', this.data.poster)

      if (this.videoApi) {
        this.videoApi.stop()
      }
      this.element.value = this.val()
      this.$defaultDropdown.hide()
      addClass(this.classes.SHOW, this.$wrap)
    }
  }

  addPoster(url) {
    this.data.poster = url
    addClass(this.classes.POSTERSELECTED, this.$poster)
    if (this.$videoPoster) {
      setStyle(
        {
          backgroundImage: `url(${this.data.poster})`
        },
        this.$videoPoster
      )
    }
  }

  deletePoster() {
    this.data.poster = ''
    removeClass(this.classes.POSTERSELECTED, this.$poster)
    setStyle(
      {
        backgroundImage: 'none'
      },
      this.$videoPoster
    )
  }

  unbind() {
    removeEvent(this.eventName(), this.$wrap)
  }

  changeVideo() {
    if (Video.findInstanceByElement(this.$video)) {
      this.videoApi.switchVideo(this.data.url)
    }
  }

  removeVideo() {
    this.data.poster = ''
    this.data.url = ''

    this.element.value = ''
    this.$urlInput.value = ''
    // this.$video.data('video', '')
    // this.videoApi = VideoPicker.of(this.$video)
    this.videoApi.destroy()
    query('.pj-video', this.$wrap).remove()
    setStyle(
      {
        backgroundImage: `url(${this.data.poster})`
      },
      this.$videoPoster
    )

    removeClass(this.classes.POSTERSELECTED, this.$poster)
    removeClass(this.classes.VIDEOPLAYING, this.$videoAction)
    removeClass(this.classes.VIDEOLOADING, this.$videoAction)

    this.leave('loaded')
    this.leave('playing')
  }

  loadVideo() {
    const url = this.data.url
    if (!url.replace(/(^\s*)|(\s*$)/g, '').length) {
      addClass(this.classes.WARNING, this.$urlInput).setAttribute(
        'placeholder',
        this.translate('inputURL')
      )

      return false
    }
    const videoConfig = { source: 'youtube' }

    switch (this.data.source) {
      case 'YouTube':
        videoConfig.type = 'youtube'
        break
      case 'Vimeo':
        videoConfig.type = 'vimeo'
        break
      default:
        videoConfig.type = 'html5'
        break
    }

    if (url.indexOf('http') === 0 || url.indexOf('https') === 0) {
      videoConfig.url = `${url}`
    } else {
      videoConfig.id = `${url}`
    }

    if (videoConfig.type === 'html5') {
      videoConfig.url = `${url}`
    }
    this.videoApi = Video.of(this.$video, videoConfig)

    this.videoApi.options.onLoad = () => {
      addClass(this.classes.VIDEOLOADING, this.$videoAction)
    }

    this.videoApi.options.onLoaded = () => {
      removeClass(this.classes.VIDEOLOADING, this.$videoAction)
      addClass(this.classes.VIDEOPLAYING, this.$videoAction)
    }

    this.videoApi.load()
    this.videoApi.setSize(contentWidth(this.$video), contentHeight(this.$video))

    this.enter('loaded')
    this.enter('playing')
    return false
  }

  update(data) {
    Object.entries(data).forEach(([label, value]) => {
      switch (label) {
        case 'source':
          this.options.sources.forEach(v => {
            if (v.toLowerCase() === value.toLowerCase()) {
              this.$sourceDropdown.set(v)
            }
          })
          break
        case 'url':
          this.$urlInput.value = value
          break
        case 'id':
          this.data.url = value
          this.$urlInput.value = value
          break
        case 'ratio':
          this.$ratioDropdown.set(value)
          break
        case 'poster':
          if (value) {
            this.addPoster(value)
          }
          break
        default:
          break
      }
    })

    this.$infoCover.setAttribute('src', this.data.poster)

    if (this.videoApi) {
      this.videoApi.stop()
    }
    this.element.value = this.val()
    addClass(this.classes.SHOW, this.$wrap)
  }

  set(data) {
    if (!data || typeof data === 'undefined') {
      return
    }

    this.data = Object.assign({}, this.data, data)
    this.update(this.data)
  }

  get() {
    if (!this.data.url || typeof this.data.url === 'undefined') {
      return null
    }

    return this.data
  }

  val(value) {
    if (typeof value === 'undefined') {
      const val = this.options.process.call(this, this.get())
      return val
    }

    this.set(this.options.parse.call(this, value))
    return null
  }

  enable() {
    if (this.is('disabled')) {
      // this.element.enable()
      this.element.disabled = false
      this.leave('disabled')
      removeClass(this.classes.DISABLED, this.$wrap)
    }
    this.trigger(EVENTS.ENABLE)
  }

  disable() {
    if (!this.is('disabled')) {
      // this.element.disable()
      this.element.disabled = true
      this.enter('disabled')
      addClass(this.classes.DISABLED, this.$wrap)
    }
    this.trigger(EVENTS.DISABLE)
  }

  destroy() {
    if (this.is('initialized')) {
      this.unbind()
      // this.element.destroy()
      removeClass(this.classes.NAMESPACE, this.element)
      if (this.options.theme) {
        removeClass(this.getThemeClass(), this.element)
      }
      this.leave('initialized')
    }

    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }
}

export default VideoPicker
