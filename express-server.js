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

app.listen(PORT, () => {
  //TODO: Clear session on start ?
  console.log(`Example app listening on port ${PORT}!`);
});

const { users, urlDatabase } = require('./app-data');
const { getUserByEmail, getUrlsByUser,
  generateRandomString } = require('./helpers.js');


// BEGIN ROUTES

// Verify seed data
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Root resource
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
    urlDatabase[rStr] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect(302, "/urls/" + rStr);
  } else {
    res.send("<html><body>Error! Only signed-in users are allowed to create short urls.</body></html>\n");
  }
});

// Update url resource
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    let shortURL = req.params.shortURL;
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
    let shortURL = req.params.shortURL;
    if (urlDatabase[shortURL].userID === req.session.user_id) {
      delete urlDatabase[req.params.shortURL];
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
    res.status(403).send("Wrong password");
  } else {
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
  const userKey = getUserByEmail(req.body.email, users);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email and password are required");
  } else if (userKey) {
    res.status(400).send("User with this email exists");
  } else {
    let newKey = generateRandomString();
    let newUser = {};
    newUser.id = newKey;
    newUser.email = req.body.email;
    newUser.password = bcrypt.hashSync(req.body.password, 10);
    users[newKey] = newUser;
    // console.log(users[newKey]["email"], users[newKey]["password"]);
    req.session.user_id = newKey;
    res.redirect("/urls");
  }
});
