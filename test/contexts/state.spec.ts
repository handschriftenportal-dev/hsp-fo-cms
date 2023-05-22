import { makeStore, actions, selectors } from 'src/contexts/state'

test('location', function () {
  const store = makeStore()
  expect(selectors.getLocation(store.getState()).pathname).toBe('/')
  expect(selectors.getLocation(store.getState()).search).toBe('')
  expect(selectors.getLocation(store.getState()).hash).toBe('')
  store.dispatch(
    actions.setLocation({
      pathname: '/foo',
      search: 'q=bar',
      hash: 'baz',
    })
  )
  expect(selectors.getLocation(store.getState()).pathname).toBe('/foo')
  expect(selectors.getLocation(store.getState()).search).toBe('q=bar')
  expect(selectors.getLocation(store.getState()).hash).toBe('baz')
})

test('i18nConfig', function () {
  const store = makeStore()
  expect(selectors.getI18nConfig(store.getState())).toEqual({
    language: 'de',
    disableTranslation: false,
  })
  store.dispatch(
    actions.setI18nConfig({
      language: 'en',
      disableTranslation: true,
    })
  )
  expect(selectors.getI18nConfig(store.getState())).toEqual({
    language: 'en',
    disableTranslation: true,
  })
})
