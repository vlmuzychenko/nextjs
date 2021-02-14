import { UserType } from '../../const/const';
import { types } from "./types";

const initialState = {
  userId: 0,
  userVisitCounts: 1,
  userType: UserType.GUEST
};

export const userReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.FILL_USER:
      return {...state, userId: payload};
    case types.SET_VISIT_COUNTS:
      return {...state, userVisitCounts: payload};
    case types.SET_USER_TYPE:
      return {...state, userType: payload};
      
    default:
      return state;
  };
};
