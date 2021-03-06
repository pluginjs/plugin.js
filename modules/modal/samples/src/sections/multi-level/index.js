import { query } from '@pluginjs/dom'
import Modal from '@pluginjs/modal'

const root = query('#multi-level')
const prompt = {
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  title: 'Modal title',
  buttons: [
    {
      action: 'active',
      label: 'Open Modal',
      classes: 'pj-btn',
      fn: resolve => {
        resolve()
        Modal.open(pop)
      }
    }
  ]
}
const pop = {
  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  buttons: [
    {
      action: 'active',
      label: 'Open Modal',
      classes: 'pj-btn',
      fn: resolve => {
        resolve()
        Modal.open(alert)
      }
    }
  ]
}

const alert = {
  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
}

query('.multi-level', root).addEventListener('click', () => {
  Modal.open(prompt)
})
