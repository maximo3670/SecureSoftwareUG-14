require('dotenv').config({ path: './db.env' });
const { Pool } = require('pg');

//Database values. Can be different depending on what you chose when
//downloading postgres. Edit them in db.env to your own values
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});
 
//Function to initialise the database
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
        const queryText = `
          CREATE TABLE IF NOT EXISTS ${schemaName}.users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
          );
        `;
    
        await client.query(queryText);

        //Error handling
        console.log('Schema and users table created successfully.');
      } catch (err) {
        console.error('Error creating schema or users table:', err);
      } finally {
        client.release();
      }

    //more error handling
    } catch (err) {
      console.error('Error during DB initialization:', err.stack);
      throw err;
    }
}
  
//exporting the functions
module.exports = { pool, initializeDb };

