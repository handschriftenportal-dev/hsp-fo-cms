import { setupServer } from 'msw/node'
import { rest } from 'msw'
import {
  WordpressMenuItem,
  WordpressPage,
  WordpressMenu,
} from 'src/contexts/wordpress'

export const wordpressItemsEn: WordpressMenuItem[] = [
  {
    ID: 1,
    title: 'Planets',
    url: 'http://handtest.handschriftenportal.de/planets?lang=en',
    child_items: [
      {
        ID: 2,
        title: 'Mercury',
        url: 'http://handtest.handschriftenportal.de/mercury?lang=en',
      },
      {
        ID: 3,
        title: 'Saturn',
        url: 'http://handtest.handschriftenportal.de/saturn?lang=en',
      },
    ],
  },
  {
    ID: 4,
    title: 'Missions',
    url: 'http://handtest.handschriftenportal.de/missions?lang=en',
  },
]

export const wordpressItemsDe: WordpressMenuItem[] = [
  {
    ID: 5,
    title: 'Planeten',
    url: 'http://handtest.handschriftenportal.de/planets',
    child_items: [
      {
        ID: 6,
        title: 'Merkur',
        url: 'http://handtest.handschriftenportal.de/mercury',
      },
      {
        ID: 7,
        title: 'Saturn',
        url: 'http://handtest.handschriftenportal.de/saturn',
      },
    ],
  },
  {
    ID: 8,
    title: 'Missionen',
    url: 'http://handtest.handschriftenportal.de/missions',
  },
]

const wordpressPagePlanetsEn: WordpressPage = {
  id: 1,
  title: {
    rendered: 'Planets',
  },
  content: {
    rendered: '<p>Planets<p/>',
  },
}

const wordpressPageMercuryEn: WordpressPage = {
  id: 2,
  title: {
    rendered: 'Mercury',
  },
  content: {
    rendered: '<p>Mercury<p/>',
  },
}

const wordpressPagePlanetsDe: WordpressPage = {
  id: 5,
  title: {
    rendered: 'Planeten',
  },
  content: {
    rendered: '<p>Planeten<p/>',
  },
}

const wordpressPageMercuryDe: WordpressPage = {
  id: 6,
  title: {
    rendered: 'Merkur',
  },
  content: {
    rendered: '<p>Merkur<p/>',
  },
}

export const wordpressMenusEn: WordpressMenu = {
  taxonomy: 'nav_menu',
  items: wordpressItemsEn,
}

export const wordpressMenusDe: WordpressMenu = {
  taxonomy: 'nav_menu',
  items: wordpressItemsDe,
}

export const wordpressServer = setupServer(
  rest.get(
    'http://example.com/api/wordpress/wp-json/menus/v1/menus/menu-en',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(wordpressMenusEn))
    }
  ),
  rest.get(
    'http://example.com/api/wordpress/wp-json/menus/v1/menus/menu-de',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(wordpressMenusDe))
    }
  ),

  rest.get(
    'http://example.com/api/wordpress/wp-json/wp/v2/pages',
    (req, res, ctx) => {
      const lang = req.url.searchParams.get('lang')
      const slug = req.url.searchParams.get('slug')
      let pages: WordpressPage[]

      if (lang !== 'en' && lang !== 'de') {
        throw new Error('wordpressServer: expect language to be "en" or "de".')
      }

      if (!slug) {
        throw new Error('wordpressServer: expect slug to be a non empty string')
      }

      if (lang === 'de' && slug === 'planets') {
        pages = [wordpressPagePlanetsDe]
      } else if (lang === 'de' && slug === 'mercury') {
        pages = [wordpressPageMercuryDe]
      } else if (lang === 'en' && slug === 'planets') {
        pages = [wordpressPagePlanetsEn]
      } else if (lang === 'en' && slug === 'mercury') {
        pages = [wordpressPageMercuryEn]
      } else {
        pages = []
      }

      return res(ctx.status(200), ctx.json(pages))
    }
  )
)
