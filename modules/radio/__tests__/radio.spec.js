import Radio from '../src/main'
import { defaults as DEFAULTS } from '../src/constant'
import generateHTMLSample from './fixtures/sample'

describe('Radio', () => {
  describe('Radio()', () => {
    test('should have Radio', () => {
      expect(Radio).toBeFunction()
    })

    test('should have defaults', () => {
      expect(Radio.defaults).toBeObject()
    })

    test('should have events', () => {
      expect(Radio.events).toBeObject()
    })

    test('should have classes', () => {
      expect(Radio.classes).toBeObject()
    })

    test('should have methods', () => {
      expect(Radio.methods).toBeArray()
    })
  })

  describe('constructor()', () => {
    test('should work with element', () => {
      const radio = Radio.of(generateHTMLSample().querySelector('input'))

      expect(radio).toBeObject()
      expect(radio.options).toEqual(DEFAULTS)
    })

    test('should have options', () => {
      const radio = Radio.of(generateHTMLSample().querySelector('input'))

      expect(radio.options).toBeObject()
    })
  })

  describe('jquery constructor', () => {
    test('should works with jquery fn', () => {
      const $element = generateHTMLSample().querySelector('input')
      const api = Radio.of($element)

      expect(api).toEqual(api)
      expect(api).toBeObject()
      expect(api.options).toBeObject()
    })
  })

  describe('classes', () => {
    test('should use classes options', () => {
      const radio = Radio.of(generateHTMLSample().querySelector('input'), {
        classes: {
          label: '{namespace}-wrap',
          checked: '{namespace}-checked'
        }
      })

      expect(radio.classes.LABEL).toEqual('pj-radio-wrap')
      expect(radio.classes.CHECKED).toEqual('pj-radio-checked')
    })

    test('should override class namespace', () => {
      const radio = Radio.of(generateHTMLSample().querySelector('input'), {
        classes: {
          namespace: 'radio',
          label: '{namespace}-label'
        }
      })

      expect(radio.classes.NAMESPACE).toEqual('radio')
      expect(radio.classes.LABEL).toEqual('radio-label')
    })

    describe('getClass()', () => {
      test('should get class with namespace', () => {
        const radio = Radio.of(generateHTMLSample().querySelector('input'), {
          classes: { namespace: 'hello' }
        })
        expect(radio.getClass('foo')).toEqual('foo')
        expect(radio.getClass('{namespace}-foo')).toEqual('hello-foo')
      })
    })
  })

  describe('api call', () => {
    test('should not call bind', () => {
      const $element = Radio.of(generateHTMLSample().querySelector('input'))
      expect($element.bind()).toBeNil()
    })

    test('should call destroy', () => {
      const $element = Radio.of(generateHTMLSample().querySelector('input'))
      $element.destroy()
    })
  })

  describe('initialize()', () => {
    let $element

    beforeEach(() => {
      $element = generateHTMLSample().querySelector('input')
    })

    test('should trigger ready event', () => {
      let called = 0

      $element.addEventListener('radio:ready', () => {
        called++
      })

      const api = Radio.of($element)
      expect(called).toEqual(1)
      expect(api.is('initialized')).toBeTrue()
    })
  })

  describe('change', () => {
    let $element
    let api

    it('should not fired when initialize', () => {
      let called = false
      $element = generateHTMLSample().querySelector('input')
      api = Radio.of($element, {
        onChange() {
          called = true
        }
      })

      expect(called).toBeFalse()
    })

    it('should fired when change the value', () => {
      let called = false
      $element = generateHTMLSample().querySelector('input')
      api = Radio.of($element, {
        onChange(value) {
          called = true

          expect(value).toBeString()
        }
      })

      api.val('foo')

      expect(called).toBeTrue()
    })

    it('should fired when set the value', () => {
      let called = false
      $element = generateHTMLSample().querySelector('input')
      api = Radio.of($element, {
        onChange(value) {
          called = true

          expect(value).toBeString()
        }
      })

      api.set('foo')
      expect(called).toBeTrue()
    })
  })

  describe('get()', () => {
    let $element
    let api

    beforeEach(() => {
      $element = generateHTMLSample().querySelector('input')
      api = Radio.of($element)
    })

    test('should get the value', () => {
      expect(api.get()).toBeArray()
    })
  })

  describe('set()', () => {
    let $element
    let api

    beforeEach(() => {
      $element = generateHTMLSample().querySelector('input')
      api = Radio.of($element)
    })

    test('should set the value', () => {
      expect(api.get()).toBeArray()

      api.set(false)
      expect(api.get()).toBeArray()

      api.set(true)
      expect(api.get()).toBeArray()
    })

    test('should set the value with string', () => {
      expect(api.get()).toBeArray()

      api.set('false')
      expect(api.get()).toBeArray()

      api.set('true')
      expect(api.get()).toBeArray()
    })

    test('should set the value with number', () => {
      expect(api.get()).toBeArray()

      api.set(0)
      expect(api.get()).toBeArray()

      api.set(1)
      expect(api.get()).toBeArray()
    })
  })

  describe('val()', () => {
    let $element
    let api

    beforeEach(() => {
      $element = generateHTMLSample().querySelector('input')
      api = Radio.of($element)
    })

    test('should get the value', () => {
      expect(api.val()).toBeArray()
    })

    test('should set the value', () => {
      api.val(false)

      expect(api.get()).toBeArray()

      api.val(true)

      expect(api.get()).toBeArray()
    })

    test('should set the value with string', () => {
      api.val('false')

      expect(api.get()).toBeArray()

      api.val('true')

      expect(api.get()).toBeArray()
    })

    test('should set the value with number', () => {
      expect(api.get()).toBeArray()

      api.val(0)
      expect(api.get()).toBeArray()

      api.val(1)
      expect(api.get()).toBeArray()
    })
  })

  describe('destroy()', () => {
    let $element
    let api

    beforeEach(() => {
      $element = generateHTMLSample().querySelector('input')
      api = Radio.of($element)
    })

    test('should trigger destroy event', () => {
      let called = 0

      $element.addEventListener('radio:destroy', () => {
        called++
      })

      api.destroy()

      expect(called).toEqual(1)
      expect(api.is('initialized')).toBeFalse()
    })
  })

  describe('enable()', () => {
    let $element
    let api

    beforeEach(() => {
      $element = generateHTMLSample().querySelector('input')
      api = Radio.of($element)
    })

    test('should enable the plugin', () => {
      api.disable()
      api.enable()

      expect(api.is('disabled')).toBeFalse()
    })

    test('should trigger enable event', () => {
      let called = 0

      $element.addEventListener('radio:enable', () => {
        called++
      })

      api.enable()
      expect(called).toEqual(1)
      expect(api.is('disabled')).toBeFalse()
    })
  })

  describe('disable()', () => {
    let $element
    let api

    beforeEach(() => {
      $element = generateHTMLSample().querySelector('input')
      api = Radio.of($element)
    })

    test('should disable the plugin', () => {
      api.disable()

      expect(api.is('disabled')).toBeTrue()
    })

    test('should trigger disable event', () => {
      let called = 0

      $element.addEventListener('radio:disable', () => {
        called++
      })

      api.disable()
      expect(called).toEqual(1)
      expect(api.is('disabled')).toBeTrue()
    })
  })
})
