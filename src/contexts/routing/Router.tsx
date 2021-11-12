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

import React, { ReactNode, useEffect, useContext } from 'react'
import { BrowserRouter, useLocation as useRouterLocation } from 'react-router-dom'
import { LocationContext } from '../location'
import { useConfig } from '../config'

// This will be rendered as children of BrowserRouter
// to get access to the react-router hooks.
function InnerRouter(props: { children: ReactNode }) {
  const { pathname, search, hash } = useRouterLocation()
  const locationStore = useContext(LocationContext)

  useEffect(() => {
    locationStore.set({
      path: pathname,
      params: new URLSearchParams(search),
      hash: hash
    })
  }, [pathname, search, hash])

  return <>{props.children}</>
}

interface Props {
  children: ReactNode;
}

export function Router(props: Props) {
  const config = useConfig()

  if (!config.enableRouting) {
    return <>{props.children}</>
  }

  return (
    <BrowserRouter>
      <InnerRouter>
        {props.children}
      </InnerRouter>
    </BrowserRouter>
  )
}
