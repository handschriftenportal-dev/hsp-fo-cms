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

import React, { useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery } from 'react-query'
import { fetchWordpressMenus, fetchWordpressPage } from 'src/contexts/wordpress'
import { useI18nInfos } from 'src/contexts/i18n'
import { useConfig } from 'src/contexts/config'
import Paper from '@material-ui/core/Paper'
import { Page } from './Page'
import root from 'react-shadow'
import { getPageIdFromParams } from 'src/contexts/location'
import MuiGrid from '@material-ui/core/Grid'
import { useTriggerLink } from 'src/contexts/routing'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(4)
  },
  content: {
    display: 'flex',
    padding: theme.spacing(8),
    justifyContent: 'center'
  }
}))

interface Props {
  className?: string;
}

/**
 * If there is a `pageId` parameter in the url then the component
 * fetches the wordpress page of this ID and renders the `Page` component.
 * Otherwise it fetches the wordpress menus, takes the page id of the
 * first menu and redirects to new url with that page id set.
 */
export default function Main({ className }: Props) {
  const cls = useStyles()
  const { language } = useI18nInfos()
  const { wordpressEndpoint } = useConfig()
  const triggerLink = useTriggerLink()
  const pageId = getPageIdFromParams()

  // There is also an request for the menus in ../HspCms.ts
  // with the same keys. Make sure both request return the same data.
  const { data: menus, status: menuStatus } = useQuery(['wordpressMenus', language], () => {
    return fetchWordpressMenus(wordpressEndpoint, language)
  }, { enabled: pageId === undefined }) // do not fetch menus if we already have an page id.

  const { data: page, status: pageStatus } = useQuery(['wordpressPage', pageId], () => {
    return pageId
      ? fetchWordpressPage(wordpressEndpoint, pageId)
      : Promise.resolve(undefined)
  }, { enabled: pageId !== undefined }) // do not fetch page if we have no page id yet.

  useEffect(() => {
    if (!pageId && menus) {
      if (menus[0] === undefined) {
        console.error('hsp-fo-cms: Could not load a default page as there are no menus.')
      }

      triggerLink({
        path: '/',
        hash: '',
        params: new URLSearchParams({
          pageId: menus[0].object_id.toString()
        })
      })
    }
  })

  if (page && pageId) {
    return (
      <div className={clsx(cls.root, className)}>
        <MuiGrid
          id='hsp-cms-main'
          container
          direction='column'
        >
          <Paper
            className={cls.content}
            square
          >
            <MuiGrid
              item
              xs={12}
            >
              <root.div id='cms-root'>
                <Page pageId={pageId} wordpressPage={page}/>
              </root.div>
            </MuiGrid>
          </Paper>
        </MuiGrid>
      </div>
    )
  }

  if (pageStatus === 'loading' || menuStatus === 'loading') {
    return <p>...loading</p>
  }

  if (pageStatus === 'error' || menuStatus === 'error') {
    return <p>error</p>
  }

  return null
}
