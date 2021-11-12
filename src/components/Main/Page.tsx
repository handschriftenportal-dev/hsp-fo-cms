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

import React, { useEffect } from 'react'
import { useConfig } from 'src/contexts/config'
import { useTriggerLink } from 'src/contexts/routing'
import { WebModuleLocation } from 'hsp-web-module'
import { WordpressPage } from 'src/contexts/wordpress'

interface Props {
  pageId: number,
  wordpressPage: WordpressPage
}

export function Page(props: Props) {
  const { pageId, wordpressPage } = props
  const { createAbsoluteURL, wordpressCssFile } = useConfig()
  const triggerLink = useTriggerLink()

  function modifyWordPressPageLink(node: Element) {
    if (
      node.hasAttribute('href') &&
      node.hasAttribute('data-id')
    ) {
      const refPageId = node.getAttribute('data-id')
      if (refPageId) {
        const refLocation: WebModuleLocation = {
          path: '/',
          params: new URLSearchParams([['pageId', refPageId]]),
          hash: ''
        }
        node.setAttribute('href', createAbsoluteURL(refLocation).href)
        node.setAttribute('class', 'internal')
        node.addEventListener('click', (e) => {
          e.preventDefault()
          triggerLink(refLocation)
        })
      }
    }
  }

  function modifyNonWordPressLink(node: Element) {
    const href = node.getAttribute('href')
    if (href) {
      const linkUrl = new URL(href)
      if (window.location.origin === linkUrl.origin) {
        node.setAttribute('class', 'internal')
        node.addEventListener('click', (e) => {
          e.preventDefault()
          triggerLink(href)
        })
      } else {
        node.setAttribute('class', 'external')
        node.setAttribute('target', '_blank')
      }
    }
  }

  useEffect(() => {
    const pageLinks = document.querySelector('#cms-root')?.shadowRoot?.querySelectorAll('a[data-type="page"]')
    pageLinks?.forEach((pageLink) => {
      modifyWordPressPageLink(pageLink)
    })
    const externalLinks = document.querySelector('#cms-root')?.shadowRoot?.querySelectorAll('a:not([data-type="page"])')
    externalLinks?.forEach((externalLink) => {
      modifyNonWordPressLink(externalLink)
    })
  })

  return (
    <main id="site-content" role="main">
      <link
        href={wordpressCssFile}
        rel="stylesheet"
        type="text/css"
      />
      <link
        href="/hsp-fo-cms.css"
        rel="stylesheet"
        type="text/css"
      />
      <div data-testid="cms-index">
        <header className="entry-header has-text-align-center header-footer-group">
          <div className="entry-header-inner section-inner medium">
            <h1 className="entry-title">{wordpressPage.title && wordpressPage.title.rendered ? wordpressPage.title.rendered : ''}</h1>
          </div>
        </header>
        <article className={'post-' + pageId + ' page type-page status-publish hentry'} id={'post-' + pageId}>
          <div className="post-inner thin">
            <div
              className="entry-content"
              dangerouslySetInnerHTML={{
                __html: wordpressPage.content && wordpressPage.content.rendered
                  ? wordpressPage.content.rendered
                  : ''
              }} />
          </div>
        </article>
      </div>
    </main>
  )
}
