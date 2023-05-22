import React from 'react'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import {
  StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles'
import { HspThemeProvider } from 'hsp-web-module'
import { State } from './state'
import { ConfigContext, Config } from './config'
import { EventTargetContext } from './events'
import { UnitContainers } from './units'
import { QueryClient, QueryClientProvider } from 'react-query'

export interface Props {
  children?: React.ReactNode
  store: Store<State>
  config: Required<Config>
  eventTarget: EventTarget
  containers: UnitContainers
  reactQueryClient: QueryClient
}

export function Providers(props: Props) {
  const generateClassName = createGenerateClassName({
    seed: props.config.classNamePrefix,
  })

  return (
    <Provider store={props.store}>
      <ConfigContext.Provider value={props.config}>
        <EventTargetContext.Provider value={props.eventTarget}>
          <QueryClientProvider client={props.reactQueryClient}>
            <StylesProvider generateClassName={generateClassName}>
              <HspThemeProvider themeOptions={props.config.theme}>
                {props.children}
              </HspThemeProvider>
            </StylesProvider>
          </QueryClientProvider>
        </EventTargetContext.Provider>
      </ConfigContext.Provider>
    </Provider>
  )
}
