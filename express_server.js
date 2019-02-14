var express = require("express");
var app = express();
var crypto = require("crypto");
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

function generateUrl() {
  const newURL = crypto.randomBytes(3).toString("hex");
  return newURL;
}

function generateUserId() {
  const newUserId = crypto.randomBytes(2).toString("hex");
  return newUserId;
}

// Users Database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// URLs Database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Generates a cookie with new user ID and sends and validate if fom is filled
app.post("/register", (req, res) => {
  var userId = generateUserId();
  var email = req.body.email;
  var password = req.body.password;
  users[userId] = { id: userId, email: email, password: password };
  if (email === "" || password === "") {
    res.sendStatus(404);
  }
  res.cookie("registration", users[userId]);
  res.redirect("/urls");
  console.log(users);
});

app.get("/register", (req, res) => {
  var templateVars = {};
  res.render("register", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// Handles the login form submission
app.post("/login", (req, res) => {
  var userName = req.body.username;
  res.cookie("user", userName);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  var templateVars = { urls: urlDatabase, username: req.cookies["user"] };
  res.render("urls_index", templateVars);
});

//Handles the creation of a new short url and links it to the full URL'
app.post("/urls", (req, res) => {
  var shortURL = generateUrl();
  var longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/" + shortURL);
});

// Handles update of shortened urls
app.post("/urls/:shortURL", (req, res) => {
  var newLong = req.body.longURL;
  urlDatabase[req.params.shortURL] = newLong;
  res.redirect("/urls");
});

// Deletes url and redirects to index page
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

// Edit an URL resource
app.get("/urls/new", (req, res) => {
  var templateVars = { username: req.cookies["user"] };

  res.render("urls_new", templateVars);
});

// Handles the logout
app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/urls/");
});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  var longURL = urlDatabase[shortURL];
  var templateVars = { username: req.cookies["user"] };
  if (!longURL.startsWith("http://")) {
    longURL = "http://" + longURL;
  }
  res.redirect(longURL, templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  var templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["user"]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
