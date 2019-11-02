// Find a user by email
const getUserByEmail = function (email, users) {
  let userKey;
  for (let key of Object.keys(users)) {
    if (users[key].email === email) {
      userKey = key;
      break;
    }
  }
  return userKey;
}

// Retrieves a user's urls
const getUrlsByUser = function (id, urlDatabase) {
  let userUrls = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
}

module.exports = { getUserByEmail, getUrlsByUser };
