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
import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { TestProviders } from '../testutils'
import { Page } from 'src/components/Main/Page'
import { aboutUsPageDe } from 'test/testutils/fixtures'

function renderWordpressPage() {
  return render(
    <TestProviders>
      <Page pageId={83} wordpressPage={aboutUsPageDe}/>
    </TestProviders>
  )
}

describe('<Page/>', function() {
  it('has page title', async () => {
    const { getByRole } = renderWordpressPage()
    await waitFor(() => {
      expect(getByRole('heading')).toHaveTextContent('Über uns')
    })
  })

  it('has page content', async () => {
    const { getByText } = renderWordpressPage()

    await waitFor(() => {
      expect(
        getByText(/^Hier können Sie Informationen über das Projekt und dessen Beteiligte erhalten..*/i)
      ).toBeVisible()
    })
  })
})
