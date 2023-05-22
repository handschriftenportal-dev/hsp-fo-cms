import React from 'react'
import { screen, render, fireEvent } from '@testing-library/react'
import { TestProviders } from 'test/testutils/TestProviders'
import { Page } from 'src/components/Main/Page'
import { WebModuleLocation } from 'hsp-web-module'
import { defaultConfig } from 'src/contexts/config'

function renderPage(html: string) {
  const eventTarget = new EventTarget()

  function createAbsoluteURL({ pathname, search, hash }: WebModuleLocation) {
    const url = new URL('/blog' + pathname, window.location.origin)
    url.search = search
    url.hash = hash
    return url
  }

  render(
    <TestProviders
      eventTarget={eventTarget}
      config={{ ...defaultConfig, createAbsoluteURL }}
    >
      <Page
        wordpressPage={{
          id: 1,
          title: {
            rendered: 'Test',
          },
          content: {
            rendered: html,
          },
        }}
      />
    </TestProviders>
  )

  return eventTarget
}

test(`Transforms wordpress page links into links that consist of the
  module path (determined by the host) and the page slug. A click on
  the link will trigger an event.`, function (done) {
  const eventTarget = renderPage(`
    <a href="http://wordpress.backend.de/jupiter" data-type="page">Jupiter</a>
  `)

  const jupiterLink = screen.getByRole('link', {
    name: 'Jupiter',
  }) as HTMLAnchorElement
  expect(jupiterLink.href).toBe('http://localhost/blog/jupiter')

  eventTarget.addEventListener('linkClicked', (e) => {
    e.preventDefault()
    expect((e as CustomEvent).detail.href).toBe('http://localhost/blog/jupiter')
    done()
  })

  fireEvent.click(jupiterLink)
})

test('Treats links with relative urls as internal links that will trigger an event.', function (done) {
  const eventTarget = renderPage(`
    <a href="/search">Search</a>
  `)

  const searchLink = screen.getByRole('link', {
    name: 'Search',
  }) as HTMLAnchorElement
  expect(searchLink.href).toBe('http://localhost/search')

  eventTarget.addEventListener('linkClicked', (e) => {
    e.preventDefault()
    expect((e as CustomEvent).detail.href).toBe('http://localhost/search')
    done()
  })

  fireEvent.click(searchLink)
})

test('Transforms each other link into an external link (blank attribute)', function () {
  renderPage(`
    <a href="http://foo.bar/baz">External</a>
  `)

  const externalLink = screen.getByRole('link', {
    name: 'External',
  }) as HTMLAnchorElement
  // do NOT transform the url of external links
  expect(externalLink.href).toBe('http://foo.bar/baz')
  expect(externalLink.target).toBe('_blank')
})
