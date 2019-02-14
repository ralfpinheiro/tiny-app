var express = require("express");
var app = express();
var crypto = require("crypto");
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString() {
  var newURL = crypto.randomBytes(3).toString("hex");
  return newURL;
}

var urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Handles the login form submission
app.post("/login", (req, res) => {
  var userName = req.body.username;
  res.cookie("user", userName);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  console.log;
  var templateVars = { urls: urlDatabase, username: req.cookies["user"] };
  res.render("urls_index", templateVars);
});

//Handles the creation of a new short url and links it to the full URL'
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  var shortURL = generateRandomString();
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
