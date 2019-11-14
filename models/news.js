/**
 * A module exporting functions to access the bank database.
 */
'use strict';

module.exports = {
  getArticle: getArticle,
  getArticles: getArticles,
};

const db = require('../db/database');

async function getArticle(slug) {
  let sql = `SELECT * FROM articles WHERE slug = ?;`;
  let res;
  // console.log(username);
  db.get(sql, [slug], (err, row) => {
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
    res = row;
    return row;
  });
  return res;
}

async function getArticles() {
  let sql = `SELECT * FROM articles;`;
  let res;
  // console.log(username);
  db.all(sql, (err, row) => {
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
    console.log(row);
    return row;
  });
}
