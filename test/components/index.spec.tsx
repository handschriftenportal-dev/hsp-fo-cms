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
import { render } from '@testing-library/react'
import { TestProviders } from '../testutils'
import { fetchWordpressMenus, fetchWordpressPage } from 'src/contexts/wordpress'
import { getPageIdFromParams } from 'src/contexts/location'
import Main from 'src/components/Main'

jest.mock('src/contexts/wordpress')
jest.mock('src/contexts/location')
const fetchWordpressPageMock = (fetchWordpressPage as unknown) as jest.Mock
const fetchWordpressMenusMock = (fetchWordpressMenus as unknown) as jest.Mock
const getPageIdFromParamsMock = (getPageIdFromParams as unknown) as jest.Mock

fetchWordpressPageMock.mockImplementation((wordpressEndpoint: string, id: string) => {
  return Promise.resolve({
    'id': id,
    'title': {
      'rendered': 'Foobar'
    },
    'content': {
      'rendered': '<p>Bla</p>'
    }
  })
})

fetchWordpressMenusMock.mockImplementation((wordpressEndpoint: string, language: string) => {
  return Promise.resolve([{
    'object_id': 42,
    'title': 'aboutUs',
    'children': [{
      'object_id': 51,
      'title': 'Foobar-' + language
    }]
  }])
})

getPageIdFromParamsMock.mockImplementation(() => {
  return 51
})

function renderCms() {
  render(
    <TestProviders>
      <Main />
    </TestProviders>
  )
}

describe('<CMS/>', function() {
  it('has cms root node', async () => {
    renderCms()
    await expect(document.getElementById('cms-root')).toBeDefined()
  })
})
