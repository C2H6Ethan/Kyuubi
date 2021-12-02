// define type
export const SWITCH_THEME = 'SWITCH_THEME'
export const TEST = 'TEST'

// dispatch actions
export const switchTheme = BaseTheme => {
  return dispatch => {
    dispatch({
      type: SWITCH_THEME,
      baseTheme: BaseTheme
    })
  }
}

export const test = () => {
  return dispatch => {
    dispatch({
      type: TEST,
      testvar: 'wohoo'
    })
  }
}