import React from 'react'
import { useSetMetatag } from 'src/contexts/Metatags'

interface Props {
  id?: string
  errorMessage: string
}

export function ErrorPage(props: Props) {
  const { id, errorMessage } = props

  useSetMetatag({ key: 'name', value: 'robots', content: 'noindex' })

  return <p id={id}>{errorMessage}</p>
}
