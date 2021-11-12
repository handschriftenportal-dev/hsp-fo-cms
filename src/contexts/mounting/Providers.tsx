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
import { Store } from 'redux'
import { Provider } from 'react-redux'
import CssBaseline from '@material-ui/core/CssBaseline'
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles'
import { State } from '../state'
import { ConfigContext, Config } from '../config'
import { EventTargetContext } from '../events'
import { Router } from '../routing'
import { Fonts } from '../fonts'
import { Theme } from '../theme'
import { I18nStore, I18nContext } from '../i18n'
import { LocationStore, LocationContext } from '../location'
import { UnitContainerContext, UnitContainers } from '../units'
import { QueryClient, QueryClientProvider } from 'react-query'

export interface Props {
  children?: React.ReactNode
  store: Store<State>
  locationStore: LocationStore
  i18nStore: I18nStore
  config: Required<Config>
  eventTarget: EventTarget
  containers: UnitContainers
  reactQueryClient: QueryClient
}

export function Providers(props: Props) {
  const generateClassName = createGenerateClassName({
    seed: props.config.classNamePrefix
  })

  return (
    <Provider store={props.store}>
      <ConfigContext.Provider value={props.config}>
        <EventTargetContext.Provider value={props.eventTarget}>
          <I18nContext.Provider value={props.i18nStore}>
            <LocationContext.Provider value={props.locationStore}>
              <QueryClientProvider client={props.reactQueryClient}>
                <Router>
                  <CssBaseline>
                    <StylesProvider generateClassName={generateClassName}>
                      <Fonts>
                        <Theme configTheme={props.config.theme}>
                          <UnitContainerContext.Provider value={props.containers}>
                            {props.children}
                          </UnitContainerContext.Provider>
                        </Theme>
                      </Fonts>
                    </StylesProvider>
                  </CssBaseline>
                </Router>
              </QueryClientProvider>
            </LocationContext.Provider>
          </I18nContext.Provider>
        </EventTargetContext.Provider>
      </ConfigContext.Provider>
    </Provider>
  )
}
