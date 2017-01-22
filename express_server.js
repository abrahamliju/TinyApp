var express = require('express');
var app = express();
const bcrypt = require('bcrypt')
var PORT = process.env.PORT || 8080 //default Port

app.set("view engine", "ejs");
app.use("/public", express.static(__dirname+"/public"))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys:['keys1', 'keys2']
}));


var urlDatabase = {

};

let users = {

};

function generateRandomString(){
  let randomString = '';
  let alphaNumValues = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for(var i = 6; i > 0; --i){
    randomString += alphaNumValues[Math.floor(Math.random() * alphaNumValues.length )];
  }
  return randomString ;
}

function checkUserExists(eaddress, Db){
  let UserExist = false;
  for(var key in Db){
    if(Db[key].Email === eaddress){
      UserExist = true;
      return UserExist;
    }else{
      return UserExist
    }
  }
}

app.get("/register", (req, res) => {
  if(req.session.userName){
    res.render("/");
  }else{
    res.status(200).render("urls_register")
  }
});

app.post("/register", (req, res) => {
  let lengthOfPasswd = 10;
  let UserEmailAdd = req.body.email;
  let UserPassword = bcrypt.hashSync(req.body.password, lengthOfPasswd);
  let UserRandomId = generateRandomString();
  if(!UserEmailAdd || !UserPassword){
    res.status(400).send('Email Address or Password Missing!');
  }
  else if(!checkUserExists(UserEmailAdd, users)){
    users[UserEmailAdd] = {Id: UserRandomId,Email: UserEmailAdd, Password: UserPassword};
    res.status(200).redirect('/');
  }else {
    res.status(400).send('User Already Registered')
  }
});

app.get("/urls", (req, res) => {
  if(req.session.userName){
    let templateVars = {
      urls: urlDatabase[req.session.userName],
      loggedUser: req.session.userName
    }
    console.log("index", templateVars);
    res.render("urls_index", templateVars);
  }else{
    res.status(401).redirect("/login_link")
  }
});

app.get("/login_link", (req, res) => {
  res.render("login_link")
});

app.get("/urls/new", (req, res) => {
  if(req.session.userName){
    let templateVars = {};
    templateVars.loggedUser = req.session.userName
    res.status(200).render("urls_new", templateVars);
  }else{
    res.status(401).redirect("/login_link")
  }
});

app.post("/urls/create", (req, res) => {
  let logUsrId = req.session.userName;
  for(key in users){
    if(logUsrId === key){
      // accept data
      let longUrl = req.body.longURL;
      //generate string
      let shorturl = generateRandomString();
      //storekey:value
      // urlDatabase[logUsrId][shorturl] = longUrl;
        res.redirect('/urls/'+shorturl);
      // //console.log("Create",urlData);
       console.log("Create",urlDatabase);
      if(urlDatabase[logUsrId]){
        urlDatabase[logUsrId][shorturl] = longUrl;
      }else{
        urlDatabase[logUsrId] = {};
        urlDatabase[logUsrId][shorturl] = longUrl;
      }

    }
  }
  if(!logUsrId){
    res.status(403).send("Please Login or Register to create links");
  }
});

app.get("/login", (req, res) => {
  if(req.session.userName){
    res.redirect("/");
  }else{
    res.status(200).render("urls_login")
  }
});

app.post("/login", (req, res) => {
  let UserLoginEmail = req.body.username;
  let UserLoginPassword = req.body.password;
  for(key in users) {
    if(users[key].Email === UserLoginEmail && bcrypt.compareSync(UserLoginPassword, users[key].Password)){
      req.session.userName = users[key].Email;
      res.redirect('/');
    }
  }
  if(!checkUserExists(UserLoginEmail, users)){
    res.status(403).send("UserName or Password does not match");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.post("/urls/:id/delete", (req, res) => {
  let valueToDel = req.params.id;
  delete urlDatabase[req.session.userName][valueToDel]
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  let keyToUpdate = req.params.id;
  let valueToUpdate = req.body.updatedUrl;
  for(key in urlDatabase[req.session.userName]){
    if(key === keyToUpdate){
      urlDatabase[req.session.userName][keyToUpdate] = valueToUpdate;
    }
  }
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  let logUsrId = req.session.userName;
  let shortUrl = req.params.id;
  let longUrl  = urlDatabase[logUsrId][shortUrl];
  let templateVars = {}
  if(req.session.userName){
    templateVars.loggedUser = req.session.userName;
    templateVars.shortUrl = shortUrl;
    templateVars.longUrl = longUrl;
    console.log("Urls/id",templateVars)
    console.log("Urls/id - urlDatabase", urlDatabase)
    res.render("urls_show", templateVars);
  }else{
    res.status(401).res.redirect("/login_link");
  }
});

app.get("/u/:id", (req, res) => {
  for(key in urlDatabase){
    for(url in urlDatabase[key]){
      if(url === req.params.id){
        res.redirect(urlDatabase[req.session.userName][url])
      }
    }
  }
  res.redirect(urlDatabase[req.params.id]);
});

app.get("/", (req, res) => {
  if(req.session.userName){
    res.redirect("/urls")
  }else{
    res.redirect("/login");
  }
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