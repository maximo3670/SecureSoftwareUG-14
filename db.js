require('dotenv').config({ path: './db.env' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

//Database values. Can be different depending on what you chose when
//downloading postgres. Edit them in db.env to your own values
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});
 
/*

Initializing the database. 
first it makes a connection to the database.

It then makes a new schema for the tables to be stored in.
Then creates the necessary tables for everything the webpage needs.
ONLY DOES THESE IF THEY DO NOT EXIST ALREADY

It sends feedback to the console whether it was a success.

*/
async function initializeDb() {
    try {
      await pool.connect(); 
      console.log('Connected to PostgreSQL Database');

      const client = await pool.connect();
  
      try {
        // Create a custom schema
        const schemaName = 'secureSoftware'; 
        await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
    
        //Creating the tables if not already existing
        //Users table
        const usersTableQuery = `
          CREATE TABLE IF NOT EXISTS ${schemaName}.users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
          );
        `;
    
        await client.query(usersTableQuery);

        //blog table
        const blogTableQuery = `
        CREATE TABLE IF NOT EXISTS ${schemaName}.blogs (
          blogID SERIAL PRIMARY KEY,
          userID INTEGER NOT NULL,
          title VARCHAR(255) NOT NULL,
          text TEXT NOT NULL,
          FOREIGN KEY (userID) REFERENCES ${schemaName}.users(id)
        );
      `;

      await client.query(blogTableQuery);

        //Error handling
        console.log('Schema and tables created successfully.');
      } catch (err) {
        console.error('Error creating schema or tables:', err);
      } finally {
        client.release();
      }

    //more error handling
    } catch (err) {
      console.error('Error during DB initialization:', err.stack);
      throw err;
    }
}
  
/*

Function for registering a new user.
This function will store the new user into the database.
It has checks to make sure the user is using a unique username and email as there
cannot be duplicates.

Password hashing and salting is done here.
Utilises the Bycrpt hashing function and uses a salt number as 10

*/
async function registerUser({ Username, Password, Firstname, Lastname, Email }) {
  try {
    // Check if username or email already exists
    const existingUserQuery = 'SELECT 1 FROM securesoftware.users WHERE username = $1 OR email = $2;';
    const existingUser = await pool.query(existingUserQuery, [Username, Email]);

    if (existingUser.rowCount > 0) {
      // If a user is found, throw an error
      throw new Error('Username or email already exists.');
    }

    // Hashing the password with Bycrypt
    // Increases security of the password
    const salt = 10;
    const hashedPassword = await bcrypt.hash(Password, salt);

    //Inserting the data into the database
    const insertQuery = 'INSERT INTO securesoftware.users(username, first_name, last_name, email, password) VALUES($1, $2, $3, $4, $5) RETURNING *;';
    const user = await pool.query(insertQuery, [Username, Firstname, Lastname, Email, hashedPassword]);

    return user.rows[0];
  } catch (err) {
    // Log the error and re-throw it to be handled by the caller
    console.error('Error in registerUser:', err);
    throw err;
  }
}

//jon
async function loginUser({ Username, Password }) {
  try {
    // Assume Username can be either a username or an email for login purposes
    const userQuery = 'SELECT * FROM securesoftware.users WHERE username = $1 OR email = $1;';
    const userResult = await pool.query(userQuery, [Username]);

    if (userResult.rowCount > 0) {
      const user = userResult.rows[0];

      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(Password, user.password);
      if (isMatch) {
        // Passwords match
        console.log("Login Sucesful");
        return { success: true, message: "Login successful!", user: { Username: user.username, Email: user.email } };
      } else {
        // Passwords do not match
        throw new Error('Username or password does not match.');
      }
    } else {
      // No user found with the provided username/email
      throw new Error('Username or password does not match.');
    }
  } catch (err) {
    console.error('Error in loginUser:', err);
    throw err;
  }
}

async function writeBlog({ title, text }){
  try {
 
    const queryText = `
      INSERT INTO securesoftware.blogs (userID, title, text)
      VALUES ($1, $2, $3)`; 

    const userID = 1;
    // Execute the query
    const values = [userID, title, text];
    await pool.query(queryText, values);

    console.log('Blog post created successfully');
  } catch (err) {
    console.error('Error writing blog:', err);
    throw err; // Re-throw the error to be handled by the caller
  }
}

//exporting the functions
module.exports = { pool, initializeDb, registerUser,  loginUser, writeBlog};