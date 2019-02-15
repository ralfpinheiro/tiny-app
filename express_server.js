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
var users = {
  userRandomID: {
    id: "1",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "2",
    email: "user2@example.com",
    password: "2"
  }
};

// URLs Database
var urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "2" }
};

//get authenticated user
function authenticate(givenEmail, givenPassword) {
  for (aUser in users) {
    if (users[aUser].email === givenEmail && users[aUser].password === givenPassword) {
      return users[aUser];
    }
  }
  return false;
}

// Generates a cookie with new user ID and sends and validate if fom is filled
app.post("/register", (req, res) => {
  var userId = generateUserId();
  var email = req.body.email;
  var password = req.body.password;
  // Checks for empty email or passowrd
  if (email === "" || password === "") {
    res.sendStatus(400);
  } else {
    var newUser = { id: userId, email: email, password: password };
    // Creates new user profile and creates a cookie
    users[userId] = {
      email: email,
      password: password
    };
    res.cookie("registration", newUser);
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
    res.redirect("/register"); // res.sendStatus(403);
  } else {
    res.cookie("registration", authenticated);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/urls", (req, res) => {
  var templateVars = { urls: urlDatabase, id: req.cookies["registration"] };
  var urlsOfUser = {};
  //loop through urlDatabase and if the userId = req.cookies["registration"], add it to the list
  for (let key in urlDatabase) {
    if (templateVars.id) {
      if (urlDatabase[key].userID === req.cookies["registration"].id) {
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
  var userID = req.cookies["registration"].id; // UserID is an object with user profile
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID
  };
  res.redirect("/urls/" + shortURL);
});

// Handles update of shortened urls
app.post("/urls/:shortURL", (req, res) => {
  var currentUser = { id: req.cookies["registration"] };
  if (!authenticate(currentUser.email, currentUser.password)) {
    res.sendStatus(403);
  } else {
    var newLong = req.body.longURL;
    urlDatabase[req.params.shortURL].longURL = newLong;
    res.redirect("/urls");
  }
});

// Deletes url and redirects to index page
app.post("/urls/:shortURL/delete", (req, res) => {
  var currentUser = { id: req.cookies["registration"] };
  if (!authenticate(currentUser.email, currentUser.password)) {
    res.sendStatus(403);
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  }
});

// Permission to Edit an URL resource
app.get("/urls/new", (req, res) => {
  var templateVars = { urls: urlDatabase, id: req.cookies["registration"] };
  if (!templateVars.id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// Handles the logout
app.post("/logout", (req, res) => {
  res.clearCookie("registration");
  res.redirect("/urls/");
});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  var longURL = urlDatabase[shortURL].longURL;
  var templateVars = { id: req.cookies["registration"] };
  if (!longURL.startsWith("http://")) {
    longURL = "http://" + longURL;
  }
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  var templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    id: req.cookies["registration"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // var templateVars = {
  //   shortURL: req.params.shortURL,
  //   longURL: urlDatabase[req.params.shortURL],
  //   id: req.cookies["registration"]
  // };
  // res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
