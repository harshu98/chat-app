const generateMessage = (text, user) => {
  return {
    message: text,
    user: user,
    time: new Date().getTime(),
  };
};
const generateLocation = (location, user) => {
  return {
    location: location,
    user: user,
    time: new Date().getTime(),
  };
};
module.exports = { generateMessage, generateLocation };
