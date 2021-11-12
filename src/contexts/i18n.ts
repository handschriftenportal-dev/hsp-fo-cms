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

import { createContext, useContext, useEffect, useState } from 'react'
import { createObservable, Observable } from 'src/utils/observable'
import { WebModuleLanguage } from 'hsp-web-module'
import de from '../../locales/de.json'
import en from '../../locales/en.json'
import { isStringArray } from 'src/utils/isStringArray'

// Structure of the translation files (e.g. de.json)
interface LanguageTable {
  [key: string]: string | LanguageTable
}

export interface I18nInfos {
  language: WebModuleLanguage
  disableTranslation: boolean
}

export type I18nStore = Observable<I18nInfos>

// The language store is similar to the redux store:
// It can be created an accessed from outside the react component tree.
//
// For testing the language can be set to undefined.
export const createI18nStore = (infos: I18nInfos): I18nStore => {
  return createObservable(infos)
}

export const I18nContext = createContext(createI18nStore({
  language: 'de',
  disableTranslation: false,
}))

// Returns the current i18n infos.
// It updates each time someone sets the language (e.g. via API call)
export function useI18nInfos() {
  const i18nStore = useContext(I18nContext)
  const [infos, setInfos] = useState(i18nStore.get())

  useEffect(() => {
    return i18nStore.subscribe(setInfos)
  }, [])

  return infos
}

export function useLanguage() {
  return useI18nInfos().language
}

// The translate function takes an arbitrary list of argument.
// All arguments must be strings except of the last argument which can be any type.
//
// If translation is disabled it it return a dot-concatenation of all input strings.
//
// If the last argument is a string it tries to find a translation based on all args.
// If no translation was found it returns the last argument (string).
//
// If the last argument is an array of strings it tries to find a translation for all
// strings in the array and returns a comma-concatenation of the result
//
// If the last argument is a type other than string and or string[] it will be returned.
//
// See the test code for details of usage.
export function createTranslate(table: LanguageTable, disabled: boolean) {
  return function translate(...args: any[]) {

    const find = (keys: string[]) => {
      let cur: LanguageTable | string | undefined = table
      for (const key of keys) {
        (typeof cur === 'object' && key in cur)
          ? cur = cur[key]
          : cur = undefined
      }
      return cur as string | undefined
    }

    const lastKey = args.pop()
    const keys = args as string[]

    if (disabled) {
      return [...keys, lastKey].join('.')
    }

    if (typeof lastKey === 'string') {
      return find([...keys, lastKey]) || lastKey
    }

    if (isStringArray(lastKey)) {
      return lastKey.map(s => find([...keys, s]) || s).join(', ')
    }

    return lastKey
  }
}

// Same as the `translate` function but works on template strings.
// `fillers` are a map from template tags to strings.
export function createTranslateTemplate(table: LanguageTable, disabled: boolean) {
  const t = createTranslate(table, disabled)

  return function translateTemplate(fillers: Record<string, string>, ...args: any[]) {
    const text = t(...args)
    return Object.keys(fillers).reduce((acc, key) => {
      return acc.replace(new RegExp(`{{${key}}}`, 'g'), fillers[key])
    }, text)
  }
}

// Returns translations function for simple text and for template strings.
// It updates each time someone changes the language (e.g. via API call)
export function useTranslation() {
  const infos = useI18nInfos()
  const table = { de, en }[infos.language]

  if (!table) {
    console.warn(`Language ${infos.language} is not supported.`)
  }

  return {
    t: createTranslate(table, infos.disableTranslation),
    tt: createTranslateTemplate(table, infos.disableTranslation),
  }
}


