const fs = require('fs');
const util = require('util');
const csvParse = require('csv-parse');
const csvParsePromise = util.promisify(csvParse);

euclideanDistance = (userA, userB) => {
  let sim = 0;
  let n = 0;

  for (const rA of userA.ratings) {
    for (const rB of userB.ratings) {
      if (rA.MovieId == rB.MovieId) {
        sim += Math.pow(rA.Rating - rB.Rating, 2);
        n++;
      }
    }
  }

  // No ratings in common, return 0
  if (n === 0) {
    return 0;
  }

  // Calculate inverted score
  return 1 / (1 + sim);
};
getUserRatings = async () => {
  const users = await getUsers();
  const ratings = await getRatings();
  const userRatings = [];

  for (const user of users) {
    const userRatingsRow = [];
    for (const rating of ratings) {
      if (rating.UserId === user.UserId) {
        userRatingsRow.push(rating);
      }
    }
    userRatings.push({ ...user, ratings: userRatingsRow });
  }
  return userRatings;
};

getMovie = async movieId => {
  const movies = await getMovies();
  for (const movie of movies) {
    if (movieId === movie.MovieId) {
      return movie;
    }
  }
  return null;
};

getUser = async userId => {
  const userRatings = await getUserRatings();
  for (const userRating of userRatings) {
    if (userId === userRating.UserId) {
      return userRating;
    }
  }
  return null;
};

getCompareUserScores = async (userId, count) => {
  const userRatings = await getUserRatings();
  const currentUser = await getUser(userId);
  // console.log(currentUser);
  const comparedUsers = [];
  for (const userRating of userRatings) {
    if (currentUser && currentUser.UserId != userRating.UserId) {
      comparedUsers.push({
        ...userRating,
        similarity:
          Math.round((await euclideanDistance(currentUser, userRating)) * 100) /
          100,
      });
    }
  }
  comparedUsers.sort((b, a) => {
    if (a.similarity < b.similarity) return -1;
    if (a.similarity > b.similarity) return 1;
    return 0;
  });
  return { comparedUsers: comparedUsers.slice(0, count), ...currentUser };
};
getWeightedMovieScores = async (userId, count) => {
  const comparedUserScores = await getCompareUserScores(userId, count);
  const weightedUserScores = [];
  const movies = await getMovies();
  // console.log('movies', movies);
  const weightedRatings = [];
  for (const user of comparedUserScores.comparedUsers) {
    // console.log(user);
    for (const rating of user.ratings) {
      const movie = await getMovie(rating.MovieId);
      weightedRatings.push({
        user: user.Name,
        sim: user.similarity,
        ...movie,
        weightedScore: Math.round(rating.Rating * user.similarity * 100) / 100,
        rating: rating.Rating,
      });
    }
    // console.log(user);
    // console.log('weightedRatings', weightedRatings);
    // weightedUserScores.push({
    //   name: user.Name,
    //   id: user.UserId,
    //   weightedRatings,
    // });
    weightedUserScores.push(weightedRatings);
  }

  fs.writeFile(
    'test.json',
    JSON.stringify(weightedRatings, null, 2),
    function() {}
  );

  const weightedMovieScores = [];

  for (const movie of movies) {
    let weightedScoreSum = 0;
    let similaritySum = 0;
    for (const ws of weightedRatings) {
      if (movie.MovieId === ws.MovieId) {
        console.log('ws', ws);
      }
    }
  }

  return {
    user: { id: comparedUserScores.UserId, name: comparedUserScores.Name },
    weightedUserScores,
    users: await getUsers(),
  };
  return weightedUserScores;
};

getWeightedMovieScores2 = async (userId, count) => {
  const comparedUserScores = await getCompareUserScores(userId, count);
  const weightedUserScores = [];
  const movies = await getMovies();
  console.log('movies', movies);
  for (const user of comparedUserScores.comparedUsers) {
    const weightedRatings = [];
    for (const rating of user.ratings) {
      weightedRatings.push({
        ...rating,
        weightedScore: Math.round(rating.Rating * user.similarity * 100) / 100,
      });
    }
    console.table(weightedRatings);
    console.log();
    weightedUserScores.push({
      ...user,
      weightedRatings,
    });
  }

  fs.writeFile(
    'test.json',
    JSON.stringify(weightedUserScores, null, 2),
    function() {}
  );

  const weightedMovieScores = [];

  for (const movie of movies) {
  }

  return {
    user: { id: comparedUserScores.UserId, name: comparedUserScores.Name },
    weightedUserScores,
    users: await getUsers(),
  };
  return weightedUserScores;
};
getMovies = async () => {
  const data = await fs.promises.readFile(
    __dirname + '/../db/example/movies.csv',
    // __dirname + '/../db/movies.csv',
    'utf8',
    async function(err, csvData) {
      return csvData;
    }
  );
  return await csvParsePromise(data, {
    columns: true,
    delimiter: ';',
    quote: '',
    trim: true,
  });
};

getUsers = async () => {
  const data = await fs.promises.readFile(
    __dirname + '/../db/example/users.csv',
    // __dirname + '/../db/users.csv',
    'utf8',
    async function(err, csvData) {
      return csvData;
    }
  );
  return await csvParsePromise(data, {
    columns: true,
    delimiter: ';',
    quote: '',
    trim: true,
  });
};

getRatings = async () => {
  const data = await fs.promises.readFile(
    __dirname + '/../db/example/ratings.csv',
    // __dirname + '/../db/ratings.csv',
    'utf8',
    async function(err, csvData) {
      return csvData;
    }
  );
  return await csvParsePromise(data, {
    columns: true,
    delimiter: ';',
    quote: '',
    trim: true,
  });
};
getWeightedMovieScores(4);
module.exports = {
  euclideanDistance,
  getUserRatings,
  getMovies,
  getUsers,
  getRatings,
  getWeightedMovieScores,
  getCompareUserScores,
};
