var express = require("express");
var app = express();
var crypto = require("crypto");
var PORT = 8080; // default port 8080
var cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["1", "2"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

// Genetares new Url
function generateUrl() {
  const newURL = crypto.randomBytes(3).toString("hex");
  return newURL;
}
// Generate User Id
function generateUserId() {
  const newUserId = crypto.randomBytes(2).toString("hex");
  return newUserId;
}
// Gets User Id
function getCurrentUser(id) {
  return users[id];
}
// Users Database
var users = {};
// URLs Database
var urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "2" }
};

//get authenticated user
function authenticate(givenEmail, givenPassword) {
  for (var aUser in users) {
    var userExists = users[aUser].email === givenEmail;
    var passwordExists = bcrypt.compareSync(givenPassword, users[aUser].password);
    if (userExists && passwordExists) {
      return users[aUser].id;
    }
  }
  return false;
}

// Generates a cookie with new user ID and sends and validate if fom is filled
app.post("/register", (req, res) => {
  var userId = generateUserId();
  var email = req.body.email;
  var password = req.body.password;
  var hashedPassword = bcrypt.hashSync(password, 10);
  // Checks for empty email or passowrd
  if (email === "" || password === "") {
    // res.sendStatus(400);
    res.redirect("/register");
  } else {
    var newUser = { id: userId, email: email, password: hashedPassword };
    // Creates new user profile and creates a cookie
    users[userId] = {
      id: userId,
      email: email,
      password: hashedPassword
    };
    req.session.userId = userId;
    res.redirect("/urls");
  }
});

// Renders the registration page
app.get("/register", (req, res) => {
  var templateVars = {};
  res.render("register", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// Handles the login form submission
app.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  var authenticated = authenticate(email, password);
  if (!authenticated) {
    // if user is not authenticaded redirect him to the registration page (aka res.sendStatus(403))
    res.redirect("/register");
  } else {
    req.session.userId = authenticated;
    res.redirect("/urls");
  }
});

// Renders login page
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/urls", (req, res) => {
  var templateVars = { urls: urlDatabase, id: getCurrentUser(req.session.userId) };
  var urlsOfUser = {};
  for (let key in urlDatabase) {
    if (templateVars.id) {
      if (urlDatabase[key].userID === req.session.userId) {
        urlsOfUser[key] = urlDatabase[key];
      }
    }
  }
  templateVars.urls = urlsOfUser;
  res.render("urls_index", templateVars);
});

//Handles the creation of a new short url and redirects to the result page ("/urls/" + shortURL)'
app.post("/urls", (req, res) => {
  var shortURL = generateUrl();
  var longURL = req.body.longURL;
  var userID = req.session.userId; // .id  UserID is an object with user profile
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID
  };
  res.redirect("/urls/" + shortURL);
});

// Handles update of shortened urls
app.post("/urls/:shortURL", (req, res) => {
  var currentUser = getCurrentUser(req.session.userId);
  if (!currentUser) {
    res.sendStatus(403);
  } else {
    var newLong = req.body.longURL;
    urlDatabase[req.params.shortURL].longURL = newLong;
    res.redirect("/urls");
  }
});

// Deletes url and redirects to index page
app.post("/urls/:shortURL/delete", (req, res) => {
  var currentUser = getCurrentUser(req.session.userId);
  if (!currentUser) {
    res.sendStatus(403);
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  }
});

// Permission to Edit an URL resource
app.get("/urls/new", (req, res) => {
  var templateVars = { urls: urlDatabase, id: getCurrentUser(req.session.userId) };
  if (!templateVars.id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// Handles the logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/");
});

// Get request for /u/:ShortURL - (Authentication-free page)
app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  var longURL = urlDatabase[shortURL].longURL;
  if (!longURL.startsWith("http://")) {
    longURL = "http://" + longURL;
  }
  res.redirect(longURL);
});

// Get request for (Page Authentication)
app.get("/urls/:shortURL", (req, res) => {
  var templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    id: getCurrentUser(req.session.userId)
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
