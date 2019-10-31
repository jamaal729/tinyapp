
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
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
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["user_id"],
    user: users[req.cookies.user_id]
  };
  // console.log(users);
  // console.log(req.cookies);
  // console.log(req.cookies.user_id);
  // // console.log(req.cookies.user_id);
  // let aaa = req.cookies.user_id;
  // console.log("aaa:", aaa);
  // console.log("object:", users[aaa] );
  console.log("user:", users["userRandomID"]);
  console.log("user:", users[req.cookies.user_id]);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["user_id"],
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params.shortURL);
  // console.log(urlDatabase[req.params.shortURL]);
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.longURL],
    username: req.cookies["user_id"],
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

// Add new URL
app.post("/urls", (req, res) => {
  console.log(req.body);
  // console.log(res.json);
  let rStr = generateRandomString();
  urlDatabase[rStr] = req.body.longURL;
  console.log(rStr, urlDatabase[rStr]);
  res.redirect(302, "/urls/" + rStr);
});

// Get a URL resource
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(302, longURL);
});

// Delete URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("delete button clicked");
  delete urlDatabase[req.params.shortURL];
  // res.redirect(302, "/urls");
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
  console.log("Updating")
  console.log(req.body);

  urlDatabase[shortURL] = req.body.longURL;
  // console.log(rStr, urlDatabase[rStr]);
  res.redirect(302, "/urls/" + rStr);
});

// Set cookie on login
app.post("/login", (req, res) => {
  // console.log(req.cookies);

  let userFound = false;
  let userObj = {};
  let userKey;
  for (let key of Object.keys(users)) {
    // console.log("::: database:", users[key].email, ", ", "req: ", req.body.email);
    if (users[key].email === req.body.email) {
      userFound = true;
      userKey = key;
      console.log("userFound: ", userFound);
      console.log(users[key].id);
      break;
    }
  }

  if (userFound !== true) {
    res.status(403).send("User does not exist");
  }
  else if (users[userKey].password !== req.body.password) {
    console.log("Wrong password");
    res.status(403).send("Wrong password");
  }
  else {
    console.log("logged in");
    res.cookie('user_id', userKey);
    console.log(req.body.username);
    // res.redirect('back');
    res.redirect("/urls");
  }

});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(302, "/urls");
});

// Display registration page
app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["user_id"],
    user: users[req.cookies.user_id]
  };
  res.render("register", templateVars);
});


// Display login page
app.get("/login", (req, res) => {
  let templateVars = {
    username: req.cookies["user_id"],
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("login", templateVars);
});

// Register new user
app.post("/register", (req, res) => {
  // console.log("form data:", req.body.email, req.body.password);
  // console.log(Object.keys(users));

  let userFound = false;
  for (let key of Object.keys(users)) {
    // console.log("::: database:", users[userKey].email, ", ", "req: ", req.body.email);
    if (users[key].email === req.body.email) {
      userFound = true;
      break;
    }
  }

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email and password are required");
  }

  else if (userFound === true) {
    res.status(400).send("User with this email exists");
  }
  else {
    console.log("Creating new user");
    let newKey = generateRandomString();
    let newUser = {};
    newUser.id = newKey;
    newUser.email = req.body.email;
    newUser.password = req.body.password;
    users[newKey] = newUser;
    console.log("------------------------------");
    console.log(users);
    console.log("------------------------------");
    console.log(users[newKey]["email"], users[newKey]["password"]);

    res.cookie('user_id', newKey);
    res.redirect("/urls");
  }

  // console.log(users);
  console.log();
});

function generateRandomString() {
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
