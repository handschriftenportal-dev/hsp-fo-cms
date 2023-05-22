import React, { useEffect } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TestProviders } from 'test/testutils/TestProviders'
import { mockLocation } from 'test/testutils/mockLocation'
import { WebModuleLink, useTriggerLink } from 'src/contexts/link'
import { defaultConfig } from 'src/contexts/config'
import { WebModuleLocation } from 'hsp-web-module'

// This function is passed as a config value to the module.
// It transforms a web module location into a absolute url.
function createAbsoluteURL({ pathname, search, hash }: WebModuleLocation) {
  const url = new URL('/module' + pathname, window.location.origin)
  url.search = search
  url.hash = hash
  return url
}

const config = { ...defaultConfig, createAbsoluteURL }

const jupiterLocation: WebModuleLocation = {
  pathname: '/planets',
  search: 'name=jupiter',
  hash: 'missions',
}

const absoluteJupiterUrl =
  'http://example.com/module/planets?name=jupiter#missions'

describe('WebModuleLink', function () {
  beforeEach(() => {
    mockLocation()
  })

  test('Given a web module location it renders a link with the absolute host url', function () {
    render(
      <TestProviders config={config}>
        <WebModuleLink location={jupiterLocation}>Jupiter</WebModuleLink>
      </TestProviders>
    )

    const a = screen.getByRole('link', { name: 'Jupiter' })
    expect(a.getAttribute('href')).toBe(absoluteJupiterUrl)

    fireEvent.click(a)
    expect(window.location.href).toBe(absoluteJupiterUrl)
  })

  test('Role and aria label of the link can be modified', function () {
    render(
      <TestProviders config={config}>
        <WebModuleLink
          location={jupiterLocation}
          role="button"
          ariaLabel="show jupiter"
        >
          Jupiter
        </WebModuleLink>
      </TestProviders>
    )
    screen.getByRole('button', { name: 'show jupiter' })
  })

  test('Fires the linkClicked event when the link gets clicked', async function () {
    const eventTarget = new EventTarget()

    render(
      <TestProviders config={config} eventTarget={eventTarget}>
        <WebModuleLink location={jupiterLocation}>Jupiter</WebModuleLink>
      </TestProviders>
    )

    const listener = jest.fn()
    eventTarget.addEventListener('linkClicked', listener)
    fireEvent.click(screen.getByRole('link', { name: 'Jupiter' }))

    const detail = listener.mock.calls[0][0].detail
    expect(detail.href).toBe(absoluteJupiterUrl)
    // because we DID NOT call preventDefault()
    expect(window.location.href).toBe(absoluteJupiterUrl)
  })

  test('Does not trigger the link if the event handler calls preventDefault', async function () {
    const eventTarget = new EventTarget()

    render(
      <TestProviders config={config} eventTarget={eventTarget}>
        <WebModuleLink location={jupiterLocation}>Jupiter</WebModuleLink>
      </TestProviders>
    )

    const listener = jest.fn((e) => {
      e.preventDefault()
    })

    eventTarget.addEventListener('linkClicked', listener)
    fireEvent.click(screen.getByRole('link', { name: 'Jupiter' }))

    const detail = listener.mock.calls[0][0].detail
    expect(detail.href).toBe(absoluteJupiterUrl)
    // because we DID call preventDefault()
    expect(window.location.href).toBe('http://example.com/')
  })
})

describe('triggerLink', function () {
  beforeEach(() => {
    mockLocation()
  })

  test('Given a web module location it triggers the absolute host url', function () {
    function ExecTriggerLink() {
      const triggerLink = useTriggerLink()
      useEffect(() => {
        triggerLink(jupiterLocation)
      }, [])
      return null
    }

    render(
      <TestProviders config={config}>
        <ExecTriggerLink />
      </TestProviders>
    )

    // because we DID NOT call preventDefault()
    expect(window.location.href).toBe(absoluteJupiterUrl)
  })

  test('Does not trigger the link if the event handler calls preventDefault', function () {
    const eventTarget = new EventTarget()
    const listener = jest.fn((e) => {
      e.preventDefault()
    })
    eventTarget.addEventListener('linkClicked', listener)

    function ExecTriggerLink() {
      const triggerLink = useTriggerLink()
      useEffect(() => {
        triggerLink(jupiterLocation)
      }, [])
      return null
    }

    render(
      <TestProviders config={config} eventTarget={eventTarget}>
        <ExecTriggerLink />
      </TestProviders>
    )

    const detail = listener.mock.calls[0][0].detail
    expect(detail.href).toBe(absoluteJupiterUrl)
    // because we DID call preventDefault()
    expect(window.location.href).toBe('http://example.com/')
  })
})
