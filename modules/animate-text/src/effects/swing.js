import anime from 'animejs'
import { setStyle } from '@pluginjs/styled'
import { text, queryAll } from '@pluginjs/dom'

class Swing {
  constructor(instance) {
    this.instance = instance
    this.options = this.instance.options
    this.element = this.instance.element
    this.initialize()
    this.setupAnime()
  }

  initialize() {
    this.text = text(this.element)
    text('', this.element)
    this.instance.splitWord(this.text)
    const words = queryAll(`.${this.instance.classes.WORD}`, this.element)
    words.forEach(word => {
      setStyle('transform-origin', 'top center', word)
    })
  }

  setupAnime() {
    const options = {
      targets: queryAll(`.${this.instance.classes.WORD}`, this.element),
      rotateZ: [-5, 5, -10, 10, 0],
      duration: this.options.duration || 1000,
      easing: 'easeInOutSine',
      delay: this.options.delay
    }

    anime
      .timeline({
        loop: this.options.loop || false
      })
      .add(options)
      .add({})
  }
}

export default Swing
