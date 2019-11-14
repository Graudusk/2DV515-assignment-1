const express = require('express');
const router = express.Router();
const db = require('../db/database');
const movies = require('../models/movies');
const fetch = require('node-fetch');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', async (req, res) => {
  let data = {
    title: 'Home',
  };

  const users = await fetch('http://localhost:1337/users').then(response =>
    response.json()
  );

  console.log(users);

  res.render('home', {
    data: { ...data, users: users },
    page: req.url,
  });
});

router.get('/recommend-user', async (req, res) => {
  let data = {
    user: req.query.user || null,
    count: req.query.count || null,
  };
  console.log(data);
  const usersRatings = await fetch(
    'http://localhost:1337/recommend-user?' + new URLSearchParams(data)
  ).then(response => response.json());

  data = { ...data, title: 'recommend' };

  res.render('recommendUser', {
    data: { ...data, ...usersRatings },
    page: req.url,
  });
});

router.get('/recommend-movies', async (req, res) => {
  let data = {
    user: req.query.user,
    count: req.query.count,
  };
  const moviesRatings = await fetch(
    'http://localhost:1337/recommend-movies?' + new URLSearchParams(data)
  ).then(response => response.json());

  data = { ...data, title: 'recommend' };

  res.render('recommendMovies', {
    data: { ...data, ...moviesRatings },
    page: req.url,
  });
});

module.exports = router;
