import React, { useLayoutEffect, useRef } from 'react'
import { useConfig } from 'src/contexts/config'
import { useEvent } from 'src/contexts/events'
import { WordpressPage } from 'src/contexts/wordpress'
import { getSlug } from 'src/utils/getSlug'
import packageJson from '../../../package.json'

interface Props {
  wordpressPage: WordpressPage
}

export function Page(props: Props) {
  const { wordpressPage } = props
  const { createAbsoluteURL, wordpressCssFile, wordpressResolveEndpoint } =
    useConfig()
  const fireLinkClicked = useEvent('linkClicked')
  const ref = useRef<HTMLElement>(null)

  function addClickEvent(a: HTMLAnchorElement, url: URL) {
    a.addEventListener('click', (e) => {
      if (fireLinkClicked(url)) {
        window.location.href = url.href
      } else {
        e.preventDefault()
      }
    })
  }

  /**
   * Given an anchor element that refers to a Wordpress page:
   *
   * 1)
   *
   * Modify its href attribute to be an valid url in the context of the
   * host application. E.g. if the original href was:
   *
   *     http://wordpress.backend.de/about
   *
   * then the resulting href may look like:
   *
   *     http://handschriftenportal.de/blog/about
   *
   * if the host application mounts the module to /blog.
   *
   * 2)
   *
   * Create an onClick handler that will fire the `linkClicked` event
   * so the host application can handle that event.
   *
   * See: https://code.dev.sbb.berlin/HSP/hsp-web-module/-/blob/development/README.md#27-routing
   */
  function modifyPageLink(a: HTMLAnchorElement, hash: string) {
    const slug = getSlug(new URL(a.href).pathname)

    if (!slug) {
      console.warn('Page: could not get slug from worpress page link.')
      return
    }

    const url = createAbsoluteURL({
      pathname: '/' + slug,
      search: '',
      hash: '' + hash,
    })

    a.href = url.href

    addClickEvent(a, url)

    a.classList.add('internal')
  }

  /**
   * Given an anchor element with an relative href, turn that href
   * into an absolute url of the host application an create an onClick
   * handler that fires the `linkClicked` event so the host application
   * can handle that event.
   *
   * See: https://code.dev.sbb.berlin/HSP/hsp-web-module/-/blob/development/README.md#27-routing
   */
  function modifyInternalLink(a: HTMLAnchorElement) {
    const url = new URL(a.href, location.origin)

    if (!a.href.startsWith('mailto:')) {
      addClickEvent(a, url)
    }
    a.classList.add('internal')
  }

  function modifyHashLink(a: HTMLAnchorElement) {
    const url = new URL(a.href, location.origin)
    // if anchorTarget is on same page -> href = relative
    const hashId = url.hash.replace('#', '')
    a.addEventListener('click', (e) => {
      const elem = document
        .querySelector('#page-shadow-container')
        ?.shadowRoot?.getElementById(hashId)
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' })
      }
    })
    a.classList.add('internal')
    // if anchorTarget is on different wp page
    modifyPageLink(a, url.hash)
  }

  /**
   * Given an anchor element with an absolute href, make sure the
   * link opens in a new tab.
   */
  function modifyExternalLink(a: HTMLAnchorElement) {
    a.target = '_blank'
    a.classList.add('external')
  }

  /**
   * Given an media element with an src attribute, change the src attribute
   * so that it points to the wordpress resolve endpoint with the original
   * url as query parameter.
   *
   * The resolve endpoint inspects the original url and determines whether
   * the resource must bo loaded through a proxy. This is neccessary because
   * resources from the wordpress backend cannot be accessed directly from the browser.
   */
  function modifySrcAttribute(
    elem: HTMLAudioElement | HTMLImageElement | HTMLVideoElement
  ) {
    elem.src = wordpressResolveEndpoint + '?originalUrl=' + elem.src

    // Image elements may have an additional srcset attribute
    if (elem.tagName === 'IMG') {
      const img = elem as HTMLImageElement
      img.srcset = img.srcset
        .split(', ')
        .map((srcdef) => wordpressResolveEndpoint + '?originalUrl=' + srcdef)
        .join(', ')
    }
  }

  // We use `useLayoutEffect` to make sure that the HTML will not be rendered
  // before all transformations to the elements are done. Otherwise the browser
  // is going to load resources (images etc.) before we had the chance to
  // set the correct urls.
  useLayoutEffect(() => {
    // For each anchor element of the HTML from Wordpress.
    ref.current?.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => {
      // Links to other Wordpress pages have data-type=page (default)
      // or type=page (with Yoast plugin)
      if (
        a.getAttribute('data-type') === 'page' ||
        a.getAttribute('type') === 'page'
      ) {
        modifyPageLink(a, '')

        // Links with relative urls are considered internal links that
        // refer to pages of the host application.
      } else if (
        !a.getAttribute('href')?.match(/^https?:\/\//) &&
        !a.getAttribute('href')?.includes('#')
      ) {
        modifyInternalLink(a)
        // Links containing hash # can refer to hashes on different pages (absolute) and on same page (relative)
      } else if (a.getAttribute('href')?.includes('#')) {
        modifyHashLink(a)
        // Treat every other link as an external link that should be
        // opened in a new tab.
      } else {
        modifyExternalLink(a)
      }
    })

    ref.current
      ?.querySelectorAll<
        HTMLImageElement | HTMLAudioElement | HTMLVideoElement
      >('img, audio, video')
      .forEach(modifySrcAttribute)
  })

  return (
    <main ref={ref}>
      <link href={wordpressCssFile} rel="stylesheet" type="text/css" />
      <link
        href={`/hsp-fo-cms.css?=${packageJson.version}`}
        rel="stylesheet"
        type="text/css"
      />
      <div data-testid="cms-index">
        <article className="page type-page status-publish hentry">
          <div className="post-inner thin">
            <div
              className="entry-content"
              dangerouslySetInnerHTML={{
                __html:
                  wordpressPage.content && wordpressPage.content.rendered
                    ? wordpressPage.content.rendered
                    : '',
              }}
            />
          </div>
        </article>
      </div>
    </main>
  )
}
