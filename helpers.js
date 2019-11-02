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

// Generate random string for object keys
const generateRandomString = function () {
  let randomString = "";
  let characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    let rand = Math.floor(Math.random() * 63);
    // if (rand === 0 || rand === 62) console.log(rand);
    randomString += characters.charAt(rand);
  }
  return randomString;
}

module.exports = { getUserByEmail, getUrlsByUser, generateRandomString };
