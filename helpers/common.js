import { UserType } from '../const/const';

export const getUniqueId = () => Math.floor(Math.random() * 1000000);

export const setDateOfReceiving = (data, date) => {
  data.map(item => {
    item.dateOfReceiving = date
  });

  return data;
}

export const getCurrentDate = () => {
  const date = new Date();

  return date.toDateString();;
}

export const getCurrentUser = (data, userId) => {
  return data.findIndex(user => user.id == userId);
}

export const getUserType = (visitCount) => {
  if (visitCount < 3) {
    return UserType.GUEST;
  } else if (visitCount >= 3 && visitCount < 5) {
    return UserType.FRIEND;
  } else {
    return UserType.FAM;
  }
}

export const updateUserType = (visitCount) => {
  if (visitCount < 3) {
    return UserType.FRIEND;
  } else {
    return UserType.FAM;
  }
}