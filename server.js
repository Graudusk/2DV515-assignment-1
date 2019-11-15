const express = require('express');
const app = express();
const port = 1337;
const path = require('path');
const movies = require('./models/movies');
const routes = require('./routes/routes.js');

app.get('/user-ratings', async (req, res) => {
  const data = await movies.getUserRatings();
  console.log(data);
  res.end(JSON.stringify(data, null, 2));
});

app.get('/users', async (req, res) => {
  const data = await movies.getUsers();
  console.log(data);
  res.end(JSON.stringify(data, null, 2));
});

app.get('/movies', async (req, res) => {
  const data = await movies.getMovies();
  console.log(data);
  res.end(JSON.stringify(data, null, 2));
});

app.get('/ratings', async (req, res) => {
  const data = await movies.getRatings();
  console.log(data);
  res.end(JSON.stringify(data, null, 2));
});

app.get('/recommend-user', async (req, res) => {
  const data = await movies.getUserRecommendations(
    req.query.user,
    req.query.count
  );
  res.end(JSON.stringify(data, null, 2));
});

app.get('/recommend-movies', async (req, res) => {
  const data = await movies.getWeightedMovieScores(
    req.query.user,
    req.query.count
  );
  res.end(JSON.stringify(data, null, 2));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
