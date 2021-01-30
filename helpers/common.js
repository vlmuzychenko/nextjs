export const getUniqueId = () => Math.floor(Math.random() * 10000);

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