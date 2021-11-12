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

import { WebModule } from 'hsp-web-module'
import { makeStore, actions, State } from './contexts/state'
import { createLocationStore } from './contexts/location'
import { createI18nStore } from './contexts/i18n'
import { Config, defaultConfig } from './contexts/config'
import { Events } from './contexts/events'
import { Unit, UnitContainers } from './contexts/units'
import { fetchWordpressMenus, WordpressMenu } from './contexts/wordpress'
import { Menu } from './contexts/types'
import { createReactQueryClient } from './contexts/cache'


export type HspCms = WebModule<Config, State, Events, Unit> & {
  getMenus: () => Promise<Menu[]>
}

export type CreateHspCms = (config: Config) => HspCms
export const createHspCms: CreateHspCms = (config) => {

  const fullConfig = { ...defaultConfig, ...config }
  let containers: UnitContainers | undefined
  const eventTarget = new EventTarget()
  const store = makeStore()

  const locationStore = createLocationStore({
    path: '/',
    params: new URLSearchParams(),
    hash: '',
  })

  // initialy set language to 'de'
  const i18nStore = createI18nStore({
    language: 'de',
    disableTranslation: false,
  })

  const reactQueryClient =
    createReactQueryClient(fullConfig.cacheOptions)

  store.subscribe(() => {
    eventTarget.dispatchEvent(new CustomEvent('stateChanged', {
      detail: store.getState()
    }))
  })

  return {
    eventTarget,

    addEventListener(type, listener) {
      eventTarget.addEventListener(type, listener as any)
    },

    getConfig() {
      return fullConfig
    },

    async mount(_containers) {
      if (!containers) {
        containers = _containers
        const { mount } = await import('src/contexts/mounting')
        mount({
          containers,
          store,
          config: fullConfig,
          eventTarget,
          i18nStore,
          locationStore,
          reactQueryClient,
        })
      }
    },

    async unmount() {
      if (containers) {
        const { unmount } = await import('src/contexts/mounting')
        unmount(containers)
        containers = undefined
      }
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
      return locationStore.get()
    },

    setLocation(location) {
      locationStore.set(location)
    },

    getLanguage() {
      return i18nStore.get().language
    },

    setLanguage(lang) {
      i18nStore.set({
        ...i18nStore.get(),
        language: lang
      })
      // we need to leave the current cms page, since it is not translated automatically; the translated version of
      // it can not be identified via WordPress' REST API in combination with WPML Multilingual CMS => location reset.
      //
      // Setting the location to '/' causes the module to load the top page of the new language specific menu.
      this.setLocation({
        path: '/',
        params: new URLSearchParams(),
        hash: ''
      })
    },

    async getMenus() {

      function wordpressMenuToMenu(wpMenu: WordpressMenu): Menu {
        return {
          id: wpMenu.ID.toString(),
          label: wpMenu.title,
          children: wpMenu.children?.map(wordpressMenuToMenu),
          link: fullConfig.createAbsoluteURL({
            path: '/',
            hash: '',
            params: new URLSearchParams({ pageId: wpMenu.object_id.toString() })
          }).href,
        }
      }

      const lang = i18nStore.get().language

      // There is also an request for the menus in components/index.tsx
      // with the same keys. Make sure both request return the same data.
      //
      // (Problem is we can not use useQuery at this point because there is
      // no react context here. On the other hand we can not use the reactQueryClient
      // in components/index.tsx because it would not trigger render updates.)
      return reactQueryClient.fetchQuery(['wordpressMenus', lang], () => {
        return fetchWordpressMenus(fullConfig.wordpressEndpoint, lang)
      }).then(menus => menus.map(wordpressMenuToMenu))
    }
  }
}

// export module constructor to window
const _window = window as any
_window.createHspCms = createHspCms
