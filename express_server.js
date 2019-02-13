var express = require("express");
var app = express();
var crypto = require("crypto");
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
    var newURL = crypto.randomBytes(3).toString('hex');
    return newURL;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});
  
app.get("/urls", (req, res) => {
    var templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
    // console.log(req.body);  // Log the POST request body to the console
    var shortURL = generateRandomString();
    var longURL =  req.body.longURL;
    urlDatabase[shortURL] = longURL; 
    
    res.redirect('/urls/' + shortURL); 
  });

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/u/:shortURL", (req, res) => {
    //var shortURL = generateRandomString();
    var shortURL =  req.params.shortURL;
    var longURL = urlDatabase[shortURL];

    if(!longURL.startsWith('http://')) {
        longURL = 'http://' + longURL;
    }
    res.redirect(longURL);
  });



app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    res.render("urls_show", templateVars);
  });

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});