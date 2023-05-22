import { createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { WebModuleLocation } from 'hsp-web-module'
import { AnyAction, createAction, isType } from '../utils/stateUtils'
import { I18nConfig } from './i18n'

export interface State {
  location: WebModuleLocation
  i18nConfig: I18nConfig
}

export const actions = {
  setState: createAction<State>('SET_STATE'),
  setLocation: createAction<State['location']>('SET_LOCATION'),
  setI18nConfig: createAction<State['i18nConfig']>('SET_I18N_CONFIG'),
}

export const selectors = {
  getLocation: (state: State) => state.location,
  getI18nConfig: (state: State) => state.i18nConfig,
}

export const defaultState: State = {
  location: {
    pathname: '/',
    search: '',
    hash: '',
  },
  i18nConfig: {
    language: 'de',
    disableTranslation: false,
  },
}

export function reducer(state = defaultState, action: AnyAction): State {
  if (isType(action, actions.setState)) {
    return action.payload
  }

  if (isType(action, actions.setLocation)) {
    return { ...state, location: action.payload }
  }

  if (isType(action, actions.setI18nConfig)) {
    return { ...state, i18nConfig: action.payload }
  }

  return state
}

export const makeStore = (initialState?: State) =>
  createStore(reducer, initialState, composeWithDevTools())
