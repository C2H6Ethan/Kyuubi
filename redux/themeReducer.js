import { defaultTheme } from '../styles/theme'
import { SWITCH_THEME } from './actions'

const initialState = {
  theme: { ...defaultTheme }
}

const themeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SWITCH_THEME:
      let newState = {
        ...state,
        theme: { ...state.theme, ...action.baseTheme }
      }
      return newState
    default:
      return state
  }
}

export default themeReducer