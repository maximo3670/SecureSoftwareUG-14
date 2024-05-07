/*
App.js

Author: Max Neil
Created: 21/03/2024
Description: 
    This script is to handle all nodeJs queries such as Get requests for the website
    It handles changing webpages and SQL database queries.

    make sure nodeJs is installed in your computer.
    To start the server type in console "npm start". 

    The webpage can be found on http://localhost:${port} where port is set to 3000 by default.
*/

const express = require('express');
const { registerUser, getBlogById, loginUser, writeBlog, readBlogs, getUserId, userBlogs, updateBlogText, deleteBlog } = require('./db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const uuidv4 = require('uuid').v4;
const csrf = require('csurf');
const sessions = {};
const csrfProtection = csrf({ cookie: true });
app.use(express.urlencoded({ extended: true }));

//Package to prevent XSS attacks
//DOM Purify
const { JSDOM } = require('jsdom');
const window = (new JSDOM('')).window;
const DOMPurify = require('dompurify')(window);
app.use(bodyParser.json());
app.use(cookieParser());
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

function checkSession(req, res, next) {
  const sessionId = req.cookies ? req.cookies.session : undefined;

  console.log("SessionID: ", sessionId);
  console.log("Sessions:", sessions);

  if (sessionId && sessions[sessionId]) {
    console.log("UserID: ", sessions[sessionId].UserID);
    next();
  } else {
    res.status(401).json({ success: false, message: "This action requires you to be logged in." });
  }
}

app.post('/register', csrfProtection, async (req, res) => {
  //Getting the information from the form
  let { Username, Password, ConfirmPassword, Firstname, Lastname, Email } = req.body;

  //XSS protection
  Username = DOMPurify.sanitize(Username);
  Password = DOMPurify.sanitize(Password);
  ConfirmPassword = DOMPurify.sanitize(ConfirmPassword);
  Firstname = DOMPurify.sanitize(Firstname);
  Lastname = DOMPurify.sanitize(Lastname);
  Email = DOMPurify.sanitize(Email);

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

app.post('/writeblog', csrfProtection, checkSession, async (req, res) => {    //checkSession ran

  let { title, text } = req.body;

  const sessionId = req.cookies ? req.cookies.session : undefined;

  console.log("SessinID:", sessionId)

  //XSS protection
  title = DOMPurify.sanitize(title);
  text = DOMPurify.sanitize(text);

  console.log({ title: title, text: text, UserID: sessions[sessionId].UserID })

  try {
    await writeBlog({ userID: sessions[sessionId].UserID, title: title, text: text });
    res.status(201).json({ success: true, message: "Blog uploaded." });
} catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
}
})

const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration));

app.post('/login', csrfProtection, async (req, res) => {

  const startTime = Date.now();

  //Getting the information from the form
  let { Username, Password } = req.body;

  //XSS protection
  Username = DOMPurify.sanitize(Username);
  Password = DOMPurify.sanitize(Password);

  try {
    //Tries to authenticate the user with the given credentials
    const user = await loginUser({ Username, Password });

    //Creates Token for specific user's session
    const sessionId = uuidv4();

    //Grabs user ID from database
    const UserID = await getUserId(Username);

    sessions[sessionId] = { Username, UserID };

    //Sends a response with JSON data and sets a cookie
    res.cookie('session', sessionId, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 300000 // Expires after 5 minutes of idle time
    });

    const elapsedTime = Date.now() - startTime;
    const fixedDelay = 1000; 
    if (elapsedTime < fixedDelay) {
      await delay(fixedDelay - elapsedTime);
    }

    //console.log(sessionId)  //debugging to verify if sessionID is the same as the cookie in browser
    res.status(200).json({ 
      success: true, 
      message: "Login successful!", 
      user: { Username: user.username, Email: user.email }
    });

  } catch (err) {
    // Catches any error if any occur and sends a feedback message
    console.error('Error logging in:', err);

     // Calculate remaining delay
     const elapsedTime = Date.now() - startTime;
     const fixedDelay = 1000; // same fixed delay as above
     if (elapsedTime < fixedDelay) {
       await delay(fixedDelay - elapsedTime);
     }

    res.status(401).json({ success: false, message: "Username or password is incorrect." });
  }
});


app.get('/readBlogs', async (req, res) => {
  try {
    // Extract search query from query parameters, default to empty string if not provided
    const searchQuery = req.query.search || '';

    //Sanitizes the input to protect against XSS
    const cleanSearch = DOMPurify.sanitize(searchQuery);

    const blogs = await readBlogs(cleanSearch);
    res.json(blogs); // Send the fetched blogs as JSON
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching blogs.');
  }
});

app.get('/readUserBlogs', checkSession, async (req, res) => {
  const sessionId = req.cookies ? req.cookies.session : undefined;
  try {
    const blogs = await userBlogs({userID: sessions[sessionId].UserID});
    res.json(blogs); // Send the fetched blogs as JSON
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching blogs.');
  }
});

app.get('/logout', (req, res) => {
  const sessionId = req.cookies.session;
  if (sessionId) {
      delete sessions[sessionId]; 
      res.clearCookie('session'); 
  }
  res.redirect('/login');
});

app.post('/deleteBlog', checkSession, csrfProtection,async (req, res) => {
  const { blogid } = req.body;

  try {
      if (!blogid) {
          return res.status(400).json({ success: false, message: 'Blog ID must be provided.' });
      }

      await deleteBlog({ blogid });
      res.json({ success: true, message: 'Blog successfully deleted.' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to delete blog.' });
  }
});

app.post('/updateBlog', checkSession, csrfProtection, async (req, res) => {
  let { blogid, title, text } = req.body;

  title = DOMPurify.sanitize(title);
  text = DOMPurify.sanitize(text);

  try {
      if (!blogid || !title || !text) {
          return res.status(400).json({ success: false, message: 'Blog ID, title and text must be provided.' });
      }

      await updateBlogText({ blogid, title, text });
      res.json({ success: true, message: 'Blog text successfully updated.' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to update blog text.' });
  }
});

/*
All Get requests regarding webpages are in this section.
Follow same convention for any new webpages added.
*/

app.get('/getBlog/:blogid', csrfProtection, async (req, res) => {
  const { blogid } = req.params;
  try {
      const blog = await getBlogById({ blogid }); // This function should query your database
      if (!blog) {
          return res.status(404).json({ success: false, message: 'Blog not found.' });
      }
      res.json(blog);
  } catch (err) {
      console.error('Failed to retrieve blog:', err);
      res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get('/check-session', (req, res) => {
  const loggedIn = req.cookies && req.cookies.session && sessions[req.cookies.session];
  res.json({ loggedIn: loggedIn });
});

app.get('/account/updateBlog', checkSession, csrfProtection, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/updateBlog.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/index.html'));
});

app.get('/blogs',  csrfProtection, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/blogs.html'));
});

app.get('/writeblog', csrfProtection, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/writeblog.html'));
});

app.get('/account', csrfProtection, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/account.html'));
});

app.get('/login', csrfProtection, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/login.html'));
});

app.get('/news', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/news.html'));
});

app.get('/register', csrfProtection, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/register.html'));
});

//Webpage not found so catches the 404 error and outputs a custom response
app.use((req, res, next) => {
  res.status(404).send("ERROR: 404 \nWebpage does not exist");
});

module.exports = app;