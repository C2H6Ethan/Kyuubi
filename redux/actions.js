// define type
export const SWITCH_THEME = 'SWITCH_THEME'

// dispatch actions
export const switchTheme = BaseTheme => {
  return dispatch => {
    dispatch({
      type: SWITCH_THEME,
      baseTheme: BaseTheme
    })
  }
}