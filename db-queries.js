const pool = require('./db');

/*

EXAMPLE OF DOING QUERIES FOR WHEN WE GET AROUND TO DOING THEM

const getUsers = async () => {
    const res = await pool.query('SELECT * FROM users');
    return res.rows;
  };
  
  const addUser = async (username, password, email) => {
    const res = await pool.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *',
      [username, password, email]
    );
    return res.rows[0];
  };
  
  module.exports = {
    getUsers,
    addUser,
  };

*/