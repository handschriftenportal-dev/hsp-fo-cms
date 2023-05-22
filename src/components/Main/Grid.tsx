import React, { ReactNode } from 'react'
import MuiGrid from '@material-ui/core/Grid'

interface Props {
  className?: string
  children: ReactNode
}

export function Grid({ className, children }: Props) {
  return (
    <MuiGrid className={className} container justifyContent="center">
      <MuiGrid item xs={12} sm={10} md={10} lg={10} xl={8}>
        {children}
      </MuiGrid>
    </MuiGrid>
  )
}
