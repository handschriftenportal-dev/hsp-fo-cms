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

import { createTranslate, createTranslateTemplate } from 'src/contexts/i18n'

const en = {
  ok: 'OK',
  sidebar: {
    home: 'Home',
    about:
      'About {{topic}} and {{other}} but first and foremost about {{topic}}',
    menu: {
      login: 'Login',
      share: 'Share',
    },
  },
}

describe('translate function', function () {
  const t = createTranslate(en, false)

  it('key can be a single string', function () {
    expect(t('ok')).toBe('OK')
  })

  it('can handle multiple keys', function () {
    expect(t('sidebar', 'menu', 'login')).toBe('Login')
  })

  it('if the last key is a string[] than join the result by comma', function () {
    expect(t('sidebar', 'menu', ['login', 'share'])).toBe('Login, Share')
  })

  it('returns the last key if translation could not be found', function () {
    expect(t('foo')).toBe('foo')
    expect(t('foo', 'bar', 'baz')).toBe('baz')
    expect(t('foo', ['bar', 'baz'])).toBe('bar, baz')
  })

  it('if the last key is neither string nor string[] return it', function () {
    expect(t(3)).toBe(3)
    expect(t(false)).toBe(false)
    expect(t(null)).toBe(null)
    expect(t('sidebar', 'menu', 3)).toBe(3)
  })

  it('if translation is disabled join all keys and return them', function () {
    const t = createTranslate(en, true)

    expect(t('foo')).toBe('foo')
    expect(t('ok', 'sidebar')).toBe('ok.sidebar')
    expect(t('sidebar', 'menu', 'logout')).toBe('sidebar.menu.logout')
    expect(t(null)).toBe('')
    expect(t('sidebar', null)).toBe('sidebar.')
    expect(t('sidebar', 3)).toBe('sidebar.3')
    expect(t('sidebar', ['foo', 'bar'])).toBe('sidebar.foo,bar')
  })
})

describe('translateTemplate function', function () {
  const tt = createTranslateTemplate(en, false)

  it(`behaves like the simple translation function
    if it does not match a template string`, function () {
    expect(tt({}, 'ok')).toBe('OK')
    expect(tt({}, 'sidebar', 'menu', 'login')).toBe('Login')
  })

  it(`replaces all tags in a template string according to
    the passed map`, function () {
    const fillers = { topic: 'foo', other: 'bar' }
    expect(tt(fillers, 'sidebar', 'about')).toBe(
      'About foo and bar but first and foremost about foo'
    )
  })
})
