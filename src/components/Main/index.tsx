import React, { useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery } from 'react-query'
import {
  fetchWordpressMenus,
  fetchWordpressPageWithSlugs,
} from 'src/contexts/wordpress'
import { useI18nConfig, useTranslation } from 'src/contexts/i18n'
import { useConfig } from 'src/contexts/config'
import Paper from '@material-ui/core/Paper'
import { Page } from './Page'
import root from 'react-shadow'
import MuiGrid from '@material-ui/core/Grid'
import { useTriggerLink } from 'src/contexts/link'
import { Grid } from 'src/components/Main/Grid'
import { useLocation } from 'src/contexts/location'
import { getSlug } from 'src/utils/getSlug'
import { ErrorPage } from './ErrorPage'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(4),
    [theme.breakpoints.up('xs')]: {
      padding: theme.spacing(0),
    },
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: theme.spacing(8),
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      paddingBottom: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
}))

interface Props {
  className?: string
}

export function Main({ className }: Props) {
  const cls = useStyles()
  const { language } = useI18nConfig()
  const { wordpressEndpoint } = useConfig()
  const triggerLink = useTriggerLink()
  const location = useLocation()
  const slug = getSlug(location.pathname)
  const { t } = useTranslation()

  // There is also an request for the menus in ../HspCms.ts
  // with the same keys. Make sure both request return the same data.
  const { data: menus, status: menuStatus } = useQuery(
    ['wordpressMenus', language],
    () => {
      return fetchWordpressMenus(wordpressEndpoint, language)
    },
    { enabled: slug === undefined }
  ) // do not fetch menus if we already have an page id.

  const { data: page, status: pageStatus } = useQuery(
    ['wordpressPage', slug, language],
    () => {
      return slug
        ? fetchWordpressPageWithSlugs(wordpressEndpoint, slug, language)
        : Promise.resolve(undefined)
    },
    { enabled: slug !== undefined }
  ) // do not fetch page if there is no slug.

  useEffect(() => {
    if (!slug && menus) {
      if (menus.items[0] === undefined) {
        // enthält menus {name, slug, ... [menüs], }
        console.error(
          'hsp-fo-cms: Could not load a default page as there are no menus.'
        )
      }

      triggerLink({
        pathname: '/' + getSlug(new URL(menus.items[0].url).pathname),
        hash: '',
        search: '',
      })
    }
  })

  if (Array.isArray(page) && page.length > 0) {
    return (
      <div className={clsx(cls.root, className)}>
        <Grid>
          <Paper className={cls.content} square>
            <MuiGrid item xs={12}>
              <root.div id="page-shadow-container">
                <Page wordpressPage={page[0]} />
              </root.div>
            </MuiGrid>
          </Paper>
        </Grid>
      </div>
    )
  }

  if (pageStatus === 'loading' || menuStatus === 'loading') {
    return <ErrorPage errorMessage={t('loading')} />
  }

  if (pageStatus === 'error' || menuStatus === 'error') {
    return <ErrorPage errorMessage={t('loadingError')} />
  }

  return <ErrorPage errorMessage={t('pageNotFound')} />
}
