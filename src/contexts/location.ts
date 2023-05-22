import { useSelector } from 'react-redux'
import { selectors } from './state'

export function useLocation() {
  return useSelector(selectors.getLocation)
}
