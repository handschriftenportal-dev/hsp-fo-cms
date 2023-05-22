import { WebModule } from 'hsp-web-module'
import { makeStore, actions, State, selectors } from './contexts/state'
import { Config, defaultConfig } from './contexts/config'
import { Events } from './contexts/events'
import { Unit, UnitContainers } from './contexts/units'
import { fetchWordpressMenus, WordpressMenuItem } from './contexts/wordpress'
import { Menu } from './contexts/types'
import { createReactQueryClient } from './contexts/cache'
import { route } from './contexts/route'
import { getSlug } from './utils/getSlug'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

export type HspCms = WebModule<Config, State, Events, Unit> & {
  getMenus: () => Promise<Menu[]>
}

function HspCms(config: Config): HspCms {
  const fullConfig = { ...defaultConfig, ...config }
  let containers: UnitContainers | undefined
  let internalUnmount: ((containers: UnitContainers) => boolean) | undefined
  const eventTarget = new EventTarget()
  const store = makeStore()

  const reactQueryClient = createReactQueryClient(fullConfig.cacheOptions)

  store.subscribe(() => {
    eventTarget.dispatchEvent(
      new CustomEvent('stateChanged', {
        detail: store.getState(),
      })
    )
  })

  return {
    eventTarget,

    addEventListener(type, listener) {
      eventTarget.addEventListener(type, listener as (event: any) => void)
      return () => {
        eventTarget.removeEventListener(type, listener as any)
      }
    },

    getConfig() {
      return fullConfig
    },

    async mount(_containers) {
      if (!containers) {
        containers = _containers
        const { mount, unmount } = await import('src/contexts/mounting')
        internalUnmount = unmount
        mount({
          containers,
          store,
          config: fullConfig,
          eventTarget,
          reactQueryClient,
        })
      }
    },

    unmount() {
      if (internalUnmount && containers) {
        const result = internalUnmount(containers)
        containers = undefined
        return result
      }
      return false
    },

    isMounted() {
      return !!containers
    },

    getState() {
      return store.getState()
    },

    setState(state) {
      store.dispatch(actions.setState(state))
    },

    getLocation() {
      return selectors.getLocation(store.getState())
    },

    setLocation(location) {
      store.dispatch(actions.setLocation(location))
    },

    getLanguage() {
      return selectors.getI18nConfig(store.getState()).language
    },

    setLanguage(lang) {
      const langConfig = selectors.getI18nConfig(store.getState())
      store.dispatch(
        actions.setI18nConfig({
          ...langConfig,
          language: lang,
        })
      )
    },

    async getMenus() {
      function wordpressMenuToItem(wpMenu: WordpressMenuItem): Menu {
        const slug = getSlug(new URL(wpMenu.url).pathname)
        return {
          id: wpMenu.ID.toString(),
          label: wpMenu.title,
          children: wpMenu.child_items?.map(wordpressMenuToItem) || [],
          link: fullConfig.createAbsoluteURL({
            pathname: '/' + slug,
            hash: '',
            search: '',
          }).href,
        }
      }

      const lang = this.getLanguage()

      // There is also an request for the menus in components/index.tsx
      // with the same keys. Make sure both request return the same data.
      //
      // (Problem is we can not use useQuery at this point because there is
      // no react context here. On the other hand we can not use the reactQueryClient
      // in components/index.tsx because it would not trigger render updates.)
      return reactQueryClient
        .fetchQuery(['wordpressMenus', lang], () => {
          return fetchWordpressMenus(fullConfig.wordpressEndpoint, lang)
        })
        .then((menus) => menus.items.map(wordpressMenuToItem))
    },
  }
}

/**
 * Module factory function
 */

export type CreateHspCms = (config: Config) => HspCms

export const createHspCms: CreateHspCms = (config) => {
  const cms = HspCms(config)
  if (config.enableRouting) {
    route(cms)
  }
  return cms
}

// export module factory to window
;(window as any).createHspCms = createHspCms
