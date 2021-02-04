import { UserType } from '../../const/const';
import { types } from "./types";

const initialState = {
  userId: 0,
  userVisitCounts: 0,
  userType: UserType.GUEST
};

export const userReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.FILL_USER:
      return {...state, ...payload};
    case types.SET_VISIT_COUNT:
      return {...state, ...payload};
    case types.SET_USER_TYPE:
      return {...state, ...payload};
      
    default:
      return state;
  };
};
