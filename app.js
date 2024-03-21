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
const { initializeDb } = require('./db');
const path = require('path');
const app = express();
const port = 3000;

//EXAMPLE FOR WHEN WE IMPLEMENT IT
//const { getUsers, addUser } = require('./queries');

app.use(express.static(path.join(__dirname, 'public')));

/*

DATABASE QUERY EXAMPLE

app.get('/users', async (req, res) => {
  const users = await getUsers();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const { username, password, email } = req.body;
  const newUser = await addUser(username, password, email);
  res.status(201).json(newUser);
}); 
*/

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