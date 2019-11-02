const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const { getUserByEmail, getUrlsByUser } = require('./helpers.js');

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key']
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const bcrypt = require('bcrypt');

app.set("view engine", "ejs");

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
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  // TODO: Clear cookies on startup?
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.get("/urls", (req, res) => {
  // console.log("user:", users["userRandomID"]);
  // console.log("user:", users[req.session.user_id]);

  const userUrls = getUrlsByUser(req.session.user_id, urlDatabase);
  // console.log("userUrls", userUrls);

  // console.log(req.session.user_id);
  let templateVars = {
    urls: userUrls,
    user: users[req.session.user_id]
  };
  // console.log(templateVars.urls);

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  console.log();
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params.shortURL);
  // console.log(urlDatabase[req.params.shortURL]);
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.longURL],
    user: users[req.session.user_id]
  };
  console.log(req.params.shortURL);
  res.render("urls_show", templateVars);
});

// Add new URL
app.post("/urls", (req, res) => {
  // console.log("user_id ", req.session.user_id);

  // console.log("user_id:", res.cookie["user_id"]);
  // console.log(req.body);
  // console.log(res.json);
  let rStr = generateRandomString();
  // rStr = "SHORT_URL";
  urlDatabase[rStr] = { longURL: req.body.longURL, userID: req.session.user_id }
  // console.log(rStr, urlDatabase[rStr]);
  res.redirect(302, "/urls/");
});

// Get a URL resource
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(302, longURL);
});

// Delete URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log();
  console.log(req.params.shortURL);
  console.log(req.session.user_id);

  let shortURL = req.params.shortURL;
  console.log(urlDatabase[shortURL].userID);
  console.log("delete button clicked");

  if (urlDatabase[shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    // res.redirect(302, "/urls");
  }
  else {
    console.log("You're not allowed to delete this url.\n");
    res.status(403).send("You're not allowed to delete this url.\n");
  }
  res.redirect('back');
});

// Update URL resource
app.get("/urls/:shortURL", (req, res) => {
  console.log("edit button clicked");
  console.log(req.params.shortURL);
  let urlKey = req.params.shortURL;
  // res.redirect(302, "/urls/" + urlKey);
});

// Update URL resource
app.post("/urls/:shortURL", (req, res) => {
  // console.log("req.body:")
  // console.log(req.body);
  // console.log("req.params:");
  // console.log(req.params);
  let shortURL = req.params.shortURL;
  console.log(urlDatabase[shortURL]);

  if (urlDatabase[shortURL].userID === req.session.user_id) {
    // console.log("url found!")
    urlDatabase[shortURL]["longURL"] = req.body.newURL;
    res.redirect(302, "/urls/");
  }
  else {
    console.log("You're not allowed to delete this url.\n");
    res.status(403).send("You're not allowed to delete this url.\n");
    res.redirect('back');
  }
});

// Set cookie on login
app.post("/login", (req, res) => {
  const userKey = getUserByEmail(req.body.email, users);

  if (!userKey) {
    res.status(403).send("User does not exist");
  }

  else if (bcrypt.compareSync(req.body.password, users[userKey].password) === false) {
    const databasePassword = bcrypt.hashSync(users[userKey].password, 10);

    // console.log(req.body.password);
    // const typedPassword = req.body.password;
    // console.log("passwords ", databasePassword, typedPassword);

    console.log("Wrong password");
    res.status(403).send("Wrong password");
  }
  else {
    console.log("logged in");
    // res.cookie('user_id', userKey);
    req.session.user_id = userKey;
    // console.log(req.session.user_id);
    res.redirect("/urls");
  }
});

// Logout
app.post("/logout", (req, res) => {
  // res.clearCookie('user_id');
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
  }

  else if (userKey) {
    res.status(400).send("User with this email exists");
  }
  else {
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


// Generate random string for object keys
const generateRandomString = function () {
  let randomString = "";
  let characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  // console.log(characters.length + "\n--");
  for (let i = 0; i < 6; i++) {
    let rand = Math.floor(Math.random() * 63);
    // if (rand === 0 || rand === 62) console.log(rand);
    randomString += characters.charAt(rand);
  }
  return randomString;
}
