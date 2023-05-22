import React from 'react'
import fetch from 'node-fetch'
import { makeStore, defaultState } from 'src/contexts/state'
import { Providers, Props as ProviderProps } from 'src/contexts/Providers'
import { defaultConfig } from 'src/contexts/config'
import { createReactQueryClient } from 'src/contexts/cache'

export function TestProviders(props: Partial<ProviderProps>) {
  const defaultProps: ProviderProps = {
    config: {
      ...defaultConfig,
      // use node-fetch in test environment
      customFetch: fetch as any,
      // URL must be absolute because we use node-fetch
      // in the test environment.
      wordpressEndpoint: 'http://example.com/api/wordpress',
      wordpressCssFile: 'http://example.com/api/wordpress/css',
      cacheOptions: {
        staleTime: 0,
        retry: false,
      },
    },
    store: makeStore({
      ...defaultState,
      i18nConfig: {
        ...defaultState.i18nConfig,
        // Causes translation functions to return the translation keys.
        disableTranslation: true,
      },
    }),
    eventTarget: new EventTarget(),
    children: null,
    containers: {},
    reactQueryClient: createReactQueryClient({
      staleTime: 0,
      retry: false,
    }),
  }

  const effectiveProps = {
    ...defaultProps,
    ...props,
  }

  return <Providers {...effectiveProps}>{props.children}</Providers>
}
