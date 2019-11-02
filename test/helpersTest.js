const { assert } = require('chai');

const { getUserByEmail, getUrlsByUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });

  it('should return undefined with invalid email', function () {
    const user = getUserByEmail("nonuser@example.com", testUsers)
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
});


describe('getUrlsByUser', function () {
  it('should return a user\'s urls', function () {
    const urls = getUrlsByUser("aJ48lW", testUrlDatabase)
    const expectedOutput = {
      'b6UTxQ': { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
      'i3BoGr': { longURL: "https://www.google.ca", userID: "aJ48lW" }
    };
    // Write your assert statement here
    assert.deepEqual(urls, expectedOutput);
  });

  it('should return undefined if user has no urls', function () {
    const urls = getUrlsByUser("noUser", testUrlDatabase)
    const expectedOutput = {};
    // Write your assert statement here
    assert.deepEqual(urls, expectedOutput);
  });

});
