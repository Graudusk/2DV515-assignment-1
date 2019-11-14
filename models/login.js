/**
 * A module exporting functions to access the bank database.
 */
'use strict';

module.exports = {
  doLogin: doLogin,
};

const db = require('../db/database');

async function doLogin(email, password) {
  console.log(email, password);
  let sql = `SELECT * FROM users WHERE email = ? AND password = ?;`;
  let res;
  // console.log(username);
  db.get(sql, [email, password], (err, row) => {
    if (err) {
      console.log({
        errors: {
          status: 500,
          source: '/login',
          title: 'Database error',
          detail: err.message,
        },
      });
    }
    console.log('row', row);
    res = row;
    return row;
  });
  return res;
}
