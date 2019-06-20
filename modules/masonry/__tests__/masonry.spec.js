import Masonry from '../src/main'
import { defaults as DEFAULTS } from '../src/constant'
import generateHTMLSample from './fixtures/sample'

describe('Masonry', () => {
  describe('Masonry()', () => {
    test('should have Masonry', () => {
      expect(Masonry).toBeFunction()
    })

    test('should have defaults', () => {
      expect(Masonry.defaults).toBeObject()
    })

    test('should have events', () => {
      expect(Masonry.events).toBeObject()
    })

    test('should have classes', () => {
      expect(Masonry.classes).toBeObject()
    })

    test('should have methods', () => {
      expect(Masonry.methods).toBeArray()
    })
  })

  describe('constructor()', () => {
    test('should work wtesth element', () => {
      const masonry = Masonry.of(generateHTMLSample())

      expect(masonry).toBeObject()
      expect(masonry.options).toEqual(DEFAULTS)
    })

    test('should have options', () => {
      const masonry = Masonry.of(generateHTMLSample())

      expect(masonry.options).toBeObject()
    })
  })

  describe('initialized()', () => {
    let $element

    beforeEach(() => {
      $element = generateHTMLSample()
    })

    test('should trigger ready event', () => {
      let called = 0
      $element.addEventListener('masonry:ready', () => {
        called++
      })
      const instance = Masonry.of($element)
      expect(called).toEqual(1)
      expect(instance.is('initialized')).toBeTrue()
    })
  })
})
