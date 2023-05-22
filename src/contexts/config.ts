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

import { createContext, useContext } from 'react'
import { ThemeOptions } from '@material-ui/core/styles'
import { WebModuleConfig } from 'hsp-web-module'

export type Config = WebModuleConfig & {
  wordpressEndpoint: string
  wordpressCssFile: string
  wordpressResolveEndpoint: string
  theme?: ThemeOptions
  cacheOptions?: {
    staleTime: number // milisecond
    retry: number | boolean
  }
}

export const ConfigContext = createContext<Required<Config> | undefined>(
  undefined
)
export const useConfig = () => useContext(ConfigContext) as Required<Config>

export const defaultConfig: Required<Config> = {
  classNamePrefix: 'hsp-cms',
  enableRouting: false,
  customFetch: window.fetch,
  createAbsoluteURL({ pathname, search, hash }) {
    const url = new URL(pathname, window.location.origin)
    url.search = search
    url.hash = hash
    return url
  },
  theme: {},
  wordpressEndpoint: 'http://example.com/api/wordpress',
  wordpressCssFile: 'http://example.com/api/wordpress/css',
  wordpressResolveEndpoint: 'http://example.com/api/url',
  cacheOptions: {
    staleTime: 3 * 60 * 1000,
    retry: 3,
  },
}
