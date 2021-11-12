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

import React, { ReactNode } from 'react'
import {
  createTheme,
  ThemeOptions,
  ThemeProvider
} from '@material-ui/core/styles'


export const basicTheme: ThemeOptions = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 1024,
      lg: 1280,
      xl: 1560,
    }
  },
  palette: {
    primary: {
      main: '#d65151'
    },
    secondary: {
      main: '#1DCFBE'
    },
    background: {
      default: '#F5F4F3',
    },
    grey: {
      200: '#E6E3E0',
      700: '#595754',
    }
  },
  mixins: {
    toolbar: {
      minHeight: 80,
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif, "Junicode"',
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 2
      }
    }
  }
}

interface Props {
  configTheme: ThemeOptions
  children: ReactNode
}

export function Theme(props: Props) {
  const theme = createTheme(basicTheme, props.configTheme)

  return (
    <ThemeProvider theme={theme}>
      {props.children}
    </ThemeProvider>
  )
}
