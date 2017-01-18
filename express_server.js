var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080 //default Port

app.set("view engine", "ejs");
app.use("/public", express.static(__dirname+"/public"))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(){
  let randomString = '';
  let alphaNumValues = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for(var i = 6; i > 0; --i){
    randomString += alphaNumValues[Math.floor(Math.random() * alphaNumValues.length )];
  }
  return randomString ;
}

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/create", (req, res) => {
  // accept data
  let longUrl = req.body.longURL;
  //generate string
  let shorturl = generateRandomString();
  //storekey:value
  urlDatabase[shorturl] = longUrl;
  //redirect to usrs
  res.redirect('/urls/'+shorturl);
});

app.post("/urls/:id/delete", (req, res) => {
  let valueToDel = req.params.id;
  delete urlDatabase[valueToDel]
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  let keyToUpdate = req.params.id;
  let valueToUpdate = req.body.updatedUrl;
  urlDatabase[keyToUpdate] = valueToUpdate;
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  let shortUrl = req.params.id;
  let longUrl  = urlDatabase[shortUrl];
  let templateVars = {};
  templateVars[shortUrl] = longUrl;
  res.render("urls_show", {templateVars: templateVars});
});

app.get("/u/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id]);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


app.post("/urls", (req,res) => {
  console.log(req.body);
  res.send("ok");
});

