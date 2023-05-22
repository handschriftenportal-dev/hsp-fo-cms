import waitForExpect from 'wait-for-expect'
import { createHspCms } from 'src/HspCms'
import { defaultConfig } from 'src/contexts/config'
import { mockLocation } from 'test/testutils/mockLocation'
import { wordpressServer } from 'test/testutils/wordpressServer'

mockLocation()
wordpressServer.listen()

test('addEventListener', function (done) {
  const cms = createHspCms(defaultConfig)
  cms.addEventListener('linkClicked', (e) => {
    expect(e.detail.href).toBe('http://example.com/foo')
    done()
  })
  cms.eventTarget.dispatchEvent(
    new CustomEvent('linkClicked', {
      detail: new URL('http://example.com/foo'),
    })
  )
})

test('addEventListener returns a function to remove listener', function () {
  let counter1 = 0
  let counter2 = 0
  const cms = createHspCms(defaultConfig)

  function triggerEvent() {
    cms.eventTarget.dispatchEvent(
      new CustomEvent('linkClicked', {
        detail: new URL('http://example.com/foo'),
      })
    )
  }

  const removeListener1 = cms.addEventListener('linkClicked', (e) => counter1++)
  const removeListener2 = cms.addEventListener('linkClicked', (e) => counter2++)

  triggerEvent()
  expect(counter1).toBe(1)
  expect(counter2).toBe(1)

  removeListener1()
  triggerEvent()
  expect(counter1).toBe(1)
  expect(counter2).toBe(2)

  removeListener2()
  triggerEvent()
  expect(counter1).toBe(1)
  expect(counter2).toBe(2)
})

test('getConfig returns the config values passed to the constructor', function () {
  const config = createHspCms(defaultConfig).getConfig()
  expect(config).toEqual(defaultConfig)
})

test('mount, umount, isMounted', async function () {
  const mainContainer = document.createElement('div')
  document.body.appendChild(mainContainer)

  const cms = createHspCms(defaultConfig)

  expect(document.getElementById('hsp-cms-root')).toBeNull()
  expect(cms.isMounted()).toBe(false)

  await cms.mount({
    main: mainContainer,
  })
  expect(document.getElementById('hsp-cms-root')).not.toBeNull()
  expect(cms.isMounted()).toBe(true)

  // Nothing should change here because we did not invoke unmount()
  // before we call mount() a second time. So this call should be ignored.
  await cms.mount({
    main: document.createElement('div'),
  })
  expect(document.getElementById('hsp-cms-root')).not.toBeNull()
  expect(cms.isMounted()).toBe(true)

  cms.unmount()
  expect(document.getElementById('hsp-cms-root')).toBeNull()
  expect(cms.isMounted()).toBe(false)

  cms.unmount()
  // At least one container element must be given
  await expect(cms.mount({})).rejects.toThrow()
})

test('setLocation and getLocation', function () {
  const location = {
    pathname: '/foo',
    search: 'q=bar',
    hash: 'baz',
  }

  const cms = createHspCms(defaultConfig)
  cms.setLocation(location)

  expect(cms.getLocation()).toEqual(location)
})

test('setLanguage and getLanguage', function () {
  const cms = createHspCms(defaultConfig)
  expect(cms.getLanguage()).toBe('de')
  cms.setLanguage('en')
  expect(cms.getLanguage()).toBe('en')
})

test('getState and setState', function () {
  const cms = createHspCms(defaultConfig)
  // The structure of the module's state is an implementation detail.
  // Let's asume it's not undefined and simply test that the methods
  // don't throw.
  cms.setState(cms.getState())
})

describe('getMenu', function () {
  test('fetches, transforms and returns the wordpress menus: de', async function () {
    const cms = createHspCms(defaultConfig)
    cms.setLanguage('de')
    const menus = await cms.getMenus()
    expect(menus).toEqual([
      {
        id: '5',
        label: 'Planeten',
        link: 'http://example.com/planets',
        children: [
          {
            id: '6',
            label: 'Merkur',
            children: [],
            link: 'http://example.com/mercury',
          },
          {
            id: '7',
            label: 'Saturn',
            children: [],
            link: 'http://example.com/saturn',
          },
        ],
      },
      {
        id: '8',
        label: 'Missionen',
        link: 'http://example.com/missions',
        children: [],
      },
    ])
  })

  test('fetches, transforms and returns the wordpress menus: en', async function () {
    const cms = createHspCms(defaultConfig)

    cms.setLanguage('en')
    const menus = await cms.getMenus()
    expect(menus).toEqual([
      {
        id: '1',
        label: 'Planets',
        link: 'http://example.com/planets',
        children: [
          {
            id: '2',
            label: 'Mercury',
            children: [],
            link: 'http://example.com/mercury',
          },
          {
            id: '3',
            label: 'Saturn',
            children: [],
            link: 'http://example.com/saturn',
          },
        ],
      },
      {
        id: '4',
        label: 'Missions',
        link: 'http://example.com/missions',
        children: [],
      },
    ])
  })
})

describe('render wordpress pages', function () {
  test(`if the module location does not contain a page title (slug)
    then redirect to the first page from the menu`, async function () {
    const mainContainer = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(mainContainer)

    const cms = createHspCms(defaultConfig)
    cms.setLanguage('de')

    cms.setLocation({
      pathname: '/', // no slug
      hash: '',
      search: '',
    })

    let newPathname = ''
    cms.addEventListener('linkClicked', (e) => {
      newPathname = e.detail.pathname
    })

    await cms.mount({
      main: mainContainer,
    })

    await waitForExpect(() => {
      expect(newPathname).toBe('/planets')
    })
  })

  test(`if the module location contains a page title (slug)
    then fetch and render the correct page into a shadow dom element`, async function () {
    const mainContainer = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(mainContainer)

    const cms = createHspCms(defaultConfig)
    cms.setLanguage('de')

    cms.setLocation({
      pathname: '/mercury',
      hash: '',
      search: '',
    })

    await cms.mount({
      main: mainContainer,
    })

    await waitForExpect(() => {
      const root = document.getElementById('page-shadow-container')?.shadowRoot
      expect(root instanceof ShadowRoot).toBe(true)
      expect((root as ShadowRoot).innerHTML.includes('Merkur')).toBe(true)
    })
  })

  test(`if a page is rendered and the module language changes
    then fetch and render the corresponding page into a shadow dom element`, async function () {
    const mainContainer = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(mainContainer)

    const cms = createHspCms(defaultConfig)
    cms.setLanguage('de')

    cms.setLocation({
      pathname: '/mercury',
      hash: '',
      search: '',
    })

    await cms.mount({
      main: mainContainer,
    })

    await waitForExpect(() => {
      const root = document.getElementById('page-shadow-container')?.shadowRoot
      expect(root instanceof ShadowRoot).toBe(true)
      expect((root as ShadowRoot).innerHTML.includes('Merkur')).toBe(true)
    })

    cms.setLanguage('en')

    await waitForExpect(() => {
      const root = document.getElementById('page-shadow-container')?.shadowRoot
      expect(root instanceof ShadowRoot).toBe(true)
      expect((root as ShadowRoot).innerHTML.includes('Mercury')).toBe(true)
    })
  })
})
