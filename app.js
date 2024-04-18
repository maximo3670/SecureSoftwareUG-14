/*
App.js

Author: Max Neil
Created: 21/03/2024
Description: 
    This script is to handle all nodeJs queries such as Get requests for the website
    It handles changing webpages and SQL database queries.

    make sure nodeJs is installed in your computer. First time setup may require you to type:
    "npm fund". To start the server type in console "npm start". 

    The webpage can be found on http://localhost:${port} where port is set to 3000 by default.
*/

const express = require('express');
const { initializeDb, registerUser, loginUser } = require('./db');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


/*
This post request is for registering a new user. It gets the information from the 
registration handler upon a request and deals with the information accordingly.

It first runs the validatePassword function which checks whether the password meets
the requirements. These requirements are:
minimum eight characters, at least one letter, one number and one special character
This adds a higher level of security on passwords

It checks if the passwords match and if not sends an error message back.

otherwise it runs a function within the db.js script which writes to the database.
if the function is successful it sends a success message back. otherwise it sends an error
message back. Specifically if a username or password dont exist
*/
function validatePassword(password) {
  // This is a regex (regular expression) to check requirements of a password
  // checks for minimum eight characters, at least one letter, one number and one special character
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return regex.test(password);
}

app.post('/register', async (req, res) => {
  //Getting the information from the form
  const { Username, Password, ConfirmPassword, Firstname, Lastname, Email } = req.body;

  //Check to see if the password meets the requirements
  if (!validatePassword(Password)) {
    return res.status(400).json({
        success: false,
        message: 'Password does not meet complexity requirements. It must be at least 8 characters long, contain at least one letter, one number, and one special character.'
    });
  }
  //Checking if passwords match
  if (Password !== ConfirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  try {

    //trys to store the data to the database
    await registerUser({ Username, Password, Firstname, Lastname, Email });
    res.status(201).json({ success: true, message: "Registration successful!" });
  } catch (err) {

    //Catches any error if any occur and sends a feedback message
    if (err.message === 'Username or email already exists.') {
      return res.status(409).json({ success: false, message: err.message });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
}});

app.post('/login', async (req, res) => {
  // Getting the information from the form
  const { Username, Password } = req.body;

  try {
    // Tries to authenticate the user with the given credentials
    const user = await loginUser({ Username, Password });

    res.status(200).json({ 
      success: true, 
      message: "Login successful!", 
      user: { Username: user.username, Email: user.email }
    });

  } catch (err) {
    // Catches any error if any occur and sends a feedback message
    console.error('Error logging in:', err);

    res.status(401).json({ success: false, message: "Username or password is incorrect." });
  }
});
/*
All Get requests regarding webpages are in this section.
Follow same convention for any new webpages added.
*/
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/index.html'));
});

app.get('/forums', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/forums.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/account.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/login.html'));
});

app.get('/news', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/news.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/register.html'));
});

//Webpage not found so catches the 404 error and outputs a custom response
app.use((req, res, next) => {
  res.status(404).send("ERROR: 404 \nWebpage does not exist");
});

// Initialize the database
initializeDb().then(() => {
  // Start the server only after the DB has been initialized
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(err => console.error("Database initialization failed:", err));