import { TEST } from './actions'

test = (action) => {
  switch (action.type) {
    case TEST:
        return action.testVar
    default:
      return action
  }
}

export default test