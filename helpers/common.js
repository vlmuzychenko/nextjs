import { UserType } from '../const/const';

export const getUniqueId = () => Math.floor(Math.random() * 1000000);

export const setDateOfReceiving = (promises, data, fileName) => {
  const updatedData = data.map((item) => {
    item.dateOfReceiving = `${new Date()}`;
    return item;
  });
  promises.writeFile(fileName, '');
  promises.writeFile(fileName, JSON.stringify(updatedData, null, 4));
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

export const updateUserType = (userType) => {
  if (userType === UserType.GUEST) {
    return UserType.FRIEND;
  } else {
    return UserType.FAM;
  }
}

export const getParsedFile = (source) => {
  return source ? JSON.parse(source) : [];
}

export const getItemById = (arr, id) => {
  const isCurrentItem = (element, index, array) => {
    return element.id === id;
  };
  const currentIndex = arr.findIndex(isCurrentItem);

  return arr[currentIndex];
}

export const getSlugIndex = (data, slug) => {
  return data.findIndex((element, index, array) => {
    if (element && slug) {
      return slug === element.id;
    }
  });
}