import { deepMerge } from '@pluginjs/utils'
import templateEngine from '@pluginjs/template'
import { query, append, prepend, parseHTML } from '@pluginjs/dom'
import is from '@pluginjs/is'
import { updateDomValue } from '../util'
import { labelMap as LABELMAP } from '../constant'

class Flip {
  constructor(instance) {
    this.options = deepMerge(Flip.defaults, instance.options.modes.flip)

    this.lastTime = []
    this.currenTime = []

    this.instance = instance
  }

  html(type, getLabel) {
    const flip = []
    const label = []

    let $flip
    let $label

    flip[type] = templateEngine.render(this.options.template.call(this), {
      classes: this.instance.classes,
      labelType: getLabel.labelMap
    })

    label[type] = templateEngine.render(
      this.instance.options.templates.label(),
      {
        classes: this.instance.classes,
        text: getLabel.labelName
      }
    )

    for (type in flip) {
      if (Object.prototype.hasOwnProperty.call(flip, type)) {
        $flip = parseHTML(flip[type])
        $label = parseHTML(label[type])

        if (this.instance.options.labelPosition === 'above') {
          $label.classList.add(this.instance.getClass('above'))
          prepend($label, $flip)
        } else {
          append($label, $flip)
        }

        append($flip, this.instance.element)
      }
    }
  }

  animate(countDownTime, type) {
    // about flip time
    const name = LABELMAP[type]

    this.currenTime[type] = countDownTime.current

    this.setFlipAnimation(`.${name}`)

    if (!is.undefined(this.lastTime[type])) {
      updateDomValue(
        `.${this.instance.classes.CURR}.${this.instance.classes.TOP}.${
          this.instance.classes.NAMESPACE
        }-${name}`,
        this.instance.element,
        this.lastTime[type]
      )

      updateDomValue(
        `.${this.instance.classes.CURR}.${this.instance.classes.BOTTOM}.${
          this.instance.classes.NAMESPACE
        }-${name}`,
        this.instance.element,
        this.lastTime[type]
      )
    }

    updateDomValue(
      `.${this.instance.classes.NEXT}.${this.instance.classes.TOP}.${
        this.instance.classes.NAMESPACE
      }-${name}`,
      this.instance.element,
      this.currenTime[type]
    )

    updateDomValue(
      `.${this.instance.classes.NEXT}.${this.instance.classes.BOTTOM}.${
        this.instance.classes.NAMESPACE
      }-${name}`,
      this.instance.element,
      this.currenTime[type]
    )

    this.lastTime[type] = this.currenTime[type]
  }

  // flip animation
  setFlipAnimation(className) {
    const dom = query(className, this.instance.element)

    if (dom) {
      for (const type in this.lastTime) {
        if (this.lastTime[type] !== this.currenTime[type]) {
          dom.classList.remove(`${this.instance.classes.FLIPANIMATION}`)

          setTimeout(() => {
            dom.classList.add(`${this.instance.classes.FLIPANIMATION}`)
          }, 50)
        }
      }
    }
  }
}

Flip.defaults = {
  template() {
    return `<div class="{classes.TIME} {labelType}">
                    <span class="{classes.NUMBER} {classes.NAMESPACE}-{labelType} {classes.FLIPANIMATION} {classes.CURR} {classes.TOP}"></span>
                    <span class="{classes.NUMBER} {classes.NAMESPACE}-{labelType} {classes.FLIPANIMATION} {classes.NEXT} {classes.TOP}"></span>
                    <span class="{classes.NUMBER} {classes.NAMESPACE}-{labelType} {classes.FLIPANIMATION} {classes.NEXT} {classes.BOTTOM}"></span>
                    <span class="{classes.NUMBER} {classes.NAMESPACE}-{labelType} {classes.FLIPANIMATION} {classes.CURR} {classes.BOTTOM}"></span>
                  </div>`
  }
}

Flip.classes = {
  FLIP: '{namespace}-flip',
  CURR: '{namespace}-curr',
  NEXT: '{namespace}-next',
  TOP: '{namespace}-top',
  BOTTOM: '{namespace}-bottom',
  FLIPANIMATION: '{namespace}-flip-animation'
}

export default Flip