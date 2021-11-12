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
import ReactDom from 'react-dom'
import { Providers, Props as ProviderProps } from './Providers'
import { UnitRenderer } from './UnitRenderer'
import { UnitContainers, Unit } from '../units'


function getNonePortalUnit(containers: UnitContainers): Unit {
  const nonePortalUnit = Object.keys(containers)
    .find(unit => containers[unit as Unit] !== null)

  if (!nonePortalUnit) {
    throw new Error('getNonPortalUnit(): Could not find an container element for the module.')
  }

  return nonePortalUnit as Unit
}


export function mount(props: ProviderProps) {
  const appUnit = getNonePortalUnit(props.containers)

  ReactDom.render(
    <div id="hsp-cms-root">
    <Providers {...props}>
      <UnitRenderer nonePortalUnit={appUnit} />
    </Providers>
    </div>,
    props.containers[appUnit]
  )
}

export function unmount(containers: UnitContainers) {
  const appUnit = getNonePortalUnit(containers)
  ReactDom.unmountComponentAtNode(containers[appUnit] as HTMLElement)
}
