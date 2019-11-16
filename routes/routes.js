const express = require('express');
const router = express.Router();
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

  res.render('home', {
    data: { ...data, users: users },
    page: req.url,
  });
});

router.get('/recommend-user', async (req, res) => {
  let data = {
    user: req.query.user,
    count: req.query.count,
  };
  const usersRatings = await fetch(
    'http://localhost:1337/recommend-user?' + new URLSearchParams(data)
  ).then(response => response.json());

  res.render('recommendUser', {
    data: { ...data, ...usersRatings, title: 'Recommended Users' },
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

  res.render('recommendMovies', {
    data: { ...data, ...moviesRatings, title: 'Recommended Movies' },
    page: req.url,
  });
});

module.exports = router;
