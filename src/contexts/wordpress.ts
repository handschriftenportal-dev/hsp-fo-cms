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

import WPAPI from 'wpapi'
import urlJoin from 'url-join'


export interface WordpressPage {
  id: number
  link: string
  title: {
    rendered?: string
  }
  content: {
    rendered: string
  }
}

export interface WordpressMenu {
  ID: number,
  // eslint-disable-next-line camelcase
  object_id: number,
  title: string,
  url: string,
  children?: WordpressMenu[],
}

export function fetchWordpressMenus(
  wordpressEndpoint: string,
  lang: string
): Promise<WordpressMenu[]> {

  const wp = new WPAPI({
    endpoint: urlJoin(
      wordpressEndpoint, '/wp-json'
    )
  })

  wp.menuLocation = wp.registerRoute(
    'wp-api-menus/v2',
    '/menu-locations/(?P<location>)',
    {
      params: ['lang']
    }
  )

  return wp.menuLocation()
    .location('expanded')
    .lang(lang)
    .get()
}

export function fetchWordpressPage(
  wordpressEndpoint: string,
  id: number
): Promise<WordpressPage> {

  const wp = new WPAPI({
    endpoint: urlJoin(
      wordpressEndpoint, '/wp-json'
    )
  })

  return wp.pages().id(id).get()
}
