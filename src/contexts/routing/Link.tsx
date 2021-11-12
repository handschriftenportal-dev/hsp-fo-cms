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

import React, { forwardRef } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import {
  Link as ReactRouterLink,
  useHistory as useReactRouterHistory,
} from 'react-router-dom'
import { WebModuleLocation } from 'hsp-web-module'
import { LanguageMap } from '../types'
import { useEvent } from '../events'
import { useConfig } from '../config'
import { useLanguage } from '../i18n'

/* **********************************************
* Types
*************************************************/

export interface ExternLink {
  extern: true
  href: string | LanguageMap
}

export type LinkInfo = string | WebModuleLocation | ExternLink

export function isWebModuleLocation(item: any): item is WebModuleLocation {
  return typeof item === 'object' &&
    typeof item.path === 'string' &&
    typeof item.hash === 'string' &&
    item.params instanceof URLSearchParams
}

export function isExternLink(item: any): item is ExternLink {
  return typeof item === 'object' &&
    item.extern === true
}

/* **********************************************
* <Link/>
*************************************************/

const useStyles = makeStyles({
  root: {
    color: 'inherit',
  }
})

interface Props {
  className?: string;
  linkInfo: LinkInfo;
  children: React.ReactNode;
  role?: string
  ariaLabel?: string | LanguageMap
}

export const Link = forwardRef<HTMLAnchorElement, Props>(function Link(props, ref) {
  const { linkInfo, children, className, role, ariaLabel } = props
  const cls = useStyles()
  const lang = useLanguage()
  const { enableRouting, createAbsoluteURL } = useConfig()
  const fireLinkClicked = useEvent('linkClicked')

  let effectiveAriaLabel
  if (ariaLabel === undefined) {
    effectiveAriaLabel = undefined
  } else if (typeof ariaLabel === 'string') {
    effectiveAriaLabel = ariaLabel
  } else {
    effectiveAriaLabel = ariaLabel[lang]
  }

  if (isExternLink(linkInfo)) {
    const href = typeof linkInfo.href === 'string'
      ? linkInfo.href
      : linkInfo.href[lang]

    return (
      <a
        className={clsx(cls.root, className)}
        href={href}
        target="_blank"
        rel="noreferrer"
        ref={ref}
        role={role}
        aria-label={effectiveAriaLabel}
      >
        {children}
      </a>
    )
  }

  if (enableRouting) {
    let url: URL

    if (isWebModuleLocation(linkInfo)) {
      url = createAbsoluteURL(linkInfo)
    } else {
      try {
        url = new URL(linkInfo)
      } catch (e) {
        url = new URL(linkInfo, window.location.origin)
      }
    }

    return (
      <ReactRouterLink
        data-testid="react-router-link"
        ref={ref}
        className={clsx(cls.root, className)}
        to={{
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
        }}
        role={role}
        aria-label={effectiveAriaLabel}
      >
        {children}
      </ReactRouterLink>
    )
  }

  // else: not an extern link and routing is disabled

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const url = new URL(e.currentTarget.href)
    if (fireLinkClicked(url)) {
      window.location.href = url.href
    } else {
      e.preventDefault()
    }
  }

  const href = isWebModuleLocation(linkInfo)
    ? createAbsoluteURL(linkInfo).href
    : linkInfo

  return (
    <a
      className={clsx(cls.root, className)}
      onClick={handleClick}
      href={href}
      ref={ref}
      role={role}
      aria-label={effectiveAriaLabel}
    >
      {children}
    </a>
  )
})

export function useTriggerLink() {
  const { enableRouting, createAbsoluteURL } = useConfig()
  const history = useReactRouterHistory()
  const fireLinkClicked = useEvent('linkClicked')

  return (linkInfo: string | WebModuleLocation) => {
    let url: URL

    if (typeof linkInfo === 'string') {
      try {
        url = new URL(linkInfo)
      } catch (e) {
        url = new URL(linkInfo, window.location.origin)
      }
    } else {
      url = createAbsoluteURL(linkInfo)
    }

    if (enableRouting) {
      history.push(url.pathname + url.search + url.hash)
    } else {
      if (fireLinkClicked(url)) {
        window.location.href = url.href
      }
    }
  }
}
