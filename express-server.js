const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const bcrypt = require('bcrypt');

const {
  getUserByEmail, getUrlsByUser,
  generateRandomString } = require('./helpers.js');

// SEED DATA

const users = {
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

const urlDatabase = {
  // b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  // i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.listen(PORT, () => {
  // TODO: Clear cookies on startup?
  console.log(`Example app listening on port ${PORT}!`);
});

// BEGIN ROUTES

// Verify seed data
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Root route
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

// Display urls
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("<html><body>Error! You are not signed in!</body></html>\n");
  } else {
    const userUrls = getUrlsByUser(req.session.user_id, urlDatabase);
    let templateVars = {
      urls: userUrls,
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  }
});

// Display form to enter new url
app.get("/urls/new", (req, res) => {
  console.log();
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

// Get url resource by id
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.send("<html><body>Error! You are not logged in!</body></html>\n");
  } else {
    if (urlDatabase[req.params.shortURL] &&
      req.session.user_id
      !== urlDatabase[req.params.shortURL]["userID"]) {
      res.send("<html><body>Error! You do not own this url!</body></html>\n");
    } else if (!urlDatabase[req.params.shortURL]) {
      res.send("<html><body>Error! This url does not exist!</body></html>\n");
    } else {
      let shortURL = req.params.shortURL;
      let longURL = urlDatabase[shortURL]["longURL"];
      let templateVars = {
        shortURL, longURL,
        user: users[req.session.user_id]
      };
      res.render("urls_show", templateVars);
    }
  }
});

// Get url resource by id
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(302, longURL);
  } else {
    res.send("<html><body>Error! This url does not exist.</body></html>\n");
  }
});

// Add new url
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let rStr = generateRandomString();
    // rStr = "SHORT_URL";
    // "https://" + for longURL
    urlDatabase[rStr] = { longURL: req.body.longURL, userID: req.session.user_id };
    // console.log(rStr, urlDatabase[rStr]);
    res.redirect(302, "/urls/" + rStr);
  } else {
    res.send("<html><body>Error! Only signed-in users are allowed to create short urls.</body></html>\n");
  }
});

// Update url resource
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    let shortURL = req.params.shortURL;
    console.log(urlDatabase[shortURL]);
    if (urlDatabase[shortURL].userID === req.session.user_id) {
      urlDatabase[shortURL]["longURL"] = req.body.newURL;
      res.redirect(302, "/urls/");
    } else {
      console.log("You're not allowed to delete this url.\n");
      res.status(403).send("You're not allowed to delete this url.\n");
      res.redirect('back');
    }
  } else {
    res.status(403).send("You're not logged in.\n");
  }
});

// Delete url resource
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    console.log();
    console.log(req.params.shortURL);
    console.log(req.session.user_id);
    let shortURL = req.params.shortURL;
    console.log(urlDatabase[shortURL].userID);
    console.log("delete button clicked");
    if (urlDatabase[shortURL].userID === req.session.user_id) {
      delete urlDatabase[req.params.shortURL];
      // res.redirect(302, "/urls");
    } else {
      console.log("You're not allowed to delete this url.\n");
      res.status(403).send("You're not allowed to delete this url.\n");
    }
    res.redirect('back');
  } else {
    res.status(403).send("You're not logged in.\n");
  }
});


// Set cookie on login
app.post("/login", (req, res) => {
  const userKey = getUserByEmail(req.body.email, users);
  if (!userKey) {
    res.status(403).send("User does not exist");
  } else if (bcrypt.compareSync(req.body.password, users[userKey].password) === false) {
    // const databasePassword = bcrypt.hashSync(users[userKey].password, 10);
    // console.log(req.body.password);
    // const typedPassword = req.body.password;
    // console.log("passwords ", databasePassword, typedPassword);

    console.log("Wrong password");
    res.status(403).send("Wrong password");
  } else {
    console.log("logged in");
    req.session.user_id = userKey;
    res.redirect("/urls");
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(302, "/urls");
});

// Display registration page
app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

// Display login page
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  res.render("login", templateVars);
});

// Register new user
app.post("/register", (req, res) => {
  // console.log("form data:", req.body.email, req.body.password);
  // console.log(Object.keys(users));
  console.log("req.body.email:", req.body.email);
  const userKey = getUserByEmail(req.body.email, users);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email and password are required");
  } else if (userKey) {
    res.status(400).send("User with this email exists");
  } else {
    console.log("Creating new user");
    let newKey = generateRandomString();
    let newUser = {};
    newUser.id = newKey;
    newUser.email = req.body.email;
    newUser.password = bcrypt.hashSync(req.body.password, 10);
    console.log(newUser.password);
    users[newKey] = newUser;
    console.log(users[newKey]["email"], users[newKey]["password"]);
    req.session.user_id = newKey;
    res.redirect("/urls");
  }
  console.log();
});
