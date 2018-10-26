import Fade from './fade'

class FadeRight extends Fade {
  constructor(instance) {
    super(instance)
    this.setupAnime({ translateX: [-20, 0] })
  }
}

export default FadeRight
