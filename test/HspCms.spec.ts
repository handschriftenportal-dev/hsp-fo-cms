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

(global as any).fetch = jest.fn()

import { createHspCms } from 'src/HspCms'
import { defaultConfig } from 'src/contexts/config'


test('addEventListener', function(done) {
  const cms = createHspCms(defaultConfig)
  cms.addEventListener('linkClicked', e => {
    expect(e.detail.href).toBe('http://example.com/foo')
    done()
  })
  cms.eventTarget.dispatchEvent(
    new CustomEvent('linkClicked', {
      detail: new URL('http://example.com/foo')
    }))
})

test('getConfig returns the config values passed to the constructor', function() {
  const config = createHspCms(defaultConfig).getConfig()
  expect(config).toEqual(defaultConfig)
})

test('mount, umount, isMounted', async function() {
  const mainContainer = document.createElement('div')
  document.body.appendChild(mainContainer)

  const cms = createHspCms(defaultConfig)

  expect(document.getElementById('hsp-cms-root')).toBeNull()
  expect(cms.isMounted()).toBe(false)

  await cms.mount({
    main: mainContainer,
  })
  expect(document.getElementById('hsp-cms-root')).not.toBeNull()
  expect(cms.isMounted()).toBe(true)

  // Nothing should change here because we did not invoke unmount()
  // before we call mount() a second time. So this call should be ignored.
  await cms.mount({
    main: null,
  })
  expect(document.getElementById('hsp-cms-root')).not.toBeNull()
  expect(cms.isMounted()).toBe(true)

  await cms.unmount()
  expect(document.getElementById('hsp-cms-root')).toBeNull()
  expect(cms.isMounted()).toBe(false)

  await cms.unmount()
  // At least one container element must be given
  await expect(cms.mount({
    main: null,
  })).rejects.toThrow()
})

test('setLocation and getLocation', function() {
  const location = {
    path: '/foo',
    params: new URLSearchParams('q=bar'),
    hash: 'baz',
  }

  const cms = createHspCms(defaultConfig)
  cms.setLocation(location)

  expect(cms.getLocation()).toEqual(location)
})


test('setLanguage and getLanguage', function() {
  const cms = createHspCms(defaultConfig)
  expect(cms.getLanguage()).toBe('de')
  cms.setLanguage('en')
  expect(cms.getLanguage()).toBe('en')
})
