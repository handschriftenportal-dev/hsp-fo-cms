/*
 * MIT License
 *
 * Copyright (c) 2021 Staatsbibliothek zu Berlin - Preußischer Kulturbesitz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TestProviders, mockLocation } from 'test/testutils'
import { Link, LinkInfo } from 'src/contexts/routing'
import { Config, defaultConfig } from 'src/contexts/config'
import * as i18n from 'src/contexts/i18n'
import { LanguageMap } from 'src/contexts/types'


const hrefDe = 'http://example.com/foo?q=de'
const hrefEn = 'http://example.com/foo?q=en'
const hrefDeRel = '/foo?q=de'

const createAbsoluteURL: Config['createAbsoluteURL'] = (location) => {
  const url = new URL('/prefix' + location.path, window.location.origin)
  url.search = location.params.toString()
  url.hash = location.hash
  return url
}

function renderLink(
  config: Required<Config>,
  linkInfo: LinkInfo,
  eventTarget?: EventTarget,
  role?: string,
  ariaLabel?: string | LanguageMap,
) {
  const providerProps = eventTarget
    ? { config, eventTarget }
    : { config }

  render(
    <TestProviders { ...providerProps }>
      <Link linkInfo={linkInfo} role={role} ariaLabel={ariaLabel}>
        clickme
      </Link>
    </TestProviders>
  )
}

describe('routing disabled', function() {
  let config: Required<Config>
  let eventTarget: EventTarget

  beforeEach(() => {
    mockLocation()
    config = { ...defaultConfig, enableRouting: false }
    eventTarget = new EventTarget()
  })

  describe('LinkInfo is a href string', function() {

    // ----------------------------------------------------
    test('renders an <a> element with the href (abs) from LinkInfo', function() {
      renderLink(config, hrefDe)
      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.getAttribute('href')).toBe(hrefDe)
    })

    // ----------------------------------------------------
    test('renders an <a> element with the href (rel) from LinkInfo', function() {
      renderLink(config, hrefDeRel)
      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.getAttribute('href')).toBe(hrefDeRel)
    })

    // ------------------------------------------------------
    test(`a click on the <a> element sets window.location.href
      to the href from LinkInfo`, function() {
      renderLink(config, hrefDe)
      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)
      expect(window.location.href).toBe(hrefDe)
    })

    // ------------------------------------------------------
    test(`a click on the <a> element triggers the "linkClicked"
      event with the correct url`, function() {
      const listener = jest.fn()

      eventTarget.addEventListener('linkClicked', listener)
      renderLink(config, hrefDe, eventTarget)
      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)

      const detail = listener.mock.calls[0][0].detail
      expect(detail.href).toBe(hrefDe)
      // because we did not call preventDefault()
      expect(window.location.href).toBe(hrefDe)
    })

    // ------------------------------------------------------
    test('it is possible to call preventDefault on the "linkClicked" event', function() {
      const listener = jest.fn(e => {
        e.preventDefault()
      })

      eventTarget.addEventListener('linkClicked', listener)
      renderLink(config, hrefDe, eventTarget)
      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)

      const detail = listener.mock.calls[0][0].detail
      expect(detail.href).toBe(hrefDe)
      // because we called preventDefault()
      expect(window.location.href).toBe('http://example.com/')
    })

    // ------------------------------------------------------
    test('default aria role of the link is "link"', function() {
      renderLink(config, hrefDe)
      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('passed aria props will be set to to resulting <a>-Element', function() {
      renderLink(config, hrefDe, undefined, 'button', 'do something')
      const a = screen.getByRole('button', { name: 'do something' })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('the ariaLabel prop can be a language map', function() {
      // set module language to en
      jest.spyOn(i18n, 'useLanguage').mockImplementationOnce(() => 'en')
      renderLink(config, hrefDe, undefined, undefined, {
        de: 'zurück zur startseite',
        en: 'back to home page'
      })
      screen.getByRole('link', { name: 'back to home page' })
    })
  })

  describe('LinkInfo is an ExternLink', function() {

    // ----------------------------------------------------
    test('renders an <a> element with the href from LinkInfo and target="_blank"', function() {
      renderLink(config, {
        extern: true,
        href: hrefDe
      })

      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.getAttribute('href')).toBe(hrefDe)
      expect(a.getAttribute('target')).toBe('_blank')
    })

    // ------------------------------------------------------
    test('a click on the <a> element does NOT set window.location.href', function() {
      renderLink(config, {
        extern: true,
        href: hrefDe
      })

      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)
      expect(window.location.href).toBe('http://example.com/')
    })

    // ------------------------------------------------------
    test(`a click on the <a> element does NOT trigger the 
      "linkClicked" event`, function() {
      const listener = jest.fn()

      eventTarget.addEventListener('linkClicked', listener)

      renderLink(config, {
        extern: true,
        href: hrefDe
      }, eventTarget)

      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)

      expect(listener).not.toHaveBeenCalled()
    })

    // ------------------------------------------------------
    test(`if the external link contains language specific links
      then render the correct language link`, function() {

      // set module language to en
      jest.spyOn(i18n, 'useLanguage')
        .mockImplementationOnce(() => 'en')

      renderLink(config, {
        extern: true,
        href: {
          de: hrefDe,
          en: hrefEn,
        }
      })

      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.getAttribute('href')).toBe(hrefEn)
    })

    // ------------------------------------------------------
    test('default aria role of the link is "link"', function() {
      renderLink(config, hrefDe)
      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('passed aria props will be set to to resulting <a>-Element', function() {
      renderLink(config, hrefDe, undefined, 'button', 'do something')
      const a = screen.getByRole('button', { name: 'do something' })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('the ariaLabel prop can be a language map', function() {
      // set module language to en
      jest.spyOn(i18n, 'useLanguage').mockImplementationOnce(() => 'en')
      renderLink(config, hrefDe, undefined, undefined, {
        de: 'zurück zur startseite',
        en: 'back to home page'
      })
      screen.getByRole('link', { name: 'back to home page' })
    })
  })

  describe('LinkInfo is a WebModuleLocation', function() {

    // ----------------------------------------------------
    test(`renders an <a> element with the href returned
      from config.createAbsoluteURL`, function() {

      renderLink({ ...config, createAbsoluteURL }, {
        path: '/foo',
        params: new URLSearchParams('bar=23'),
        hash: ''
      })

      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.getAttribute('href')).toBe('http://example.com/prefix/foo?bar=23')
    })

    // ------------------------------------------------------
    test(`a click on the <a> element sets window.location.href
      to the href returned from config.createAbsoluteURL`, function() {

      renderLink({ ...config, createAbsoluteURL }, {
        path: '/foo',
        params: new URLSearchParams('bar=23'),
        hash: ''
      })

      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)
      expect(window.location.href).toBe('http://example.com/prefix/foo?bar=23')
    })

    // ------------------------------------------------------
    test(`a click on the <a> element triggers the "linkClicked"
      event with the correct url`, function() {
      const listener = jest.fn()
      eventTarget.addEventListener('linkClicked', listener)

      renderLink({ ...config, createAbsoluteURL }, {
        path: '/foo',
        params: new URLSearchParams('bar=23'),
        hash: ''
      }, eventTarget)

      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)

      const detail = listener.mock.calls[0][0].detail
      expect(detail.href).toBe('http://example.com/prefix/foo?bar=23')
      // because we did not call preventDefault()
      expect(window.location.href).toBe('http://example.com/prefix/foo?bar=23')
    })

    // ------------------------------------------------------
    test('it is possible to call preventDefault on the "linkClicked" event', function() {
      const listener = jest.fn(e => {
        e.preventDefault()
      })

      eventTarget.addEventListener('linkClicked', listener)

      renderLink({ ...config, createAbsoluteURL }, {
        path: '/foo',
        params: new URLSearchParams('bar=23'),
        hash: ''
      }, eventTarget)

      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)

      const detail = listener.mock.calls[0][0].detail
      expect(detail.href).toBe('http://example.com/prefix/foo?bar=23')
      // because we called preventDefault()
      expect(window.location.href).toBe('http://example.com/')
    })

    // ------------------------------------------------------
    test('default aria role of the link is "link"', function() {
      renderLink(config, hrefDe)
      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('passed aria props will be set to to resulting <a>-Element', function() {
      renderLink(config, hrefDe, undefined, 'button', 'do something')
      const a = screen.getByRole('button', { name: 'do something' })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('the ariaLabel prop can be a language map', function() {
      // set module language to en
      jest.spyOn(i18n, 'useLanguage').mockImplementationOnce(() => 'en')
      renderLink(config, hrefDe, undefined, undefined, {
        de: 'zurück zur startseite',
        en: 'back to home page'
      })
      screen.getByRole('link', { name: 'back to home page' })
    })
  })
})


describe('routing enabled', function() {
  let config: Required<Config>
  let eventTarget: EventTarget

  beforeEach(() => {
    mockLocation()
    config = { ...defaultConfig, enableRouting: true }
    eventTarget = new EventTarget()
  })

  describe('LinkInfo is a href string', function() {

    // ----------------------------------------------------
    test(`renders an <a> element (via react-router) with the href from
      LinkInfo but without the origin part.`, function() {
      renderLink(config, hrefDe)
      screen.getByTestId('react-router-link')
      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.getAttribute('href')).toBe('/foo?q=de')
    })

    // ------------------------------------------------------
    test('a click on the <a> element does NOT trigger the "linkClicked" event', function() {
      const listener = jest.fn()
      eventTarget.addEventListener('linkClicked', listener)
      renderLink(config, hrefDe, eventTarget)
      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)
      expect(listener).not.toHaveBeenCalled()
    })

    // ------------------------------------------------------
    test('default aria role of the link is "link"', function() {
      renderLink(config, hrefDe)
      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('passed aria props will be set to to resulting <a>-Element', function() {
      renderLink(config, hrefDe, undefined, 'button', 'do something')
      const a = screen.getByRole('button', { name: 'do something' })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('the ariaLabel prop can be a language map', function() {
      // set module language to en
      jest.spyOn(i18n, 'useLanguage').mockImplementationOnce(() => 'en')
      renderLink(config, hrefDe, undefined, undefined, {
        de: 'zurück zur startseite',
        en: 'back to home page'
      })
      screen.getByRole('link', { name: 'back to home page' })
    })
  })

  describe('LinkInfo is an ExternLink', function() {

    // ----------------------------------------------------
    test('renders an <a> element with the href from LinkInfo and target="_blank"', function() {
      renderLink(config, {
        extern: true,
        href: hrefDe
      })

      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.getAttribute('href')).toBe(hrefDe)
      expect(a.getAttribute('target')).toBe('_blank')
    })

    // ------------------------------------------------------
    test('a click on the <a> element does NOT set window.location.href', function() {
      renderLink(config, {
        extern: true,
        href: hrefDe
      })

      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)
      expect(window.location.href).toBe('http://example.com/')
    })

    // ------------------------------------------------------
    test(`a click on the <a> element does NOT trigger the 
      "linkClicked" event`, function() {
      const listener = jest.fn()

      eventTarget.addEventListener('linkClicked', listener)

      renderLink(config, {
        extern: true,
        href: hrefDe
      }, eventTarget)

      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)

      expect(listener).not.toHaveBeenCalled()
    })

    // ------------------------------------------------------
    test(`if the external link contains language specific links
      then render the correct language link`, function() {

      // set module language to en
      jest.spyOn(i18n, 'useLanguage')
        .mockImplementationOnce(() => 'en')

      renderLink(config, {
        extern: true,
        href: {
          de: hrefDe,
          en: hrefEn,
        }
      })

      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.getAttribute('href')).toBe(hrefEn)
    })

    // ------------------------------------------------------
    test('default aria role of the link is "link"', function() {
      renderLink(config, hrefDe)
      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('passed aria props will be set to to resulting <a>-Element', function() {
      renderLink(config, hrefDe, undefined, 'button', 'do something')
      const a = screen.getByRole('button', { name: 'do something' })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('the ariaLabel prop can be a language map', function() {
      // set module language to en
      jest.spyOn(i18n, 'useLanguage').mockImplementationOnce(() => 'en')
      renderLink(config, hrefDe, undefined, undefined, {
        de: 'zurück zur startseite',
        en: 'back to home page'
      })
      screen.getByRole('link', { name: 'back to home page' })
    })
  })

  describe('LinkInfo is a WebModuleLocation', function() {

    // ----------------------------------------------------
    test(`renders an <a> element (via react-router) with the href
      created from WebModuleLocation.`, function() {

      renderLink({ ...config, createAbsoluteURL }, {
        path: '/foo',
        params: new URLSearchParams('bar=23'),
        hash: ''
      })

      screen.getByTestId('react-router-link')
      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.getAttribute('href')).toBe('/prefix/foo?bar=23')
    })

    // ------------------------------------------------------
    test('a click on the <a> element does NOT trigger the "linkClicked" event', function() {
      const listener = jest.fn()
      eventTarget.addEventListener('linkClicked', listener)

      renderLink({ ...config }, {
        path: '/foo',
        params: new URLSearchParams('bar=23'),
        hash: ''
      }, eventTarget)

      const a = screen.getByRole('link', { name: /clickme/i })
      fireEvent.click(a)
      expect(listener).not.toHaveBeenCalled()
    })

    // ------------------------------------------------------
    test('default aria role of the link is "link"', function() {
      renderLink(config, hrefDe)
      const a = screen.getByRole('link', { name: /clickme/i })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('passed aria props will be set to to resulting <a>-Element', function() {
      renderLink(config, hrefDe, undefined, 'button', 'do something')
      const a = screen.getByRole('button', { name: 'do something' })
      expect(a.tagName).toBe('A')
    })

    // ------------------------------------------------------
    test('the ariaLabel prop can be a language map', function() {
      // set module language to en
      jest.spyOn(i18n, 'useLanguage').mockImplementationOnce(() => 'en')
      renderLink(config, hrefDe, undefined, undefined, {
        de: 'zurück zur startseite',
        en: 'back to home page'
      })
      screen.getByRole('link', { name: 'back to home page' })
    })
  })
})
