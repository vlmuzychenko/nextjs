import { types } from "./types"

export const userActions = {
  fillUser: (userId) => {
    return {
      type: types.FILL_USER,
      payload: userId,
    }
  },
  setVisitCounts: (userVisitCounts) => {
    return {
      type: types.SET_VISIT_COUNTS,
      payload: userVisitCounts,
    }
  },
  setUserType: (userType) => {
    return {
      type: types.SET_USER_TYPE,
      payload: userType,
    }
  }
}