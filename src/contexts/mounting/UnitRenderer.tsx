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

import React, { FC } from 'react'
import { useUnitContainers, Unit } from 'src/contexts/units'
import { createPortal } from 'react-dom'
import Main from '../../components/Main'


const components: Record<Unit, FC<any>> = {
  main: Main,
}

interface Props {
  nonePortalUnit: Unit
}

export function UnitRenderer(props: Props) {
  const containers = useUnitContainers()
  const NonePortalComponent = components[props.nonePortalUnit]

  return (
    <>
      <NonePortalComponent />
      {
        Object.keys(containers).map((name) => {
          if (name === props.nonePortalUnit) {
            return null
          }

          const Component = components[name as Unit]
          const container = containers[name as Unit]
          return container
            ? createPortal(<Component/>, container)
            : null
        })
      }
    </>
  )
}
